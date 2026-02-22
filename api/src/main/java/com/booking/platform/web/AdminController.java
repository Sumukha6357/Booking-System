package com.booking.platform.web;

import com.booking.platform.domain.SecurityAuditLog;
import com.booking.platform.dto.IntegrationStatusResponse;
import com.booking.platform.service.AuthService;
import com.booking.platform.service.IntegrationStatusService;
import com.booking.platform.service.RolePermissionService;
import com.booking.platform.service.SecurityAuditService;
import com.booking.platform.tenant.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final IntegrationStatusService integrationStatusService;
    private final RolePermissionService rolePermissionService;
    private final AuthService authService;
    private final SecurityAuditService securityAuditService;

    public AdminController(
        IntegrationStatusService integrationStatusService,
        RolePermissionService rolePermissionService,
        AuthService authService,
        SecurityAuditService securityAuditService
    ) {
        this.integrationStatusService = integrationStatusService;
        this.rolePermissionService = rolePermissionService;
        this.authService = authService;
        this.securityAuditService = securityAuditService;
    }

    @GetMapping("/integration-status")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public IntegrationStatusResponse integrationStatus(Authentication authentication) {
        rolePermissionService.requirePermission(authentication, "integration:read");
        return integrationStatusService.current();
    }

    @PostMapping("/users/{userId}/disable")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public void disableUser(@PathVariable UUID userId, Authentication authentication, HttpServletRequest request) {
        rolePermissionService.requirePermission(authentication, "user:disable");
        authService.disableUser(userId, request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    @PostMapping("/users/{userId}/logout-all")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public int logoutAllUserSessions(
        @PathVariable UUID userId,
        @RequestParam(defaultValue = "ADMIN_GLOBAL_LOGOUT") String reason,
        Authentication authentication,
        HttpServletRequest request
    ) {
        rolePermissionService.requirePermission(authentication, "session:revoke");
        return authService.globalLogoutUser(TenantContext.getRequired(), userId, reason, request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    @PostMapping("/tenants/{tenantId}/logout-all")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public int logoutAllTenantSessions(
        @PathVariable UUID tenantId,
        @RequestParam(defaultValue = "TENANT_GLOBAL_LOGOUT") String reason,
        Authentication authentication,
        HttpServletRequest request
    ) {
        rolePermissionService.requirePermission(authentication, "session:revoke");
        return authService.globalLogoutTenant(tenantId, reason, request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public List<SecurityAuditLog> auditLogs(Authentication authentication) {
        rolePermissionService.requirePermission(authentication, "audit:read");
        return securityAuditService.listTenantLogs(TenantContext.getRequired());
    }
}
