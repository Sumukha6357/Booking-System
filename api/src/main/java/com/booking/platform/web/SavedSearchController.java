package com.booking.platform.web;

import com.booking.platform.domain.SavedSearch;
import com.booking.platform.repository.SavedSearchRepository;
import com.booking.platform.tenant.TenantContext;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/searches")
public class SavedSearchController {

    private final SavedSearchRepository savedSearchRepository;

    public SavedSearchController(SavedSearchRepository savedSearchRepository) {
        this.savedSearchRepository = savedSearchRepository;
    }

    public record SaveSearchRequest(
        String query,
        Double maxPrice,
        Integer minGuests,
        String location
    ) {}

    @PostMapping
    public SavedSearch save(@Valid @RequestBody SaveSearchRequest request, Authentication auth) {
        SavedSearch search = new SavedSearch();
        search.setTenantId(TenantContext.getRequired());
        search.setUserId(UUID.fromString((String) auth.getPrincipal()));
        search.setQuery(request.query());
        search.setMaxPrice(request.maxPrice());
        search.setMinGuests(request.minGuests());
        search.setLocation(request.location());
        search.setActive(true);
        return savedSearchRepository.save(search);
    }

    @GetMapping
    public List<SavedSearch> mySearches(Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return savedSearchRepository.findByUserIdAndTenantIdAndActive(userId, TenantContext.getRequired(), true);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        UUID userId = TenantContext.getRequired();
        SavedSearch search = savedSearchRepository.findById(id)
            .filter(s -> s.getUserId().equals(userId))
            .orElseThrow();
        search.setActive(false);
        savedSearchRepository.save(search);
    }
}
