package com.booking.platform.web;

import com.booking.platform.domain.Tenant;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.TenantRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @GetMapping("/{id}")
    public Tenant get(@PathVariable UUID id) {
        return tenantRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Tenant not found"));
    }

    @PutMapping("/{id}")
    public Tenant update(@PathVariable UUID id, @Valid @RequestBody Tenant tenant) {
        Tenant existing = tenantRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Tenant not found"));
        
        // Update fields
        if (tenant.getName() != null) {
            existing.setName(tenant.getName());
        }
        // Note: slug is unique, so we usually don't allow changing it via standard update
        
        return tenantRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        Tenant existing = tenantRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Tenant not found"));
        tenantRepository.delete(existing);
    }
}
