package com.booking.platform.integration;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import com.booking.platform.domain.Listing;
import com.booking.platform.domain.AppUser;
import com.booking.platform.domain.Role;
import com.booking.platform.domain.Tenant;
import com.booking.platform.dto.HoldBookingRequest;
import com.booking.platform.dto.HoldBookingResponse;
import com.booking.platform.repository.AppUserRepository;
import com.booking.platform.repository.ListingRepository;
import com.booking.platform.repository.TenantRepository;
import com.booking.platform.service.BookingService;
import com.booking.platform.tenant.TenantContext;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:bookingflowtest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=validate",
    "spring.flyway.enabled=true",
    "spring.flyway.validate-on-migrate=true",
    "spring.flyway.baseline-on-migrate=false",
    "spring.flyway.locations=classpath:db/migration",
    "app.jwt.secret=test-secret-key-which-is-at-least-32-characters-long",
    "app.webhook.secret=test-webhook-secret",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379"
})
@Transactional
class BookingFlowIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    private UUID tenantId;
    private UUID userId;
    private UUID listingId;
    private Authentication testAuth;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        userId = UUID.randomUUID();
        TenantContext.set(tenantId);
        testAuth = new UsernamePasswordAuthenticationToken(userId.toString(), "password");

        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setSlug("it-" + tenantId.toString().substring(0, 8));
        tenant.setName("Integration Test Tenant");
        tenantRepository.save(tenant);

        AppUser user = new AppUser();
        user.setId(userId);
        user.setTenantId(tenantId);
        user.setEmail("it+" + userId + "@example.test");
        user.setPasswordHash("integration-test-password-hash");
        user.setRole(Role.USER);
        appUserRepository.save(user);

        // Create a listing to book against
        Listing listing = new Listing();
        listing.setTenantId(tenantId);
        listing.setTitle("Integration Test Property");
        listing.setBasePrice(BigDecimal.valueOf(300.0));
        listing.setDescription("Standard test listing");
        listing.setLocation("California");
        listing.setActive(true);
        listing.setMaxGuests(4);
        Listing savedListing = listingRepository.save(listing);
        listingId = savedListing.getId();
    }

    @Test
    @DisplayName("Complete booking flow: Hold -> Confirm")
    void completeBookingFlowTest() {
        // Step 1: Hold booking
        HoldBookingRequest holdRequest = new HoldBookingRequest(
            listingId, 
            LocalDate.now().plusDays(5), 
            LocalDate.now().plusDays(7)
        );
        HoldBookingResponse holdResponse = bookingService.hold(holdRequest, testAuth, null);
        
        assertThat(holdResponse).isNotNull();
        assertThat(holdResponse.bookingId()).isNotNull();
        assertThat(holdResponse.state()).isEqualTo(BookingState.HELD.name());

        // Step 2: Confirm booking
        Booking confirmedBooking = bookingService.confirm(holdResponse.bookingId());
        
        assertThat(confirmedBooking.getState()).isEqualTo(BookingState.CONFIRMED);
        assertThat(confirmedBooking.getListingId()).isEqualTo(listingId);
    }

    @Test
    @DisplayName("Booking cancellation flow")
    void bookingCancellationFlowTest() {
        // Hold and confirm booking
        HoldBookingRequest holdRequest = new HoldBookingRequest(
            listingId, 
            LocalDate.now().plusDays(10), 
            LocalDate.now().plusDays(12)
        );
        HoldBookingResponse holdResponse = bookingService.hold(holdRequest, testAuth, null);
        bookingService.confirm(holdResponse.bookingId());

        // Cancel booking
        Booking cancelledBooking = bookingService.cancel(holdResponse.bookingId(), "Test cancellation");
        
        assertThat(cancelledBooking.getState()).isEqualTo(BookingState.CANCELLED);
    }

    @Test
    @DisplayName("Listing search validation after creation")
    void searchValidationTest() {
        List<Booking> tenantBookings = bookingService.listTenantBookings();
        assertThat(tenantBookings).isEmpty();

        HoldBookingRequest holdRequest = new HoldBookingRequest(
            listingId, 
            LocalDate.now().plusDays(20), 
            LocalDate.now().plusDays(22)
        );
        bookingService.hold(holdRequest, testAuth, null);
        
        assertThat(bookingService.listTenantBookings()).hasSize(1);
    }
}
