package com.booking.platform.dto;

import java.util.Map;

public record HealthDependenciesResponse(
    String dbStatus,
    String redisStatus,
    String paymentMode,
    String emailMode,
    String smsMode,
    Map<String, Object> details
) {
}
