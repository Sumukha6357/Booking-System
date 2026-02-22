package com.booking.platform.service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

    private final StringRedisTemplate redisTemplate;
    private final Map<String, AtomicInteger> localFallback = new ConcurrentHashMap<>();

    public RateLimitService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean allow(String key, int limitPerMinute) {
        String slot = String.valueOf(Instant.now().getEpochSecond() / 60);
        String redisKey = "rate_limit:" + key + ":" + slot;
        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1L) {
                redisTemplate.expire(redisKey, java.time.Duration.ofSeconds(70));
            }
            return count == null || count <= limitPerMinute;
        } catch (Exception ignored) {
            int value = localFallback.computeIfAbsent(redisKey, k -> new AtomicInteger(0)).incrementAndGet();
            return value <= limitPerMinute;
        }
    }
}
