package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.dto.PriceQuoteResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PricingService {

    private final CouponService couponService;

    public PricingService(CouponService couponService) {
        this.couponService = couponService;
    }

    public BigDecimal quotePrice(BigDecimal basePrice, LocalDate checkIn, LocalDate checkOut, List<Booking> existingBookings, String couponCode) {
        long nights = Math.max(1, ChronoUnit.DAYS.between(checkIn, checkOut));

        BigDecimal multiplier = BigDecimal.ONE
            .multiply(weekendMultiplier(checkIn, checkOut))
            .multiply(seasonalMultiplier(checkIn))
            .multiply(demandMultiplier(existingBookings));

        BigDecimal total = basePrice.multiply(multiplier).multiply(BigDecimal.valueOf(nights));
        
        if (couponCode != null && !couponCode.isBlank()) {
            var validation = couponService.validate(couponCode, total);
            if (validation.valid()) {
                total = total.subtract(validation.discountAmount());
            }
        }
        
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    public PriceQuoteResponse quotePriceDetailed(BigDecimal basePrice, LocalDate checkIn, LocalDate checkOut, List<Booking> existingBookings, String couponCode) {
        long nights = Math.max(1, ChronoUnit.DAYS.between(checkIn, checkOut));

        boolean hasWeekend = hasWeekendDays(checkIn, checkOut);
        boolean hasSeasonal = isHighSeason(checkIn);
        BigDecimal demandMult = demandMultiplier(existingBookings);
        boolean hasDemand = demandMult.compareTo(BigDecimal.ONE) > 0;

        BigDecimal weekendMult = hasWeekend ? new BigDecimal("1.15") : BigDecimal.ONE;
        BigDecimal seasonalMult = hasSeasonal ? new BigDecimal("1.20") : BigDecimal.ONE;
        BigDecimal totalMultiplier = weekendMult.multiply(seasonalMult).multiply(demandMult).setScale(4, RoundingMode.HALF_UP);

        BigDecimal subtotal = basePrice.multiply(BigDecimal.valueOf(nights)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalPrice = basePrice.multiply(totalMultiplier).multiply(BigDecimal.valueOf(nights)).setScale(2, RoundingMode.HALF_UP);

        return new PriceQuoteResponse(
            checkIn,
            checkOut,
            nights,
            basePrice,
            subtotal,
            hasWeekend,
            hasSeasonal,
            hasDemand,
            totalMultiplier,
            finalPrice
        );
    }

    private boolean hasWeekendDays(LocalDate checkIn, LocalDate checkOut) {
        return checkIn.datesUntil(checkOut)
            .anyMatch(date -> date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY);
    }

    private boolean isHighSeason(LocalDate checkIn) {
        Month month = checkIn.getMonth();
        return month == Month.JUNE || month == Month.JULY || month == Month.DECEMBER;
    }

    private BigDecimal weekendMultiplier(LocalDate checkIn, LocalDate checkOut) {
        return hasWeekendDays(checkIn, checkOut) ? new BigDecimal("1.15") : BigDecimal.ONE;
    }

    private BigDecimal seasonalMultiplier(LocalDate checkIn) {
        return isHighSeason(checkIn) ? new BigDecimal("1.20") : BigDecimal.ONE;
    }

    private BigDecimal demandMultiplier(List<Booking> existingBookings) {
        long highDemandCount = existingBookings.stream()
            .filter(b -> b.getState() == BookingState.CONFIRMED || b.getState() == BookingState.COMPLETED)
            .count();
        // Dynamic multiplier: 5% increase for every 5 bookings
        double factor = 1.0 + (Math.floor(highDemandCount / 5.0) * 0.05);
        return BigDecimal.valueOf(Math.min(1.5, factor)); // Cap at 1.5x
    }
}

