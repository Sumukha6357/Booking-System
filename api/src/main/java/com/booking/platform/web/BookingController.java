package com.booking.platform.web;

import com.booking.platform.domain.Booking;
import com.booking.platform.dto.HoldBookingRequest;
import com.booking.platform.dto.HoldBookingResponse;
import com.booking.platform.dto.ModifyBookingRequest;
import com.booking.platform.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/hold")
    public HoldBookingResponse hold(
        @Valid @RequestBody HoldBookingRequest request,
        @RequestParam(required = false) String coupon,
        Authentication authentication
    ) {
        return bookingService.hold(request, authentication, coupon);
    }

    @GetMapping
    public List<Booking> list() {
        return bookingService.listTenantBookings();
    }

    @GetMapping("/my")
    public List<Booking> listMyBookings(Authentication authentication) {
        return bookingService.listUserBookings(authentication);
    }

    @GetMapping("/{bookingId}")
    public Booking get(@PathVariable UUID bookingId) {
        return bookingService.getTenantBooking(bookingId);
    }

    @PostMapping("/{bookingId}/confirm")
    public Booking confirm(@PathVariable UUID bookingId) {
        return bookingService.confirm(bookingId);
    }

    @PostMapping("/{bookingId}/complete")
    public Booking complete(@PathVariable UUID bookingId) {
        return bookingService.complete(bookingId);
    }

    @DeleteMapping("/{bookingId}")
    public Booking cancel(@PathVariable UUID bookingId, @RequestParam(required = false) String reason) {
        return bookingService.cancel(bookingId, reason);
    }

    @PutMapping("/{bookingId}")
    public Booking modify(@PathVariable UUID bookingId, @Valid @RequestBody ModifyBookingRequest request) {
        return bookingService.modify(bookingId, request);
    }
}
