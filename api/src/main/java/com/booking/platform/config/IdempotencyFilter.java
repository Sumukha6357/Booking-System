package com.booking.platform.config;

import com.booking.platform.domain.IdempotencyRecord;
import com.booking.platform.service.HashingService;
import com.booking.platform.service.IdempotencyService;
import com.booking.platform.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.util.StreamUtils;
import org.springframework.web.util.ContentCachingResponseWrapper;
import org.springframework.web.filter.OncePerRequestFilter;

public class IdempotencyFilter extends OncePerRequestFilter {

    private static final String IDEMPOTENCY_HEADER = "Idempotency-Key";

    private final IdempotencyService idempotencyService;
    private final HashingService hashingService;

    public IdempotencyFilter(IdempotencyService idempotencyService, HashingService hashingService) {
        this.idempotencyService = idempotencyService;
        this.hashingService = hashingService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        return !("/api/bookings/hold".equals(path)
            || path.matches("/api/payments/bookings/[^/]+/initiate")
            || path.matches("/api/payments/bookings/[^/]+/confirm"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        UUID tenantId = TenantContext.getOrNull();
        if (tenantId == null) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "Missing tenant context for idempotent request");
            return;
        }

        String key = request.getHeader(IDEMPOTENCY_HEADER);
        if (key == null || key.isBlank()) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "Idempotency-Key header is required");
            return;
        }

        byte[] bodyBytes = StreamUtils.copyToByteArray(request.getInputStream());
        String path = request.getRequestURI();
        String fingerprint = hashingService.sha256(request.getMethod() + "|" + path + "|" + new String(bodyBytes, StandardCharsets.UTF_8));

        IdempotencyRecord existing = idempotencyService.lookup(tenantId, key).orElse(null);
        if (existing != null) {
            idempotencyService.assertFingerprintMatches(existing, fingerprint);
            idempotencyService.touch(existing);
            writeStoredResponse(response, existing);
            return;
        }

        CachedBodyRequestWrapper wrappedRequest = new CachedBodyRequestWrapper(request, bodyBytes);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        filterChain.doFilter(wrappedRequest, wrappedResponse);

        int status = wrappedResponse.getStatus();
        String responseBody = new String(wrappedResponse.getContentAsByteArray(), StandardCharsets.UTF_8);
        String contentType = wrappedResponse.getContentType();

        if (status < 500) {
            IdempotencyRecord saved = idempotencyService.save(
                tenantId,
                key,
                request.getMethod(),
                path,
                fingerprint,
                status,
                responseBody,
                contentType
            );
            idempotencyService.assertFingerprintMatches(saved, fingerprint);
        }

        wrappedResponse.copyBodyToResponse();
    }

    private void writeStoredResponse(HttpServletResponse response, IdempotencyRecord existing) throws IOException {
        response.setStatus(existing.getResponseStatus());
        if (existing.getContentType() != null) {
            response.setContentType(existing.getContentType());
        }
        if (existing.getResponseBody() != null) {
            response.getWriter().write(existing.getResponseBody());
        }
    }

    private static class CachedBodyRequestWrapper extends HttpServletRequestWrapper {

        private final byte[] body;

        CachedBodyRequestWrapper(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream inputStream = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return inputStream.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                    // Synchronous request body wrapper for idempotency checks.
                }

                @Override
                public int read() {
                    return inputStream.read();
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }
    }
}
