package com.booking.platform.integration.real;

import com.booking.platform.integration.EmailProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RealEmailProvider implements EmailProvider {

    private static final Logger log = LoggerFactory.getLogger(RealEmailProvider.class);
    private final String apiKey;

    public RealEmailProvider(String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    public void send(String recipient, String subject, String body) {
        log.info("real_email_stub recipient={} subject={} payload={}", recipient, subject, body);
    }

    @Override
    public String providerName() {
        return "RealEmailProviderStub";
    }

    @Override
    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
