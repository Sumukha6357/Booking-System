package com.booking.platform.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RequiredSecretsValidator {

    private final String jwtSecret;
    private final String webhookSecret;

    public RequiredSecretsValidator(
        @Value("${app.jwt.secret}") String jwtSecret,
        @Value("${app.webhook.secret}") String webhookSecret
    ) {
        this.jwtSecret = jwtSecret;
        this.webhookSecret = webhookSecret;
    }

    @PostConstruct
    void validate() {
        require(jwtSecret, "app.jwt.secret");
        require(webhookSecret, "app.webhook.secret");
    }

    private void require(String value, String key) {
        if (value == null || value.isBlank() || value.toLowerCase().contains("change_me")) {
            throw new IllegalStateException("Missing required secret: " + key);
        }
    }
}
