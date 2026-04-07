package com.booking.platform.repository;

import com.booking.platform.domain.SavedSearch;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, UUID> {
    List<SavedSearch> findByUserIdAndTenantIdAndActive(UUID userId, UUID tenantId, boolean active);
    List<SavedSearch> findByActiveTrue();
}
