package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.Listing;
import com.booking.platform.domain.PaymentTransaction;
import com.booking.platform.dto.InvoiceDetail;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.repository.ListingRepository;
import com.booking.platform.repository.PaymentTransactionRepository;
import com.booking.platform.tenant.TenantContext;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class InvoicingService {

    private final BookingRepository bookingRepository;
    private final ListingRepository listingRepository;
    private final PaymentTransactionRepository paymentRepository;

    public InvoicingService(BookingRepository bookingRepository, ListingRepository listingRepository, PaymentTransactionRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.listingRepository = listingRepository;
        this.paymentRepository = paymentRepository;
    }

    public InvoiceDetail getInvoiceByBooking(UUID bookingId) {
        UUID tenantId = TenantContext.getRequired();
        Booking booking = bookingRepository.findByIdAndTenantId(bookingId, tenantId)
            .orElseThrow(() -> new NotFoundException("Booking not found"));
        
        Listing listing = listingRepository.findById(booking.getListingId())
            .orElseThrow(() -> new NotFoundException("Listing not found"));

        PaymentTransaction payment = paymentRepository.findByBookingId(bookingId)
            .orElse(null);

        BigDecimal subtotal = booking.getPrice();
        BigDecimal discount = BigDecimal.ZERO; 
        BigDecimal total = payment != null ? payment.getAmount() : subtotal;

        return new InvoiceDetail(
            payment != null ? payment.getId() : null,
            bookingId,
            listing.getTitle(),
            booking.getCheckIn(),
            booking.getCheckOut(),
            subtotal,
            discount,
            total,
            payment != null ? payment.getGatewayStatus() : "DRAFT",
            payment != null ? payment.getCapturedAt() : null
        );
    }
}
