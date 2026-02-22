# Known Limits

- Max tenants target: 1,000 (initial)
- Max steady RPS target: 300 API RPS
- p95 latency target: < 300ms for read, < 600ms for booking/confirm
- These values must be validated with k6 and infra telemetry.
