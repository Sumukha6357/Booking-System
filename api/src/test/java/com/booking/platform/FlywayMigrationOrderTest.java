package com.booking.platform;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:flywaytest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=validate",
    "spring.flyway.enabled=true",
    "spring.flyway.validate-on-migrate=true",
    "spring.flyway.baseline-on-migrate=false",
    "spring.flyway.locations=classpath:db/migration",
    "app.jwt.secret=test-secret-key-which-is-at-least-32-characters-long",
    "app.webhook.secret=test-webhook-secret",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379"
})
class FlywayMigrationOrderTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void flywayRunsBeforeJpaValidationAndBuildsSchemaFromEmptyDb() {
        Integer migrationCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM flyway_schema_history WHERE success = true",
            Integer.class
        );
        assertNotNull(migrationCount);
        assertTrue(migrationCount >= 4, "Expected all migrations to be applied before JPA validation");

        Integer tableCount = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM tenants",
            Integer.class
        );
        assertNotNull(tableCount);
        assertTrue(tableCount >= 0, "Expected schema tables to exist from Flyway baseline");
    }
}
