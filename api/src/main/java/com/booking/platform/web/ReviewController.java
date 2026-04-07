package com.booking.platform.web;

import com.booking.platform.dto.ReviewRequest;
import com.booking.platform.dto.ReviewResponse;
import com.booking.platform.service.ReviewService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ReviewResponse submit(@Valid @RequestBody ReviewRequest request, Authentication authentication) {
        return reviewService.submitReview(request, authentication);
    }

    @GetMapping("/listing/{listingId}")
    public List<ReviewResponse> getForListing(@PathVariable UUID listingId) {
        return reviewService.getListingReviews(listingId);
    }

    @GetMapping("/listing/{listingId}/summary")
    public ReviewService.RatingSummary getSummary(@PathVariable UUID listingId) {
        return reviewService.getRatingSummary(listingId);
    }

    @GetMapping("/tenant")
    public List<ReviewResponse> getForTenant() {
        return reviewService.getTenantReviews();
    }

    @PostMapping("/{reviewId}/respond")
    public ReviewResponse respond(@PathVariable UUID reviewId, @RequestBody String response, Authentication authentication) {
        return reviewService.respondToReview(reviewId, response, authentication);
    }
}
