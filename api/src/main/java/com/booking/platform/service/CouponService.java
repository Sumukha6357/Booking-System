package com.booking.platform.service;

import com.booking.platform.domain.Coupon;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.CouponRepository;
import com.booking.platform.tenant.TenantContext;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public record CouponValidation(boolean valid, BigDecimal discountAmount, String message) {}

    @Transactional
    public CouponValidation validate(String code, BigDecimal bookingValue) {
        UUID tenantId = TenantContext.getRequired();
        var coupon = couponRepository.findByCodeAndTenantIdAndActiveTrue(code, tenantId);
        if (coupon.isEmpty()) {
            return new CouponValidation(false, BigDecimal.ZERO, "Coupon not found or expired");
        }
        Coupon c = coupon.get();

        if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(Instant.now())) {
            return new CouponValidation(false, BigDecimal.ZERO, "Coupon has expired");
        }
        if (c.getMaxUses() != null && c.getUsedCount() >= c.getMaxUses()) {
            return new CouponValidation(false, BigDecimal.ZERO, "Coupon has reached its usage limit");
        }
        if (c.getMinBookingValue() != null && bookingValue.compareTo(c.getMinBookingValue()) < 0) {
            return new CouponValidation(false, BigDecimal.ZERO,
                "Minimum booking value of $" + c.getMinBookingValue() + " required");
        }

        BigDecimal discount = "PERCENTAGE".equals(c.getDiscountType())
            ? bookingValue.multiply(c.getDiscountValue()).divide(BigDecimal.valueOf(100))
            : c.getDiscountValue();

        return new CouponValidation(true, discount.min(bookingValue), "Coupon applied successfully");
    }

    @Transactional
    public void markUsed(String code) {
        UUID tenantId = TenantContext.getRequired();
        couponRepository.findByCodeAndTenantIdAndActiveTrue(code, tenantId)
            .ifPresent(c -> {
                c.setUsedCount(c.getUsedCount() + 1);
                if (c.getMaxUses() != null && c.getUsedCount() >= c.getMaxUses()) {
                    c.setActive(false);
                }
                couponRepository.save(c);
            });
    }

    public Coupon createCoupon(Coupon coupon) {
        coupon.setTenantId(TenantContext.getRequired());
        if (couponRepository.findByCodeAndTenantIdAndActiveTrue(coupon.getCode(), coupon.getTenantId()).isPresent()) {
            throw new ConflictException("A coupon with this code already exists");
        }
        return couponRepository.save(coupon);
    }

    public void deleteCoupon(UUID couponId) {
        Coupon coupon = couponRepository.findById(couponId)
            .orElseThrow(() -> new NotFoundException("Coupon not found"));
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    public List<Coupon> listCoupons() {
        return couponRepository.findByTenantId(TenantContext.getRequired());
    }
}
