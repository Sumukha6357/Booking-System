package com.booking.platform.service;

import com.booking.platform.domain.IdempotencyRecord;
import com.booking.platform.exception.ConflictException;
import com.booking.platform.repository.IdempotencyRecordRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdempotencyService {

    private final IdempotencyRecordRepository repository;

    public IdempotencyService(IdempotencyRecordRepository repository) {
        this.repository = repository;
    }

    public Optional<IdempotencyRecord> lookup(UUID tenantId, String key) {
        return repository.findByTenantIdAndIdempotencyKey(tenantId, key);
    }

    public void assertFingerprintMatches(IdempotencyRecord record, String fingerprint) {
        if (!record.getRequestFingerprint().equals(fingerprint)) {
            throw new ConflictException("Idempotency key reused with different payload");
        }
    }

    @Transactional
    public IdempotencyRecord save(UUID tenantId, String key, String method, String path, String fingerprint, int status, String body, String contentType) {
        IdempotencyRecord record = new IdempotencyRecord();
        record.setTenantId(tenantId);
        record.setIdempotencyKey(key);
        record.setMethod(method);
        record.setPath(path);
        record.setRequestFingerprint(fingerprint);
        record.setResponseStatus(status);
        record.setResponseBody(body);
        record.setContentType(contentType);
        record.setLastSeenAt(Instant.now());
        try {
            return repository.saveAndFlush(record);
        } catch (DataIntegrityViolationException ex) {
            return repository.findByTenantIdAndIdempotencyKey(tenantId, key)
                .orElseThrow(() -> ex);
        }
    }

    @Transactional
    public void touch(IdempotencyRecord record) {
        record.setLastSeenAt(Instant.now());
        repository.save(record);
    }
}
