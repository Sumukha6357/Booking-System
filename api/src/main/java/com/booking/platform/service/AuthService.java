package com.booking.platform.service;

import com.booking.platform.domain.AppUser;
import com.booking.platform.domain.RefreshToken;
import com.booking.platform.dto.AuthResponse;
import com.booking.platform.dto.LoginRequest;
import com.booking.platform.dto.RefreshRequest;
import com.booking.platform.dto.RegisterRequest;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.AppUserRepository;
import com.booking.platform.repository.RefreshTokenRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final HashingService hashingService;
    private final RevocationService revocationService;
    private final SecurityAuditService securityAuditService;

    public AuthService(
        AppUserRepository userRepository,
        RefreshTokenRepository refreshTokenRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        HashingService hashingService,
        RevocationService revocationService,
        SecurityAuditService securityAuditService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.hashingService = hashingService;
        this.revocationService = revocationService;
        this.securityAuditService = securityAuditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String ip, String userAgent) {
        userRepository.findByEmail(request.email().toLowerCase()).ifPresent(existing -> {
            throw new ConflictException("Email already registered");
        });

        AppUser user = new AppUser();
        user.setTenantId(request.tenantId());
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setEnabled(true);
        AppUser saved = userRepository.save(user);

        securityAuditService.logEvent("USER_REGISTERED", "APP_USER", saved.getId().toString(), null, "enabled=true", ip, userAgent);
        return issueTokens(saved, UUID.randomUUID());
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ip, String userAgent, String deviceId) {
        AppUser user = userRepository.findByEmail(request.email().toLowerCase())
            .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new ConflictException("User is disabled");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            securityAuditService.logEvent("LOGIN_FAILED", "APP_USER", user.getId().toString(), null, "invalid_credentials", ip, userAgent);
            throw new ConflictException("Invalid credentials");
        }

        UUID sessionId = deviceId == null || deviceId.isBlank()
            ? UUID.randomUUID()
            : UUID.nameUUIDFromBytes((user.getId() + ":" + deviceId).getBytes());

        securityAuditService.logEvent("LOGIN_SUCCESS", "APP_USER", user.getId().toString(), null, "session=" + sessionId, ip, userAgent);
        return issueTokens(user, sessionId);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request, String ip, String userAgent) {
        var claims = jwtService.parse(request.refreshToken());
        String tokenType = String.valueOf(claims.get("typ"));
        if (!"refresh".equals(tokenType)) {
            throw new ConflictException("Invalid refresh token type");
        }

        String tokenHash = hashingService.sha256(request.refreshToken());
        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new NotFoundException("Refresh token not found"));

        if (existing.isRevoked() || existing.getExpiresAt().isBefore(Instant.now())) {
            throw new ConflictException("Refresh token expired or revoked");
        }

        if (revocationService.isSessionRevoked(existing.getSessionId())) {
            throw new ConflictException("Session revoked");
        }

        existing.setRevoked(true);
        existing.setRevokedReason("ROTATED");
        existing.setRevokedAt(Instant.now());
        refreshTokenRepository.save(existing);

        AppUser user = userRepository.findById(existing.getUserId())
            .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new ConflictException("User disabled");
        }

        securityAuditService.logEvent("TOKEN_REFRESH", "APP_USER", user.getId().toString(), "oldJti=" + existing.getJti(), "session=" + existing.getSessionId(), ip, userAgent);
        return issueTokens(user, existing.getSessionId());
    }

    @Transactional
    public void logout(RefreshRequest request, String reason, String ip, String userAgent) {
        String tokenHash = hashingService.sha256(request.refreshToken());
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new NotFoundException("Refresh token not found"));
        revocationService.revokeRefreshToken(token, reason == null ? "LOGOUT" : reason);
        securityAuditService.logEvent("LOGOUT", "APP_USER", token.getUserId().toString(), null, "reason=" + reason, ip, userAgent);
    }

    @Transactional
    public int globalLogoutUser(UUID tenantId, UUID userId, String reason, String ip, String userAgent) {
        int revoked = revocationService.globalLogoutUser(tenantId, userId, reason);
        securityAuditService.logEvent("GLOBAL_LOGOUT_USER", "APP_USER", userId.toString(), null, "revoked=" + revoked, ip, userAgent);
        return revoked;
    }

    @Transactional
    public int globalLogoutTenant(UUID tenantId, String reason, String ip, String userAgent) {
        int revoked = revocationService.globalLogoutTenant(tenantId, reason);
        securityAuditService.logEvent("GLOBAL_LOGOUT_TENANT", "TENANT", tenantId.toString(), null, "revoked=" + revoked, ip, userAgent);
        return revoked;
    }

    @Transactional
    public void disableUser(UUID userId, String ip, String userAgent) {
        AppUser user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        if (!user.isEnabled()) {
            return;
        }
        user.setEnabled(false);
        userRepository.save(user);
        revocationService.globalLogoutUser(user.getTenantId(), user.getId(), "ADMIN_DISABLE");
        securityAuditService.logEvent("USER_DISABLED", "APP_USER", user.getId().toString(), "enabled=true", "enabled=false", ip, userAgent);
    }

    private AuthResponse issueTokens(AppUser user, UUID sessionId) {
        String jti = UUID.randomUUID().toString();
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getTenantId(), user.getRole().name(), sessionId);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getTenantId(), user.getRole().name(), sessionId, jti);

        RefreshToken token = new RefreshToken();
        token.setUserId(user.getId());
        token.setTenantId(user.getTenantId());
        token.setTokenHash(hashingService.sha256(refreshToken));
        token.setSessionId(sessionId);
        token.setJti(jti);
        token.setExpiresAt(Instant.now().plusSeconds(jwtService.getRefreshExpirySeconds()));
        token.setRevoked(false);
        refreshTokenRepository.save(token);

        return new AuthResponse(
            accessToken,
            refreshToken,
            jwtService.getAccessExpirySeconds(),
            user.getId(),
            user.getTenantId(),
            user.getRole()
        );
    }

    public UUID currentUserId(String principal) {
        return UUID.fromString(principal);
    }

    public List<RefreshToken> activeTokens(UUID tenantId, UUID userId) {
        return refreshTokenRepository.findByUserIdAndTenantIdAndRevokedFalse(userId, tenantId);
    }
}
