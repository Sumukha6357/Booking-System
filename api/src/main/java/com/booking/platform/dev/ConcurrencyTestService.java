package com.booking.platform.dev;

import com.booking.platform.dto.ConcurrencyTestRequest;
import com.booking.platform.dto.ConcurrencyTestResponse;
import com.booking.platform.dto.HoldBookingRequest;
import com.booking.platform.service.BookingService;
import com.booking.platform.service.PaymentService;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class ConcurrencyTestService {

    private final BookingService bookingService;
    private final PaymentService paymentService;

    public ConcurrencyTestService(BookingService bookingService, PaymentService paymentService) {
        this.bookingService = bookingService;
        this.paymentService = paymentService;
    }

    public ConcurrencyTestResponse run(ConcurrencyTestRequest request, Authentication authentication) {
        int threads = request.parallelism();
        var executor = Executors.newFixedThreadPool(threads);

        HoldBookingRequest holdRequest = new HoldBookingRequest(request.listingId(), request.checkIn(), request.checkOut());
        List<Callable<Boolean>> bookingTasks = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            bookingTasks.add(() -> {
                try {
                    bookingService.hold(holdRequest, authentication, null);
                    return true;
                } catch (Exception ignored) {
                    return false;
                }
            });
        }

        int bookingSuccess = 0;
        String bookingId = null;
        try {
            List<Future<Boolean>> results = executor.invokeAll(bookingTasks);
            for (Future<Boolean> result : results) {
                if (Boolean.TRUE.equals(result.get())) {
                    bookingSuccess++;
                }
            }
            if (bookingSuccess > 0) {
                bookingId = bookingService.listTenantBookings().stream()
                    .filter(b -> b.getListingId().equals(request.listingId()) && b.getCheckIn().equals(request.checkIn()) && b.getCheckOut().equals(request.checkOut()))
                    .findFirst()
                    .map(b -> b.getId().toString())
                    .orElse(null);
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Concurrency test failed", ex);
        }

        int paymentSuccess = 0;
        if (bookingId != null) {
            final String bookedId = bookingId;
            List<Callable<Boolean>> paymentTasks = new ArrayList<>();
            for (int i = 0; i < threads; i++) {
                paymentTasks.add(() -> {
                    try {
                        paymentService.capturePayment(java.util.UUID.fromString(bookedId));
                        return true;
                    } catch (Exception ignored) {
                        return false;
                    }
                });
            }

            try {
                List<Future<Boolean>> payResults = executor.invokeAll(paymentTasks);
                for (Future<Boolean> result : payResults) {
                    if (Boolean.TRUE.equals(result.get())) {
                        paymentSuccess++;
                    }
                }
            } catch (Exception ex) {
                throw new IllegalStateException("Payment concurrency test failed", ex);
            }
        }

        executor.shutdown();
        return new ConcurrencyTestResponse(
            bookingSuccess,
            paymentSuccess,
            threads,
            bookingSuccess == 1,
            paymentSuccess == 1
        );
    }
}
