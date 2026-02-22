package com.booking.platform.config;

import com.booking.platform.service.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String path = request.getRequestURI();
        String ip = request.getRemoteAddr();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth != null ? String.valueOf(auth.getPrincipal()) : "anonymous";

        if (isRateLimitedPath(path)) {
            int limit = path.startsWith("/api/auth/") ? 20 : (path.contains("/search") ? 120 : 40);
            boolean allowed = rateLimitService.allow("ip:" + ip + ":path:" + path, limit)
                && rateLimitService.allow("user:" + userId + ":path:" + path, limit);
            if (!allowed) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Rate limit exceeded\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimitedPath(String path) {
        return path.equals("/api/auth/login")
            || path.equals("/api/auth/refresh")
            || path.equals("/api/bookings/hold")
            || path.matches("/api/payments/bookings/[^/]+/confirm")
            || path.matches("/api/payments/bookings/[^/]+/initiate")
            || path.equals("/api/listings/search");
    }
}
