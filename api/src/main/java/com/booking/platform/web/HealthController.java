package com.booking.platform.web;

import com.booking.platform.dto.HealthDependenciesResponse;
import com.booking.platform.service.IntegrationStatusService;
import java.util.HashMap;
import java.util.Map;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/internal/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final StringRedisTemplate redisTemplate;
    private final IntegrationStatusService integrationStatusService;

    public HealthController(JdbcTemplate jdbcTemplate, StringRedisTemplate redisTemplate, IntegrationStatusService integrationStatusService) {
        this.jdbcTemplate = jdbcTemplate;
        this.redisTemplate = redisTemplate;
        this.integrationStatusService = integrationStatusService;
    }

    @GetMapping
    public HealthDependenciesResponse dependencies() {
        Map<String, Object> details = new HashMap<>();

        String dbStatus;
        try {
            Integer one = jdbcTemplate.queryForObject("select 1", Integer.class);
            dbStatus = one != null && one == 1 ? "UP" : "DOWN";
        } catch (Exception ex) {
            dbStatus = "DOWN";
            details.put("dbError", ex.getMessage());
        }

        String redisStatus;
        try {
            String pong = redisTemplate.execute((RedisCallback<String>) connection -> connection.ping());
            redisStatus = "PONG".equalsIgnoreCase(pong) ? "UP" : "DOWN";
        } catch (Exception ex) {
            redisStatus = "DOWN";
            details.put("redisError", ex.getMessage());
        }

        var integration = integrationStatusService.current();
        details.put("paymentProvider", integration.paymentProvider());
        details.put("emailProvider", integration.emailProvider());
        details.put("smsProvider", integration.smsProvider());

        return new HealthDependenciesResponse(
            dbStatus,
            redisStatus,
            integration.mode() + ":" + integration.paymentProvider(),
            integration.mode() + ":" + integration.emailProvider(),
            integration.mode() + ":" + integration.smsProvider(),
            details
        );
    }
}
