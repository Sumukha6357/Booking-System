package com.booking.platform.web;

import com.booking.platform.dto.AuthResponse;
import com.booking.platform.dto.LoginRequest;
import com.booking.platform.dto.RefreshRequest;
import com.booking.platform.dto.RegisterRequest;
import com.booking.platform.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpServletRequest) {
        return authService.register(request, httpServletRequest.getRemoteAddr(), httpServletRequest.getHeader("User-Agent"));
    }

    @PostMapping("/login")
    public AuthResponse login(
        @Valid @RequestBody LoginRequest request,
        @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
        HttpServletRequest httpServletRequest
    ) {
        return authService.login(request, httpServletRequest.getRemoteAddr(), httpServletRequest.getHeader("User-Agent"), deviceId);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request, HttpServletRequest httpServletRequest) {
        return authService.refresh(request, httpServletRequest.getRemoteAddr(), httpServletRequest.getHeader("User-Agent"));
    }

    @PostMapping("/logout")
    public void logout(
        @Valid @RequestBody RefreshRequest request,
        @RequestParam(defaultValue = "LOGOUT") String reason,
        HttpServletRequest httpServletRequest
    ) {
        authService.logout(request, reason, httpServletRequest.getRemoteAddr(), httpServletRequest.getHeader("User-Agent"));
    }
}
