package com.booking.platform.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.booking.platform.domain.IdempotencyRecord;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.repository.IdempotencyRecordRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class IdempotencyServiceTest {

    @Mock
    private IdempotencyRecordRepository repository;

    private IdempotencyService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new IdempotencyService(repository);
    }

    @Test
    void lookupReturnsStoredRecord() {
        UUID tenantId = UUID.randomUUID();
        IdempotencyRecord record = new IdempotencyRecord();
        record.setIdempotencyKey("abc");
        when(repository.findByTenantIdAndIdempotencyKey(tenantId, "abc")).thenReturn(Optional.of(record));

        assertEquals("abc", service.lookup(tenantId, "abc").orElseThrow().getIdempotencyKey());
    }

    @Test
    void fingerprintMismatchThrowsConflict() {
        IdempotencyRecord record = new IdempotencyRecord();
        record.setRequestFingerprint("f1");
        assertThrows(ConflictException.class, () -> service.assertFingerprintMatches(record, "f2"));
    }
}
