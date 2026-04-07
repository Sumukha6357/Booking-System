package com.booking.platform.web;

import com.booking.platform.domain.Dispute;
import com.booking.platform.repository.DisputeRepository;
import com.booking.platform.tenant.TenantContext;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/disputes")
public class DisputeController {

    private final DisputeRepository disputeRepository;

    public DisputeController(DisputeRepository disputeRepository) {
        this.disputeRepository = disputeRepository;
    }

    public record CreateDisputeRequest(
        UUID bookingId,
        Dispute.DisputeType type,
        String description
    ) {}

    public record ResolveDisputeRequest(
        String resolution,
        Dispute.DisputeStatus status
    ) {}

    @PostMapping
    public Dispute create(@Valid @RequestBody CreateDisputeRequest request, Authentication auth) {
        Dispute dispute = new Dispute();
        dispute.setTenantId(TenantContext.getRequired());
        dispute.setBookingId(request.bookingId());
        dispute.setFiledByUserId(UUID.fromString((String) auth.getPrincipal()));
        dispute.setType(request.type());
        dispute.setDescription(request.description());
        dispute.setStatus(Dispute.DisputeStatus.OPEN);
        return disputeRepository.save(dispute);
    }

    @GetMapping("/my")
    public List<Dispute> myDisputes(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return disputeRepository.findByFiledByUserIdAndTenantId(userId, TenantContext.getRequired());
    }

    @GetMapping("/booking/{bookingId}")
    public List<Dispute> getByBooking(@PathVariable UUID bookingId) {
        return disputeRepository.findByBookingId(bookingId);
    }

    @GetMapping
    public List<Dispute> list() {
        return disputeRepository.findByTenantId(TenantContext.getRequired());
    }

    @PostMapping("/{id}/resolve")
    public Dispute resolve(@PathVariable UUID id, @RequestBody ResolveDisputeRequest request, Authentication auth) {
        Dispute dispute = disputeRepository.findById(id)
            .orElseThrow();
        dispute.setResolution(request.resolution());
        dispute.setStatus(request.status());
        dispute.setResolvedByUserId(UUID.fromString((String) auth.getPrincipal()));
        dispute.setResolvedAt(Instant.now());
        return disputeRepository.save(dispute);
    }
}
