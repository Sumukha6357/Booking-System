package com.booking.platform.service;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.booking.platform.domain.IdempotencyRecord;
import com.booking.platform.exception.ConflictException;
import org.junit.jupiter.api.Test;

class DuplicateRequestRejectionTest {

    @Test
    void duplicateKeyWithDifferentPayloadIsRejected() {
        IdempotencyRecord record = new IdempotencyRecord();
        record.setRequestFingerprint("fingerprint-1");

        IdempotencyService service = new IdempotencyService(null);
        assertThrows(ConflictException.class, () -> service.assertFingerprintMatches(record, "fingerprint-2"));
    }
}
