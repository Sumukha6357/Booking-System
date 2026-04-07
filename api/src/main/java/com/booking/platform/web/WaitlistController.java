package com.booking.platform.web;

import com.booking.platform.domain.WaitlistItem;
import com.booking.platform.service.WaitlistService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(WaitlistService waitlistService) {
        this.waitlistService = waitlistService;
    }

    @PostMapping("/{listingId}")
    public WaitlistItem join(@PathVariable UUID listingId, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to, Authentication auth) {
        return waitlistService.join(listingId, from, to, auth);
    }

    @GetMapping
    public List<WaitlistItem> getMyWaitlist(Authentication auth) {
        return waitlistService.getMyWaitlist(auth);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        waitlistService.remove(id);
    }
}
