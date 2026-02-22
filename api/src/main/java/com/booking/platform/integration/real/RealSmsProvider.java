package com.booking.platform.integration.real;

import com.booking.platform.integration.SmsProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RealSmsProvider implements SmsProvider {

    private static final Logger log = LoggerFactory.getLogger(RealSmsProvider.class);
    private final String apiKey;

    public RealSmsProvider(String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    public void send(String recipient, String body) {
        log.info("real_sms_stub recipient={} payload={}", recipient, body);
    }

    @Override
    public String providerName() {
        return "RealSmsProviderStub";
    }

    @Override
    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
