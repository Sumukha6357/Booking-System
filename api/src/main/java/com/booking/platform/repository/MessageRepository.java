package com.booking.platform.repository;

import com.booking.platform.domain.Message;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByTenantIdAndListingIdOrderByCreatedAtDesc(UUID tenantId, UUID listingId);
    
    @Query("SELECT m FROM Message m WHERE m.tenantId = :tenantId AND ((m.senderId = :u1 AND m.receiverId = :u2) OR (m.senderId = :u2 AND m.receiverId = :u1)) AND m.listingId = :listingId ORDER BY m.createdAt ASC")
    List<Message> findConversation(UUID tenantId, UUID u1, UUID u2, UUID listingId);

    List<Message> findByReceiverIdAndIsReadFalse(UUID receiverId);
}
