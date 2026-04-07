package com.booking.platform.service;

import com.booking.platform.domain.Message;
import com.booking.platform.repository.MessageRepository;
import com.booking.platform.tenant.TenantContext;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Transactional
    public Message sendMessage(UUID receiverId, UUID listingId, String content, Authentication auth) {
        UUID senderId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();

        Message message = new Message();
        message.setSenderId(senderId);
        message.setReceiverId(receiverId);
        message.setListingId(listingId);
        message.setContent(content);
        message.setTenantId(tenantId);

        return messageRepository.save(message);
    }

    public List<Message> getConversation(UUID otherUserId, UUID listingId, Authentication auth) {
        UUID myId = UUID.fromString((String) auth.getPrincipal());
        UUID tenantId = TenantContext.getRequired();
        return messageRepository.findConversation(tenantId, myId, otherUserId, listingId);
    }

    @Transactional
    public void markAsRead(List<UUID> messageIds) {
        List<Message> messages = messageRepository.findAllById(messageIds);
        messages.forEach(m -> m.setRead(true));
        messageRepository.saveAll(messages);
    }

    public List<Message> getUnreadMessages(Authentication auth) {
        UUID myId = UUID.fromString((String) auth.getPrincipal());
        return messageRepository.findByReceiverIdAndIsReadFalse(myId);
    }
}
