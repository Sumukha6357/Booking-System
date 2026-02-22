package com.booking.platform.redis;

import java.util.UUID;

public final class RedisKeys {

    private RedisKeys() {
    }

    public static String bookingLock(UUID listingId, String checkIn, String checkOut) {
        return "booking:lock:" + listingId + ":" + checkIn + ":" + checkOut;
    }

    public static String idempotency(UUID tenantId, String key) {
        return "idempotency:" + tenantId + ":" + key;
    }

    public static String session(UUID userId, String deviceId) {
        return "session:" + userId + ":" + deviceId;
    }

    public static String cacheV1(String entity, String id) {
        return "cache:v1:" + entity + ":" + id;
    }
}
