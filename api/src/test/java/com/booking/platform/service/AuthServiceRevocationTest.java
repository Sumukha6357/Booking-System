package com.booking.platform.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.booking.platform.domain.AppUser;
import com.booking.platform.domain.RefreshToken;
import com.booking.platform.domain.Role;
import com.booking.platform.dto.LoginRequest;
import com.booking.platform.dto.RefreshRequest;
import com.booking.platform.repository.AppUserRepository;
import com.booking.platform.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceRevocationTest {

    @Mock
    private AppUserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private HashingService hashingService;
    @Mock
    private RevocationService revocationService;
    @Mock
    private SecurityAuditService securityAuditService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        authService = new AuthService(
            userRepository,
            refreshTokenRepository,
            passwordEncoder,
            jwtService,
            hashingService,
            revocationService,
            securityAuditService
        );
    }

    @Test
    void logoutRevokesRefreshToken() {
        RefreshToken token = new RefreshToken();
        token.setSessionId(UUID.randomUUID());
        token.setTenantId(UUID.randomUUID());
        token.setUserId(UUID.randomUUID());
        token.setExpiresAt(Instant.now().plusSeconds(600));

        when(hashingService.sha256("refresh-token")).thenReturn("hash");
        when(refreshTokenRepository.findByTokenHash("hash")).thenReturn(Optional.of(token));

        authService.logout(new RefreshRequest("refresh-token"), "LOGOUT", "127.0.0.1", "test-agent");

        verify(revocationService).revokeRefreshToken(token, "LOGOUT");
    }

    @Test
    void refreshRotatesAndRevokesPreviousToken() {
        UUID sessionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();

        Claims claims = org.mockito.Mockito.mock(Claims.class);
        when(claims.get("typ")).thenReturn("refresh");
        when(jwtService.parse("refresh-token")).thenReturn(claims);

        RefreshToken existing = new RefreshToken();
        existing.setSessionId(sessionId);
        existing.setUserId(userId);
        existing.setTenantId(tenantId);
        existing.setExpiresAt(Instant.now().plusSeconds(600));
        existing.setRevoked(false);
        existing.setJti("old-jti");

        AppUser user = new AppUser();
        user.setId(userId);
        user.setTenantId(tenantId);
        user.setRole(Role.PLATFORM_ADMIN);
        user.setEnabled(true);

        when(hashingService.sha256("refresh-token")).thenReturn("hash-old");
        when(refreshTokenRepository.findByTokenHash("hash-old")).thenReturn(Optional.of(existing));
        when(revocationService.isSessionRevoked(sessionId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(any(), any(), any(), any())).thenReturn("access");
        when(jwtService.generateRefreshToken(any(), any(), any(), any(), any())).thenReturn("refresh-new");
        when(hashingService.sha256("refresh-new")).thenReturn("hash-new");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = authService.refresh(new RefreshRequest("refresh-token"), "127.0.0.1", "ua");

        assertNotNull(response);
        verify(refreshTokenRepository).save(argThat(RefreshToken::isRevoked));
    }

    @Test
    void adminDisableRevokesAllUserSessions() {
        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();

        AppUser user = new AppUser();
        user.setId(userId);
        user.setTenantId(tenantId);
        user.setEnabled(true);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        authService.disableUser(userId, "127.0.0.1", "ua");

        verify(revocationService).globalLogoutUser(tenantId, userId, "ADMIN_DISABLE");
        verify(userRepository).save(argThat(u -> !u.isEnabled()));
    }

    @Test
    void loginRejectsDisabledUser() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setEnabled(false);
        user.setTenantId(UUID.randomUUID());
        user.setRole(Role.USER);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));

        org.junit.jupiter.api.Assertions.assertThrows(
            RuntimeException.class,
            () -> authService.login(new LoginRequest("user@test.com", "pass"), "127.0.0.1", "ua", "device")
        );
    }
}
