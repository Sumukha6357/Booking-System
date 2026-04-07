package com.booking.platform.service;

import com.booking.platform.domain.WaitlistItem;
import com.booking.platform.repository.WaitlistRepository;
import com.booking.platform.tenant.TenantContext;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;

    public WaitlistService(WaitlistRepository waitlistRepository) {
        this.waitlistRepository = waitlistRepository;
    }

    public WaitlistItem join(UUID listingId, LocalDate fromDate, LocalDate toDate, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();

        WaitlistItem item = new WaitlistItem();
        item.setListingId(listingId);
        item.setUserId(userId);
        item.setFromDate(fromDate);
        item.setToDate(toDate);
        item.setTenantId(tenantId);

        return waitlistRepository.save(item);
    }

    public List<WaitlistItem> getMyWaitlist(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        return waitlistRepository.findByUserIdAndTenantId(userId, tenantId);
    }

    public void remove(UUID waitlistId) {
        waitlistRepository.deleteById(waitlistId);
    }
}
