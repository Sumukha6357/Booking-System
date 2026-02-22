package com.booking.platform.service;

import com.booking.platform.dto.IntegrationStatusResponse;
import com.booking.platform.integration.EmailProvider;
import com.booking.platform.integration.PaymentProvider;
import com.booking.platform.integration.SmsProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class IntegrationStatusService {

    private final String mode;
    private final PaymentProvider paymentProvider;
    private final EmailProvider emailProvider;
    private final SmsProvider smsProvider;

    public IntegrationStatusService(
        @Value("${integrations.mode:mock}") String mode,
        PaymentProvider paymentProvider,
        EmailProvider emailProvider,
        SmsProvider smsProvider
    ) {
        this.mode = mode;
        this.paymentProvider = paymentProvider;
        this.emailProvider = emailProvider;
        this.smsProvider = smsProvider;
    }

    public IntegrationStatusResponse current() {
        return new IntegrationStatusResponse(
            mode,
            paymentProvider.providerName(),
            emailProvider.providerName(),
            smsProvider.providerName(),
            paymentProvider.configured(),
            emailProvider.configured(),
            smsProvider.configured()
        );
    }
}
