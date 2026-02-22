package com.booking.platform.integration.mock;

import com.booking.platform.integration.EmailProvider;
import com.booking.platform.service.OutboundMessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MockEmailProvider implements EmailProvider {

    private static final Logger log = LoggerFactory.getLogger(MockEmailProvider.class);
    private final OutboundMessageService outboundMessageService;

    public MockEmailProvider(OutboundMessageService outboundMessageService) {
        this.outboundMessageService = outboundMessageService;
    }

    @Override
    public void send(String recipient, String subject, String body) {
        log.info("mock_email recipient={} subject={} payload={}", recipient, subject, body);
        outboundMessageService.store("EMAIL", recipient, subject, body, providerName(), "SENT");
    }

    @Override
    public String providerName() {
        return "MockEmailProvider";
    }

    @Override
    public boolean configured() {
        return true;
    }
}
