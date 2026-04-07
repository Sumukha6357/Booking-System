package com.booking.platform.config;

import com.booking.platform.service.IpRateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(2)
public class IpRateLimitFilter extends OncePerRequestFilter {

    private final IpRateLimitService ipRateLimitService;

    public IpRateLimitFilter(IpRateLimitService ipRateLimitService) {
        this.ipRateLimitService = ipRateLimitService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/")) {
            if (!ipRateLimitService.allowAuthRequest(request)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}