package com.booking.platform.dto;

import com.booking.platform.domain.Role;
import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    long accessTokenExpiresIn,
    UUID userId,
    UUID tenantId,
    Role role
) {
}
