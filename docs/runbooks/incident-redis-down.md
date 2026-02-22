# Incident: Redis Down
1. Verify Redis process/network.
2. API should degrade gracefully (rate-limit fallback local).
3. Restore Redis and monitor lock/idempotency recovery.
