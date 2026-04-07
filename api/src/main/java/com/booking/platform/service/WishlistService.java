package com.booking.platform.service;

import com.booking.platform.domain.WishlistItem;
import com.booking.platform.exception.NotFoundException;
import com.booking.platform.repository.WishlistRepository;
import com.booking.platform.tenant.TenantContext;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;

    public WishlistService(WishlistRepository wishlistRepository) {
        this.wishlistRepository = wishlistRepository;
    }

    public List<WishlistItem> getMyWishlist(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        return wishlistRepository.findByUserIdAndTenantId(userId, tenantId);
    }

    public WishlistItem addToWishlist(UUID listingId, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        
        return wishlistRepository.findByUserIdAndListingIdAndTenantId(userId, listingId, tenantId)
            .orElseGet(() -> {
                WishlistItem item = new WishlistItem();
                item.setUserId(userId);
                item.setListingId(listingId);
                item.setTenantId(tenantId);
                return wishlistRepository.save(item);
            });
    }

    public void removeFromWishlist(UUID listingId, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        
        WishlistItem item = wishlistRepository.findByUserIdAndListingIdAndTenantId(userId, listingId, tenantId)
            .orElseThrow(() -> new NotFoundException("Wishlist item not found"));
        
        wishlistRepository.delete(item);
    }

    public boolean isInWishlist(UUID listingId, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        return wishlistRepository.existsByUserIdAndListingIdAndTenantId(userId, listingId, tenantId);
    }
}
