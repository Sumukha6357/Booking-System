package com.booking.platform.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.booking.platform.domain.AppUser;
import com.booking.platform.domain.Role;
import com.booking.platform.repository.AppUserRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.jdbc.core.JdbcTemplate;

class RolePermissionServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private AppUserRepository appUserRepository;

    private RolePermissionService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new RolePermissionService(jdbcTemplate, appUserRepository);
    }

    @Test
    void hasPermissionReturnsTrueWhenRoleContainsPermission() {
        UUID userId = UUID.randomUUID();
        AppUser user = new AppUser();
        user.setId(userId);
        user.setRole(Role.PLATFORM_ADMIN);

        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jdbcTemplate.queryForObject(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.eq(Integer.class), org.mockito.ArgumentMatchers.eq(userId), org.mockito.ArgumentMatchers.eq("integration:read"))).thenReturn(1);

        assertTrue(service.hasPermission(userId, "integration:read"));
    }

    @Test
    void hasPermissionReturnsFalseWhenPermissionMissing() {
        UUID userId = UUID.randomUUID();
        AppUser user = new AppUser();
        user.setId(userId);
        user.setRole(Role.VENDOR);

        when(appUserRepository.findById(userId)).thenReturn(Optional.of(user));
        when(jdbcTemplate.queryForObject(org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.eq(Integer.class), org.mockito.ArgumentMatchers.eq(userId), org.mockito.ArgumentMatchers.eq("integration:read"))).thenReturn(0);

        assertFalse(service.hasPermission(userId, "integration:read"));
    }
}
