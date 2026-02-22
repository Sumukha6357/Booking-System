package com.booking.platform.integration;

public interface EmailProvider {
    void send(String recipient, String subject, String body);

    String providerName();

    boolean configured();
}
