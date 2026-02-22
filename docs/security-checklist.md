# Security Checklist

## Baseline Controls
- Secrets loaded via env vars only.
- Boot fails when required secrets are missing.
- Access token expiry enforced.
- Refresh rotation enabled.
- Logout and global logout revoke active sessions.
- Admin disable revokes user sessions.
- Rate limiting on auth, booking, payment, and search endpoints.
- Security headers enabled (HSTS in prod).
- Correlation IDs present in logs.

## Threat Model Notes
- Credential stuffing mitigated by rate limits and failed-login audit events.
- Refresh token replay mitigated by immediate token rotation revocation.
- Session hijack mitigated by server-side revoked session checks.
- Tenant breakout mitigated by tenant-scoped context and permission checks.
- Abuse of booking/payment endpoints mitigated by idempotency + throttling.

## Required Evidence Before Go-Live
- `mvn test` green.
- k6 baseline report captured.
- Alert rules loaded and firing test complete.
- Backup/restore drill evidence attached.
