package com.booking.platform.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "loyalty_points")
public class LoyaltyPoints {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private int totalPoints = 0;

    @Column(nullable = false)
    private int lifetimePoints = 0;

    @Column
    private String tier = "BRONZE";

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant lastEarnedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
    public int getLifetimePoints() { return lifetimePoints; }
    public void setLifetimePoints(int lifetimePoints) { this.lifetimePoints = lifetimePoints; }
    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getLastEarnedAt() { return lastEarnedAt; }
    public void setLastEarnedAt(Instant lastEarnedAt) { this.lastEarnedAt = lastEarnedAt; }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }
}
