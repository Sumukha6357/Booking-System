package com.booking.platform.auth;

import com.booking.platform.service.JwtService;
import com.booking.platform.service.RevocationService;
import com.booking.platform.repository.AppUserRepository;
import io.jsonwebtoken.Claims;
import com.booking.platform.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final RevocationService revocationService;
    private final AppUserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, RevocationService revocationService, AppUserRepository userRepository) {
        this.jwtService = jwtService;
        this.revocationService = revocationService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtService.parse(token);
                if (!"access".equals(String.valueOf(claims.get("typ")))) {
                    filterChain.doFilter(request, response);
                    return;
                }
                String userId = claims.getSubject();
                String role = String.valueOf(claims.get("role"));
                String tenantId = String.valueOf(claims.get("tenantId"));
                String sessionId = String.valueOf(claims.get("sid"));

                UUID parsedUserId = UUID.fromString(userId);
                if (sessionId != null && !"null".equals(sessionId) && revocationService.isSessionRevoked(UUID.fromString(sessionId))) {
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }
                if (userRepository.findById(parsedUserId).map(u -> !u.isEnabled()).orElse(true)) {
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                TenantContext.set(UUID.fromString(tenantId));
                MDC.put("userId", userId);
                var auth = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("userId");
        }
    }
}
