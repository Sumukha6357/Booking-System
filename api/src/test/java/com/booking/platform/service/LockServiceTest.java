package com.booking.platform.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

class LockServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private LockService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        service = new LockService(redisTemplate, Duration.ofMinutes(10));
    }

    @Test
    void acquireReturnsTrueWhenRedisLockSet() {
        when(valueOperations.setIfAbsent(eq("k"), eq("v"), any(Duration.class))).thenReturn(true);
        assertTrue(service.acquire("k", "v"));
    }

    @Test
    void acquireReturnsFalseWhenRedisLockRejected() {
        when(valueOperations.setIfAbsent(eq("k"), eq("v"), any(Duration.class))).thenReturn(false);
        assertFalse(service.acquire("k", "v"));
    }

    @Test
    void releaseDeletesKey() {
        service.release("lock-key");
        verify(redisTemplate).delete("lock-key");
    }
}
