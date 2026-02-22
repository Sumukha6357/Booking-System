package com.booking.platform.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpirySeconds;
    private final long refreshExpirySeconds;

    public JwtService(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.expiry-seconds}") long accessExpirySeconds,
        @Value("${app.jwt.refresh-expiry-seconds}") long refreshExpirySeconds
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirySeconds = accessExpirySeconds;
        this.refreshExpirySeconds = refreshExpirySeconds;
    }

    public String generateAccessToken(UUID userId, UUID tenantId, String role, UUID sessionId) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(userId.toString())
            .claims(Map.of("tenantId", tenantId.toString(), "role", role, "typ", "access", "sid", sessionId.toString()))
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(accessExpirySeconds)))
            .signWith(key)
            .compact();
    }

    public String generateRefreshToken(UUID userId, UUID tenantId, String role, UUID sessionId, String jti) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(userId.toString())
            .id(jti)
            .claims(Map.of("tenantId", tenantId.toString(), "role", role, "typ", "refresh", "sid", sessionId.toString()))
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusSeconds(refreshExpirySeconds)))
            .signWith(key)
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getAccessExpirySeconds() {
        return accessExpirySeconds;
    }

    public long getRefreshExpirySeconds() {
        return refreshExpirySeconds;
    }
}
