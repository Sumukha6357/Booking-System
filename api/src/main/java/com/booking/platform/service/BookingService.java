package com.booking.platform.service;

import com.booking.platform.domain.AuditLog;
import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.domain.Listing;
import com.booking.platform.dto.HoldBookingRequest;
import com.booking.platform.dto.HoldBookingResponse;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.redis.RedisKeys;
import com.booking.platform.repository.AuditLogRepository;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.repository.ListingRepository;
import com.booking.platform.tenant.TenantContext;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;
    private final PricingService pricingService;
    private final LockService lockService;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;

    public BookingService(
        BookingRepository bookingRepository,
        ListingRepository listingRepository,
        PricingService pricingService,
        LockService lockService,
        NotificationService notificationService,
        AuditLogRepository auditLogRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.listingRepository = listingRepository;
        this.pricingService = pricingService;
        this.lockService = lockService;
        this.notificationService = notificationService;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public HoldBookingResponse hold(HoldBookingRequest request, Authentication authentication, String couponCode) {
        UUID tenantId = TenantContext.getRequired();
        UUID userId = UUID.fromString((String) authentication.getPrincipal());
        Listing listing = listingRepository.findByIdAndTenantId(request.listingId(), tenantId)
            .orElseThrow(() -> new NotFoundException("Listing not found"));

        String lockKey = lockKey(request.listingId(), request.checkIn().toString(), request.checkOut().toString());
        if (!lockService.acquire(lockKey, userId.toString())) {
            throw new ConflictException("Listing is being reserved by another request");
        }

        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
            tenantId,
            request.listingId(),
            request.checkIn(),
            request.checkOut(),
            List.of(BookingState.HELD, BookingState.CONFIRMED, BookingState.COMPLETED)
        );
        if (!overlapping.isEmpty()) {
            lockService.release(lockKey);
            throw new ConflictException("Date range already booked or held");
        }

        Booking booking = new Booking();
        booking.setTenantId(tenantId);
        booking.setListingId(request.listingId());
        booking.setUserId(userId);
        booking.setCheckIn(request.checkIn());
        booking.setCheckOut(request.checkOut());
        booking.setState(BookingState.HELD);
        booking.setHoldExpiresAt(Instant.now().plus(lockService.getHoldTtl()));
        booking.setPrice(pricingService.quotePrice(listing.getBasePrice(), request.checkIn(), request.checkOut(), overlapping, couponCode));

        Booking saved = bookingRepository.save(booking);
        writeAudit(tenantId, "BOOKING_HELD", "bookingId=" + saved.getId());
        notificationService.bookingUpdated(saved);

        return new HoldBookingResponse(saved.getId(), saved.getHoldExpiresAt(), saved.getPrice(), saved.getState().name());
    }

    @Transactional
    public Booking confirm(UUID bookingId) {
        UUID tenantId = TenantContext.getRequired();
        Booking booking = getTenantBooking(bookingId);

        if (booking.getState() != BookingState.HELD) {
            throw new ConflictException("Only HELD bookings can be confirmed");
        }
        if (booking.getHoldExpiresAt() != null && booking.getHoldExpiresAt().isBefore(Instant.now())) {
            booking.setState(BookingState.CANCELLED);
            bookingRepository.save(booking);
            throw new ConflictException("Booking hold expired");
        }

        booking.setState(BookingState.CONFIRMED);
        booking.setHoldExpiresAt(null);
        Booking saved = bookingRepository.save(booking);

        lockService.release(lockKey(saved.getListingId(), saved.getCheckIn().toString(), saved.getCheckOut().toString()));
        writeAudit(tenantId, "BOOKING_CONFIRMED", "bookingId=" + saved.getId());
        notificationService.bookingUpdated(saved);
        return saved;
    }

    @Transactional
    public Booking cancel(UUID bookingId) {
        UUID tenantId = TenantContext.getRequired();
        Booking booking = getTenantBooking(bookingId);

        if (booking.getState() != BookingState.HELD && booking.getState() != BookingState.CONFIRMED) {
            throw new ConflictException("Booking cannot be cancelled in current state");
        }

        booking.setState(BookingState.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        lockService.release(lockKey(saved.getListingId(), saved.getCheckIn().toString(), saved.getCheckOut().toString()));
        writeAudit(tenantId, "BOOKING_CANCELLED", "bookingId=" + saved.getId());
        notificationService.bookingUpdated(saved);
        return saved;
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireHeldBookings() {
        List<Booking> expired = bookingRepository.findByStateAndHoldExpiresAtBefore(BookingState.HELD, Instant.now());
        expired.forEach(booking -> {
            booking.setState(BookingState.CANCELLED);
            booking.setHoldExpiresAt(null);
            bookingRepository.save(booking);
            lockService.release(lockKey(booking.getListingId(), booking.getCheckIn().toString(), booking.getCheckOut().toString()));
            notificationService.bookingUpdated(booking);
        });
    }

    public List<Booking> listTenantBookings() {
        return bookingRepository.findByTenantId(TenantContext.getRequired());
    }

    public Booking getTenantBooking(UUID bookingId) {
        UUID tenantId = TenantContext.getRequired();
        return bookingRepository.findByIdAndTenantId(bookingId, tenantId)
            .orElseThrow(() -> new NotFoundException("Booking not found"));
    }

    private void writeAudit(UUID tenantId, String action, String payload) {
        AuditLog log = new AuditLog();
        log.setTenantId(tenantId);
        log.setAction(action);
        log.setPayload(payload);
        auditLogRepository.save(log);
    }

    private String lockKey(UUID listingId, String from, String to) {
        return RedisKeys.bookingLock(listingId, from, to);
    }
}
