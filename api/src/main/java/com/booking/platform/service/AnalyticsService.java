package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.dto.AnalyticsResponse;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.tenant.TenantContext;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final BookingRepository bookingRepository;

    public AnalyticsService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public AnalyticsResponse getTenantMetrics() {
        List<Booking> bookings = bookingRepository.findByTenantId(TenantContext.getRequired());
        if (bookings.isEmpty()) {
            return new AnalyticsResponse(0.0, 0.0, BigDecimal.ZERO, 0.0);
        }

        long confirmed = bookings.stream().filter(b -> b.getState() == BookingState.CONFIRMED || b.getState() == BookingState.COMPLETED).count();
        long cancelled = bookings.stream().filter(b -> b.getState() == BookingState.CANCELLED).count();
        long held = bookings.stream().filter(b -> b.getState() == BookingState.HELD).count();

        BigDecimal avgValue = bookings.stream()
            .filter(b -> b.getState() == BookingState.CONFIRMED || b.getState() == BookingState.COMPLETED)
            .map(Booking::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(Math.max(1, confirmed)), 2, RoundingMode.HALF_UP);

        double occupancyRate = percentage(confirmed, bookings.size());
        double conversionRate = percentage(confirmed, confirmed + cancelled + held);
        double cancellationRate = percentage(cancelled, bookings.size());

        return new AnalyticsResponse(occupancyRate, conversionRate, avgValue, cancellationRate);
    }

    private double percentage(long value, long total) {
        if (total == 0) {
            return 0.0;
        }
        return (value * 100.0) / total;
    }
}
