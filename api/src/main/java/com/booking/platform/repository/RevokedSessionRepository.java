package com.booking.platform.repository;

import com.booking.platform.domain.RevokedSession;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedSessionRepository extends JpaRepository<RevokedSession, UUID> {
    boolean existsBySessionIdAndExpiresAtAfter(UUID sessionId, Instant now);

    List<RevokedSession> findByUserIdAndTenantIdAndExpiresAtAfter(UUID userId, UUID tenantId, Instant now);

    List<RevokedSession> findByTenantIdAndExpiresAtAfter(UUID tenantId, Instant now);
}
