# Migration Failure Playbook

1. Stop deployment/rollout.
2. Inspect `flyway_schema_history` and failed SQL.
3. If partial DDL applied, create compensating forward migration.
4. Re-run Flyway migrate in controlled environment.
5. Resume rollout after health and data checks.
