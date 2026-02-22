package com.booking.platform.service;

import com.booking.platform.domain.SecurityAuditLog;
import com.booking.platform.repository.SecurityAuditLogRepository;
import com.booking.platform.tenant.TenantContext;
import java.util.List;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SecurityAuditService {

    private final SecurityAuditLogRepository repository;

    public SecurityAuditService(SecurityAuditLogRepository repository) {
        this.repository = repository;
    }

    public void logEvent(
        String eventType,
        String entityType,
        String entityId,
        String beforeState,
        String afterState,
        String ipAddress,
        String userAgent
    ) {
        SecurityAuditLog log = new SecurityAuditLog();
        log.setTenantId(TenantContext.getOrNull());
        log.setActorUserId(currentUserId());
        log.setActorRole(currentRole());
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setEventType(eventType);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setBeforeState(beforeState);
        log.setAfterState(afterState);
        log.setCorrelationId(MDC.get("correlationId"));
        repository.save(log);
    }

    public List<SecurityAuditLog> listTenantLogs(UUID tenantId) {
        return repository.findTop200ByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        try {
            return UUID.fromString(String.valueOf(auth.getPrincipal()));
        } catch (Exception ignored) {
            return null;
        }
    }

    private String currentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null || auth.getAuthorities().isEmpty()) {
            return null;
        }
        return auth.getAuthorities().iterator().next().getAuthority();
    }
}
