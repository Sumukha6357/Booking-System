package com.booking.platform.repository;

import com.booking.platform.domain.Review;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByListingIdOrderByCreatedAtDesc(UUID listingId);
    List<Review> findByTenantId(UUID tenantId);
    boolean existsByBookingIdAndUserId(UUID bookingId, UUID userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.listingId = :listingId")
    Double averageRatingForListing(UUID listingId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listingId = :listingId")
    long countForListing(UUID listingId);
}
