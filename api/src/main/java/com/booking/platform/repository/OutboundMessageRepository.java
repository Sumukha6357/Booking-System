package com.booking.platform.repository;

import com.booking.platform.domain.OutboundMessage;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutboundMessageRepository extends JpaRepository<OutboundMessage, UUID> {
}
