package com.booking.platform.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "reviews")
@Getter
@Setter
public class Review {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private UUID listingId;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private UUID bookingId;

    @Column(nullable = false)
    private int rating; // 1-5

    @Column(length = 2000)
    private String comment;

    @Column(length = 200)
    private String guestName;

    @Column(length = 2000)
    private String hostResponse;

    @Column
    private Instant hostResponseAt;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }
}
