package com.booking.platform.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long latency = System.currentTimeMillis() - start;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth != null ? String.valueOf(auth.getPrincipal()) : "anonymous";
            String tenantId = request.getHeader("X-Tenant-Id") != null ? request.getHeader("X-Tenant-Id") : "none";
            String correlationId = MDC.get("correlationId");

            log.info(
                "request tenantId={} userId={} route={} status={} latencyMs={} correlationId={}",
                tenantId,
                userId,
                request.getRequestURI(),
                response.getStatus(),
                latency,
                correlationId
            );
        }
    }
}
