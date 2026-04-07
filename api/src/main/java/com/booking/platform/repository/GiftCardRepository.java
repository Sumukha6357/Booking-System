package com.booking.platform.repository;

import com.booking.platform.domain.GiftCard;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GiftCardRepository extends JpaRepository<GiftCard, UUID> {
    Optional<GiftCard> findByCodeAndTenantId(String code, UUID tenantId);
    Optional<GiftCard> findByCodeAndActiveTrue(String code);
}
