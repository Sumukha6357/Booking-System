package com.booking.platform.web;

import com.booking.platform.domain.WishlistItem;
import com.booking.platform.service.WishlistService;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<WishlistItem> getMyWishlist(Authentication auth) {
        return wishlistService.getMyWishlist(auth);
    }

    @PostMapping("/{listingId}")
    public WishlistItem add(@PathVariable UUID listingId, Authentication auth) {
        return wishlistService.addToWishlist(listingId, auth);
    }

    @DeleteMapping("/{listingId}")
    public void remove(@PathVariable UUID listingId, Authentication auth) {
        wishlistService.removeFromWishlist(listingId, auth);
    }

    @GetMapping("/check/{listingId}")
    public boolean check(@PathVariable UUID listingId, Authentication auth) {
        return wishlistService.isInWishlist(listingId, auth);
    }
}
