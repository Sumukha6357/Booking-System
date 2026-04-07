package com.booking.platform.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

@Service
public class IpRateLimitService {

    private final RateLimitService rateLimitService;

    public IpRateLimitService(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    public boolean allowRequest(HttpServletRequest request, int limitPerMinute) {
        String clientIp = getClientIp(request);
        return rateLimitService.allow("ip:" + clientIp, limitPerMinute);
    }

    public boolean allowAuthRequest(HttpServletRequest request) {
        String clientIp = getClientIp(request);
        return rateLimitService.allow("auth_ip:" + clientIp, 10);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) {
            return xri;
        }
        return request.getRemoteAddr();
    }
}