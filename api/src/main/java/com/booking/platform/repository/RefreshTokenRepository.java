package com.booking.platform.repository;

import com.booking.platform.domain.RefreshToken;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    Optional<RefreshToken> findByJti(String jti);
    List<RefreshToken> findByUserIdAndTenantIdAndRevokedFalse(UUID userId, UUID tenantId);
    List<RefreshToken> findByTenantIdAndRevokedFalse(UUID tenantId);
}
