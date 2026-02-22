package com.booking.platform.service;

import com.booking.platform.domain.AppUser;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.AppUserRepository;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class RolePermissionService {

    private final JdbcTemplate jdbcTemplate;
    private final AppUserRepository appUserRepository;

    public RolePermissionService(JdbcTemplate jdbcTemplate, AppUserRepository appUserRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.appUserRepository = appUserRepository;
    }

    public boolean hasPermission(UUID userId, String permissionCode) {
        AppUser user = appUserRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Integer count = jdbcTemplate.queryForObject(
            """
                SELECT count(1)
                FROM app_users u
                JOIN roles r ON r.name = u.role
                JOIN role_permissions rp ON rp.role_id = r.id
                JOIN permissions p ON p.id = rp.permission_id
                WHERE u.id = ? AND p.code = ?
                """,
            Integer.class,
            user.getId(),
            permissionCode
        );
        return count != null && count > 0;
    }

    public void requirePermission(Authentication authentication, String permissionCode) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ConflictException("Unauthenticated");
        }
        UUID userId = UUID.fromString(String.valueOf(authentication.getPrincipal()));
        if (!hasPermission(userId, permissionCode)) {
            throw new ConflictException("Missing permission: " + permissionCode);
        }
    }
}
