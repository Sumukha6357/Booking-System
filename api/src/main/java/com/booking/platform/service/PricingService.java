package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

    public BigDecimal quotePrice(BigDecimal basePrice, LocalDate checkIn, LocalDate checkOut, List<Booking> existingBookings, String couponCode) {
        long nights = Math.max(1, ChronoUnit.DAYS.between(checkIn, checkOut));

        BigDecimal multiplier = BigDecimal.ONE
            .multiply(weekendMultiplier(checkIn, checkOut))
            .multiply(seasonalMultiplier(checkIn))
            .multiply(demandMultiplier(existingBookings));

        BigDecimal total = basePrice.multiply(multiplier).multiply(BigDecimal.valueOf(nights));
        return applyCoupon(total, couponCode);
    }

    private BigDecimal weekendMultiplier(LocalDate checkIn, LocalDate checkOut) {
        boolean includesWeekend = checkIn.datesUntil(checkOut)
            .anyMatch(date -> date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY);
        return includesWeekend ? new BigDecimal("1.15") : BigDecimal.ONE;
    }

    private BigDecimal seasonalMultiplier(LocalDate checkIn) {
        Month month = checkIn.getMonth();
        if (month == Month.JUNE || month == Month.JULY || month == Month.DECEMBER) {
            return new BigDecimal("1.20");
        }
        return BigDecimal.ONE;
    }

    private BigDecimal demandMultiplier(List<Booking> existingBookings) {
        long highDemandCount = existingBookings.stream()
            .filter(b -> b.getState() == BookingState.CONFIRMED)
            .count();
        return highDemandCount >= 10 ? new BigDecimal("1.10") : BigDecimal.ONE;
    }

    private BigDecimal applyCoupon(BigDecimal total, String couponCode) {
        if (couponCode != null && couponCode.equalsIgnoreCase("SAVE10")) {
            return total.multiply(new BigDecimal("0.90"));
        }
        return total;
    }
}
