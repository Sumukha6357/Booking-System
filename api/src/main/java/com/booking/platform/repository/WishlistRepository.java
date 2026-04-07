package com.booking.platform.repository;

import com.booking.platform.domain.WishlistItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WishlistRepository extends JpaRepository<WishlistItem, UUID> {
    List<WishlistItem> findByUserIdAndTenantId(UUID userId, UUID tenantId);
    Optional<WishlistItem> findByUserIdAndListingIdAndTenantId(UUID userId, UUID listingId, UUID tenantId);
    boolean existsByUserIdAndListingIdAndTenantId(UUID userId, UUID listingId, UUID tenantId);
}
