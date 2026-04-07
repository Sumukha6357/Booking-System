package com.booking.platform.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "disputes")
public class Dispute {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private UUID bookingId;

    @Column(nullable = false)
    private UUID filedByUserId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DisputeType type;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisputeStatus status = DisputeStatus.OPEN;

    @Column(length = 2000)
    private String resolution;

    @Column
    private UUID resolvedByUserId;

    @Column
    private Instant resolvedAt;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public UUID getFiledByUserId() { return filedByUserId; }
    public void setFiledByUserId(UUID filedByUserId) { this.filedByUserId = filedByUserId; }
    public DisputeType getType() { return type; }
    public void setType(DisputeType type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public DisputeStatus getStatus() { return status; }
    public void setStatus(DisputeStatus status) { this.status = status; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public UUID getResolvedByUserId() { return resolvedByUserId; }
    public void setResolvedByUserId(UUID resolvedByUserId) { this.resolvedByUserId = resolvedByUserId; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public enum DisputeType {
        REFUND_REQUEST,
        PROPERTY_ISSUE,
        HOST_COMMUNICATION,
        PRICING_DISPUTE,
        CANCELLATION_DISPUTE,
        OTHER
    }

    public enum DisputeStatus {
        OPEN,
        IN_REVIEW,
        RESOLVED,
        REJECTED
    }
}
