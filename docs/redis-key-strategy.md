# Redis Key Strategy

## Naming Rules

- Use colon-separated namespaces.
- Prefix by domain (`booking`, `idempotency`, `session`, `cache`).
- Include tenant/user/resource identifiers as needed.
- Version cache keys when payload shape can change.

## Standard Keys

- `booking:lock:{listingId}:{checkIn}:{checkOut}`
- `idempotency:{tenantId}:{key}`
- `session:{userId}:{deviceId}`
- `cache:v1:{entity}:{id}`

## Collision Avoidance

- Every key includes enough scope (`tenantId`, `userId`, or resource ID).
- Never reuse key patterns across unrelated domains.
- Keep lock keys deterministic from business identifiers.

## Versioning

- For cache entries, bump version (`v1` -> `v2`) on payload contract change.
- Keep old keys until natural TTL expiry during rolling upgrades.

## TTL Guidance

- Booking locks: 10 minutes.
- Idempotency keys: align to API retry window.
- Sessions: align to auth refresh policy.
- Cache keys: domain-specific and explicit.
