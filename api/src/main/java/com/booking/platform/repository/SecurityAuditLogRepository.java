package com.booking.platform.repository;

import com.booking.platform.domain.SecurityAuditLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, UUID> {
    List<SecurityAuditLog> findTop200ByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
