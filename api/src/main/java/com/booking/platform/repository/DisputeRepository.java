package com.booking.platform.repository;

import com.booking.platform.domain.Dispute;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    List<Dispute> findByBookingId(UUID bookingId);
    List<Dispute> findByFiledByUserIdAndTenantId(UUID userId, UUID tenantId);
    List<Dispute> findByTenantId(UUID tenantId);
    List<Dispute> findByStatus(Dispute.DisputeStatus status);
}
