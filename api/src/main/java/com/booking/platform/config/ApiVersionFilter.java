package com.booking.platform.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(1)
public class ApiVersionFilter extends OncePerRequestFilter {

    public static final String API_VERSION_HEADER = "Accept-Version";
    public static final String CURRENT_API_VERSION = "v1";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String version = request.getHeader(API_VERSION_HEADER);
        if (version == null || version.isBlank()) {
            version = CURRENT_API_VERSION;
        }
        request.setAttribute("apiVersion", version);
        response.setHeader(API_VERSION_HEADER, CURRENT_API_VERSION);
        filterChain.doFilter(request, response);
    }
}