package com.booking.platform.service;

import java.time.Duration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class LockService {

    private final StringRedisTemplate redisTemplate;
    private final Duration holdTtl;

    public LockService(StringRedisTemplate redisTemplate, Duration bookingHoldTtl) {
        this.redisTemplate = redisTemplate;
        this.holdTtl = bookingHoldTtl;
    }

    public boolean acquire(String key, String value) {
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, value, holdTtl);
        return Boolean.TRUE.equals(acquired);
    }

    public void release(String key) {
        redisTemplate.delete(key);
    }

    public Duration getHoldTtl() {
        return holdTtl;
    }
}
