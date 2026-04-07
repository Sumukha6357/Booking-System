package com.booking.platform.repository;

import com.booking.platform.domain.Coupon;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCodeAndTenantIdAndActiveTrue(String code, UUID tenantId);
    List<Coupon> findByTenantId(UUID tenantId);
}
