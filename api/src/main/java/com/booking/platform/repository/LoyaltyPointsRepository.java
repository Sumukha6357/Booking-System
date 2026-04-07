package com.booking.platform.repository;

import com.booking.platform.domain.LoyaltyPoints;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoyaltyPointsRepository extends JpaRepository<LoyaltyPoints, UUID> {
    Optional<LoyaltyPoints> findByUserIdAndTenantId(UUID userId, UUID tenantId);
}
