# Database Migration Strategy

## Rules

- Schema is SQL-first with Flyway.
- Hibernate schema mutation is disabled (`ddl-auto: validate`).
- Every DB change must be a migration file.
- No direct/manual schema edits in shared environments.

## Naming Convention

- `V{number}__description.sql`
- Examples:
  - `V3__add_payment_status_column.sql`
  - `V4__add_booking_index.sql`
  - `V5__create_audit_log_table.sql`

## Creating a New Migration

1. Create a new SQL file under `api/src/main/resources/db/migration`.
2. Use next sequential version number.
3. Keep migration backward-compatible when possible.
4. Add explicit indexes/constraints for new columns/tables.

## Local Run

- Flyway runs automatically at application startup.
- Start app with valid DB credentials.
- If schema mismatch exists, startup fails fast.

## Rollback Strategy

- Flyway Community uses forward-only migrations.
- Rollback is performed by restoring from backup/snapshot.
- For critical changes:
  - take DB backup before migration,
  - apply migration,
  - verify health checks and critical queries.

## Failed Migration Handling

1. Stop application.
2. Inspect `flyway_schema_history` and DB error.
3. Fix migration SQL in a new migration file (preferred) or repair only in local dev if safe.
4. Re-run startup and verify health.

## Operational Notes

- Checksum mismatch should be treated as a release blocker.
- Missing migration should fail startup and must be resolved before deployment.
