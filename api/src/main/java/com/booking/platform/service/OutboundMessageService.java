package com.booking.platform.service;

import com.booking.platform.domain.OutboundMessage;
import com.booking.platform.repository.OutboundMessageRepository;
import com.booking.platform.tenant.TenantContext;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class OutboundMessageService {

    private final OutboundMessageRepository repository;

    public OutboundMessageService(OutboundMessageRepository repository) {
        this.repository = repository;
    }

    public void store(String channel, String recipient, String subject, String body, String provider, String status) {
        OutboundMessage message = new OutboundMessage();
        UUID tenantId = TenantContext.getOrNull();
        message.setTenantId(tenantId == null ? UUID.fromString("00000000-0000-0000-0000-000000000001") : tenantId);
        message.setChannel(channel);
        message.setRecipient(recipient);
        message.setSubject(subject);
        message.setBody(body);
        message.setProvider(provider);
        message.setStatus(status);
        repository.save(message);
    }
}
