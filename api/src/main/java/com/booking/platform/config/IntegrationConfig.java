package com.booking.platform.config;

import com.booking.platform.integration.EmailProvider;
import com.booking.platform.integration.PaymentProvider;
import com.booking.platform.integration.PaymentWebhookHandler;
import com.booking.platform.integration.SmsProvider;
import com.booking.platform.integration.mock.MockEmailProvider;
import com.booking.platform.integration.mock.MockPaymentProvider;
import com.booking.platform.integration.mock.MockSmsProvider;
import com.booking.platform.integration.real.RealEmailProvider;
import com.booking.platform.integration.real.RealPaymentProvider;
import com.booking.platform.integration.real.RealSmsProvider;
import com.booking.platform.service.OutboundMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IntegrationConfig {

    @Bean
    public PaymentProvider paymentProvider(
        @Value("${integrations.mode:mock}") String mode,
        @Value("${integrations.payment.real.api-key:}") String paymentApiKey,
        PaymentWebhookHandler webhookHandler
    ) {
        if ("real".equalsIgnoreCase(mode)) {
            return new RealPaymentProvider(paymentApiKey);
        }
        return new MockPaymentProvider(webhookHandler);
    }

    @Bean
    public EmailProvider emailProvider(
        @Value("${integrations.mode:mock}") String mode,
        @Value("${integrations.email.real.api-key:}") String emailApiKey,
        OutboundMessageService outboundMessageService
    ) {
        if ("real".equalsIgnoreCase(mode)) {
            return new RealEmailProvider(emailApiKey);
        }
        return new MockEmailProvider(outboundMessageService);
    }

    @Bean
    public SmsProvider smsProvider(
        @Value("${integrations.mode:mock}") String mode,
        @Value("${integrations.sms.real.api-key:}") String smsApiKey,
        OutboundMessageService outboundMessageService
    ) {
        if ("real".equalsIgnoreCase(mode)) {
            return new RealSmsProvider(smsApiKey);
        }
        return new MockSmsProvider(outboundMessageService);
    }
}
