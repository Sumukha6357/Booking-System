# Docker Platform Guide

This repository uses root-level compose files with service Dockerfiles inside `api/` and `web/`.

## Canonical Files

- `api/Dockerfile`
- `web/Dockerfile`
- `docker-compose.yml`
- `docker-compose.local.yml`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env` / `.env.example`

## Run Commands

### Local

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

- uses `APP_ENV=local`, `SPRING_PROFILES_ACTIVE=local`
- enforces local CORS with `WEB_PUBLIC_ORIGIN`

### Dev-like

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- uses `APP_ENV=dev`, `SPRING_PROFILES_ACTIVE=dev`

### Prod-like

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- uses `APP_ENV=prod`, `SPRING_PROFILES_ACTIVE=prod`
- requires setting `WEB_PUBLIC_ORIGIN` and `NEXT_PUBLIC_API_BASE_URL` to real values

## How Migrations Run

- `flyway` service runs on every stack start.
- It executes migrations from:
  - `api/src/main/resources/db/migration`
- `api` waits for:
  - Postgres healthy
  - Redis healthy
  - Flyway service successful completion
- `api` container runs with `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` and `SPRING_FLYWAY_ENABLED=false` to avoid duplicate migration execution in-app.

## Caching Strategy

### API build cache

- `api/Dockerfile` copies `pom.xml` first and runs dependency resolution in an isolated layer.
- Maven cache mount (`/root/.m2`) is used so dependencies are not re-downloaded unless `pom.xml` changes.

### Web build cache

- `web/Dockerfile` copies `package.json` + `package-lock.json` first and runs `npm ci` in a cached layer.
- npm cache mount is used so installs only rerun when lockfile changes.

## Adding New DB Migrations

1. Add `V{N}__description.sql` to `api/src/main/resources/db/migration`.
2. Restart stack with any compose mode.
3. Flyway applies the new migration automatically before API starts.
