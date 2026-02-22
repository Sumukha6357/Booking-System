package com.booking.platform.web;

import com.booking.platform.dev.ConcurrencyTestService;
import com.booking.platform.dto.ConcurrencyTestRequest;
import com.booking.platform.dto.ConcurrencyTestResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dev")
public class DevController {

    private final ConcurrencyTestService concurrencyTestService;

    public DevController(ConcurrencyTestService concurrencyTestService) {
        this.concurrencyTestService = concurrencyTestService;
    }

    @PostMapping("/concurrency-test")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ConcurrencyTestResponse concurrencyTest(@Valid @RequestBody ConcurrencyTestRequest request, Authentication authentication) {
        return concurrencyTestService.run(request, authentication);
    }
}
