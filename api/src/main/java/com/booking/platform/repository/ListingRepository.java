package com.booking.platform.repository;

import com.booking.platform.domain.Listing;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByTenantIdAndActiveTrue(UUID tenantId);
    Optional<Listing> findByIdAndTenantId(UUID id, UUID tenantId);
}
