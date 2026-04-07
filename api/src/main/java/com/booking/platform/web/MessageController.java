package com.booking.platform.web;

import com.booking.platform.domain.Message;
import com.booking.platform.service.MessageService;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public Message sendMessage(@RequestParam UUID receiverId, @RequestParam UUID listingId, @RequestBody String content, Authentication auth) {
        return messageService.sendMessage(receiverId, listingId, content, auth);
    }

    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam UUID otherUserId, @RequestParam UUID listingId, Authentication auth) {
        return messageService.getConversation(otherUserId, listingId, auth);
    }

    @PostMapping("/read")
    public void markAsRead(@RequestBody List<UUID> messageIds) {
        messageService.markAsRead(messageIds);
    }

    @GetMapping("/unread")
    public List<Message> getUnread(Authentication auth) {
        return messageService.getUnreadMessages(auth);
    }
}
