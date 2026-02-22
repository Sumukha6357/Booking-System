# Threat Model Notes

## Assets
- Tenant/user identity tokens
- Booking/payment state integrity
- Tenant-partitioned data in Postgres
- Locking/idempotency state in Redis

## Main Threats
- Token replay and stolen refresh tokens
- Cross-tenant data access
- Request flooding and brute-force login
- Double-booking under contention
- Operational blind spots (no alerts/traces)

## Mitigations Implemented
- Session/token revocation list + refresh rotation
- Tenant + role permission checks
- Endpoint-level rate limiting
- Redis locks + idempotency keys
- Structured logs with correlation ID
- Prometheus alerts + runbooks
