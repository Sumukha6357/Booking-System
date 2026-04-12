package com.booking.platform.service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class LockService {

    private final StringRedisTemplate redisTemplate;
    private final Duration holdTtl;
    private final Map<String, String> localFallbackLocks = new ConcurrentHashMap<>();

    public LockService(StringRedisTemplate redisTemplate, Duration bookingHoldTtl) {
        this.redisTemplate = redisTemplate;
        this.holdTtl = bookingHoldTtl;
    }

    public boolean acquire(String key, String value) {
        try {
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, value, holdTtl);
            return Boolean.TRUE.equals(acquired);
        } catch (Exception ignored) {
            String existing = localFallbackLocks.putIfAbsent(key, value);
            return existing == null || existing.equals(value);
        }
    }

    public void release(String key) {
        try {
            redisTemplate.delete(key);
        } catch (Exception ignored) {
            // Fallback lock cleanup handled below.
        }
        localFallbackLocks.remove(key);
    }

    public Duration getHoldTtl() {
        return holdTtl;
    }
}
