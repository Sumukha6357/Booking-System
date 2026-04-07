package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.domain.Review;
import com.booking.platform.domain.Role;
import com.booking.platform.dto.ReviewRequest;
import com.booking.platform.dto.ReviewResponse;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.BookingRepository;
import com.booking.platform.repository.ReviewRepository;
import com.booking.platform.tenant.TenantContext;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(ReviewRepository reviewRepository, BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public ReviewResponse submitReview(ReviewRequest request, Authentication authentication) {
        UUID tenantId = TenantContext.getRequired();
        UUID userId = UUID.fromString((String) authentication.getPrincipal());

        // Only guests who have completed the stay can review
        Booking booking = bookingRepository.findByIdAndTenantId(request.bookingId(), tenantId)
            .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (booking.getState() != BookingState.COMPLETED && booking.getState() != BookingState.CONFIRMED) {
            throw new ConflictException("Only completed bookings can be reviewed");
        }
        if (!booking.getUserId().equals(userId)) {
            throw new ConflictException("You can only review your own bookings");
        }
        if (reviewRepository.existsByBookingIdAndUserId(request.bookingId(), userId)) {
            throw new ConflictException("You have already reviewed this booking");
        }

        Review review = new Review();
        review.setTenantId(tenantId);
        review.setListingId(booking.getListingId());
        review.setUserId(userId);
        review.setBookingId(request.bookingId());
        review.setRating(Math.max(1, Math.min(5, request.rating())));
        review.setComment(request.comment());
        review.setGuestName(request.guestName());

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    public List<ReviewResponse> getListingReviews(UUID listingId) {
        return reviewRepository.findByListingIdOrderByCreatedAtDesc(listingId)
            .stream().map(this::toResponse).toList();
    }

    public record RatingSummary(double averageRating, long totalReviews) {}

    public RatingSummary getRatingSummary(UUID listingId) {
        Double avg = reviewRepository.averageRatingForListing(listingId);
        long count = reviewRepository.countForListing(listingId);
        return new RatingSummary(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0, count);
    }

    public List<ReviewResponse> getTenantReviews() {
        return reviewRepository.findByTenantId(TenantContext.getRequired())
            .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReviewResponse respondToReview(UUID reviewId, String response, Authentication authentication) {
        UUID tenantId = TenantContext.getRequired();
        
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new NotFoundException("Review not found"));
        
        if (!review.getTenantId().equals(tenantId)) {
            throw new ConflictException("Review not found");
        }
        
        if (review.getHostResponse() != null) {
            throw new ConflictException("Review already has a response");
        }

        // Verify the user is a vendor or admin
        boolean isVendorOrAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_VENDOR") || a.getAuthority().equals("ROLE_ADMIN"));
        if (!isVendorOrAdmin) {
            throw new ConflictException("Only vendors can respond to reviews");
        }

        review.setHostResponse(response);
        review.setHostResponseAt(Instant.now());
        
        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(r.getId(), r.getListingId(), r.getRating(),
            r.getComment(), r.getGuestName(), r.getCreatedAt(), r.getHostResponse(), r.getHostResponseAt());
    }
}
