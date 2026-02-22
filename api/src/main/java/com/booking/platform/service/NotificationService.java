package com.booking.platform.service;

import com.booking.platform.domain.Booking;
import com.booking.platform.integration.EmailProvider;
import com.booking.platform.integration.SmsProvider;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final EmailProvider emailProvider;
    private final SmsProvider smsProvider;

    public NotificationService(SimpMessagingTemplate messagingTemplate, EmailProvider emailProvider, SmsProvider smsProvider) {
        this.messagingTemplate = messagingTemplate;
        this.emailProvider = emailProvider;
        this.smsProvider = smsProvider;
    }

    public void bookingUpdated(Booking booking) {
        messagingTemplate.convertAndSend("/topic/tenants/" + booking.getTenantId() + "/bookings", booking);
        emailProvider.send("user+" + booking.getUserId() + "@local.dev", "Booking " + booking.getState(), "Booking " + booking.getId() + " moved to " + booking.getState());
        smsProvider.send("+10000000000", "Booking " + booking.getId() + " is now " + booking.getState());
    }
}
