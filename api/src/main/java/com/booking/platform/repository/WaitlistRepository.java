package com.booking.platform.repository;

import com.booking.platform.domain.WaitlistItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WaitlistRepository extends JpaRepository<WaitlistItem, UUID> {
    List<WaitlistItem> findByListingIdAndNotifiedFalse(UUID listingId);
    List<WaitlistItem> findByUserIdAndTenantId(UUID userId, UUID tenantId);
}
