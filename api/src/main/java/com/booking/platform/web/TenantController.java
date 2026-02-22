package com.booking.platform.web;

import com.booking.platform.domain.Tenant;
import com.booking.platform.repository.TenantRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    private final TenantRepository tenantRepository;

    public TenantController(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @PostMapping
    public Tenant create(@Valid @RequestBody Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    @GetMapping
    public List<Tenant> list() {
        return tenantRepository.findAll();
    }
}
