package com.booking.platform.integration.mock;

import com.booking.platform.integration.SmsProvider;
import com.booking.platform.service.OutboundMessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MockSmsProvider implements SmsProvider {

    private static final Logger log = LoggerFactory.getLogger(MockSmsProvider.class);
    private final OutboundMessageService outboundMessageService;

    public MockSmsProvider(OutboundMessageService outboundMessageService) {
        this.outboundMessageService = outboundMessageService;
    }

    @Override
    public void send(String recipient, String body) {
        log.info("mock_sms recipient={} payload={}", recipient, body);
        outboundMessageService.store("SMS", recipient, null, body, providerName(), "SENT");
    }

    @Override
    public String providerName() {
        return "MockSmsProvider";
    }

    @Override
    public boolean configured() {
        return true;
    }
}
