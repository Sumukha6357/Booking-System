package com.booking.platform.dto;

import com.booking.platform.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RegisterRequest(
    @NotNull UUID tenantId,
    @NotBlank @Email String email,
    @NotBlank String password,
    @NotNull Role role
) {
}
