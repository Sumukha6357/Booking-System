package com.booking.platform.web;

import com.booking.platform.domain.Coupon;
import com.booking.platform.service.CouponService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    public Coupon create(@Valid @RequestBody Coupon coupon) {
        return couponService.createCoupon(coupon);
    }

    @GetMapping
    public List<Coupon> list() {
        return couponService.listCoupons();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
    }

    @GetMapping("/validate")
    public CouponService.CouponValidation validate(@RequestParam String code, @RequestParam BigDecimal amount) {
        return couponService.validate(code, amount);
    }
}
