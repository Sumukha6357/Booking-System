package com.booking.platform.web;

import com.booking.platform.domain.Listing;
import com.booking.platform.service.ListingService;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor")
public class VendorController {

    private final ListingService listingService;

    public VendorController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping("/listings")
    public List<Listing> getVendorListings() {
        // This would typically filter by the logged-in user's listings
        // For now, return all active listings for the tenant
        return listingService.getListingsForVendor();
    }
}
