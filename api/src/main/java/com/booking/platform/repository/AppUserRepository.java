package com.booking.platform.repository;

import com.booking.platform.domain.AppUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmail(String email);
    List<AppUser> findByTenantId(UUID tenantId);
    Optional<AppUser> findByIdAndTenantId(UUID id, UUID tenantId);
}
