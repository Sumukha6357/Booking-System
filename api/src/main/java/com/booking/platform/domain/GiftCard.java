package com.booking.platform.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "gift_cards")
public class GiftCard {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal initialAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingAmount;

    @Column
    private UUID purchasedByUserId;

    @Column
    private UUID giftedToUserId;

    @Column
    private String recipientEmail;

    @Column(length = 500)
    private String message;

    @Column(nullable = false)
    private Instant purchasedAt;

    @Column
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public BigDecimal getInitialAmount() { return initialAmount; }
    public void setInitialAmount(BigDecimal initialAmount) { this.initialAmount = initialAmount; }
    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
    public UUID getPurchasedByUserId() { return purchasedByUserId; }
    public void setPurchasedByUserId(UUID purchasedByUserId) { this.purchasedByUserId = purchasedByUserId; }
    public UUID getGiftedToUserId() { return giftedToUserId; }
    public void setGiftedToUserId(UUID giftedToUserId) { this.giftedToUserId = giftedToUserId; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(Instant purchasedAt) { this.purchasedAt = purchasedAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (purchasedAt == null) purchasedAt = Instant.now();
    }
}
