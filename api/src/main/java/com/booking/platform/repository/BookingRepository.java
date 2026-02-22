package com.booking.platform.repository;

import com.booking.platform.domain.Booking;
import com.booking.platform.domain.BookingState;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByIdAndTenantId(UUID id, UUID tenantId);

    List<Booking> findByTenantId(UUID tenantId);

    @Query("""
        select b from Booking b
        where b.tenantId = :tenantId
          and b.listingId = :listingId
          and b.state in :states
          and b.checkIn < :checkOut
          and b.checkOut > :checkIn
        """)
    List<Booking> findOverlappingBookings(
        @Param("tenantId") UUID tenantId,
        @Param("listingId") UUID listingId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        @Param("states") List<BookingState> states
    );

    List<Booking> findByStateAndHoldExpiresAtBefore(BookingState state, Instant now);
}
