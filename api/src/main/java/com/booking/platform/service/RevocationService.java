package com.booking.platform.service;

import com.booking.platform.domain.RefreshToken;
import com.booking.platform.domain.RevokedSession;
import com.booking.platform.repository.RefreshTokenRepository;
import com.booking.platform.repository.RevokedSessionRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RevocationService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final RevokedSessionRepository revokedSessionRepository;

    public RevocationService(RefreshTokenRepository refreshTokenRepository, RevokedSessionRepository revokedSessionRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.revokedSessionRepository = revokedSessionRepository;
    }

    public boolean isSessionRevoked(UUID sessionId) {
        if (sessionId == null) {
            return false;
        }
        return revokedSessionRepository.existsBySessionIdAndExpiresAtAfter(sessionId, Instant.now());
    }

    @Transactional
    public void revokeRefreshToken(RefreshToken token, String reason) {
        token.setRevoked(true);
        token.setRevokedReason(reason);
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);
        if (token.getSessionId() != null) {
            revokeSession(token.getSessionId(), token.getTenantId(), token.getUserId(), reason, token.getExpiresAt());
        }
    }

    @Transactional
    public int globalLogoutUser(UUID tenantId, UUID userId, String reason) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserIdAndTenantIdAndRevokedFalse(userId, tenantId);
        tokens.forEach(token -> revokeRefreshToken(token, reason));
        return tokens.size();
    }

    @Transactional
    public int globalLogoutTenant(UUID tenantId, String reason) {
        List<RefreshToken> tokens = refreshTokenRepository.findByTenantIdAndRevokedFalse(tenantId);
        tokens.forEach(token -> revokeRefreshToken(token, reason));
        return tokens.size();
    }

    private void revokeSession(UUID sessionId, UUID tenantId, UUID userId, String reason, Instant expiresAt) {
        if (revokedSessionRepository.existsById(sessionId)) {
            return;
        }
        RevokedSession revoked = new RevokedSession();
        revoked.setSessionId(sessionId);
        revoked.setTenantId(tenantId);
        revoked.setUserId(userId);
        revoked.setReason(reason);
        revoked.setExpiresAt(expiresAt);
        revokedSessionRepository.save(revoked);
    }
}
