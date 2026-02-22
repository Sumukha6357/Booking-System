# Backup Restore Drill

## Backup
- Run nightly `pg_dump` plus WAL/PITR if available.

## Restore Drill (staging)
1. Restore latest dump to staging DB.
2. Point staging API to restored DB.
3. Run smoke checks.
4. Validate row counts for critical tables.

## Targets
- RPO: 15 minutes (with WAL), else 24h snapshot.
- RTO: 60 minutes.
