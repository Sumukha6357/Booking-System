# Incident: API 5xx Spike
1. Check alert dashboard and recent deploys.
2. Filter logs by `correlationId` and status>=500.
3. Check DB/Redis health endpoints.
4. Rollback last release if regression confirmed.
