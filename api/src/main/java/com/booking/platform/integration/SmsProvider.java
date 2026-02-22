package com.booking.platform.integration;

public interface SmsProvider {
    void send(String recipient, String body);

    String providerName();

    boolean configured();
}
