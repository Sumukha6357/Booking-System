package com.booking.platform.service;

import com.booking.platform.domain.SystemError;
import com.booking.platform.repository.SystemErrorRepository;
import com.booking.platform.tenant.TenantContext;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SystemErrorService {

    private final SystemErrorRepository repository;

    public SystemErrorService(SystemErrorRepository repository) {
        this.repository = repository;
    }

    public void record(Exception ex, String route, Integer statusCode) {
        SystemError error = new SystemError();
        error.setTenantId(TenantContext.getOrNull());
        error.setUserId(currentUserId());
        error.setRoute(route);
        error.setStatusCode(statusCode);
        error.setMessage(ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage());
        error.setStackTrace(stackTrace(ex));
        error.setCorrelationId(MDC.get("correlationId"));
        repository.save(error);
    }

    private UUID currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        try {
            return UUID.fromString(String.valueOf(authentication.getPrincipal()));
        } catch (Exception ignored) {
            return null;
        }
    }

    private String stackTrace(Exception ex) {
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }
}
