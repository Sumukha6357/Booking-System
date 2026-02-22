# Multi-Tenant Booking Platform

Generated from `Multi_Tenant_Booking_Platform_Codex_Master_Blueprint.docx`.

## Apps

- `api`: Spring Boot backend (`PostgreSQL`, `Redis`, JWT auth, booking state machine, pricing, search, payments, analytics, WebSocket notifications)
- `web`: Next.js + Tailwind frontend (role-aware app shell, vendor dashboard, booking flow pages)

## Run in development

```bash
# API
cd api
mvn spring-boot:run

# WEB
cd ../web
npm install
npm run dev
```

## Docker default

```bash
cp .env.example .env
docker compose up --build
```

## Docker local

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

## Docker dev

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Docker prod

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## Key API endpoints

- `POST /api/tenants`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/listings`
- `GET /api/listings/search`
- `POST /api/bookings/hold`
- `POST /api/payments/bookings/{bookingId}/confirm`
- `GET /api/analytics`

Headers:

- `Authorization: Bearer <JWT>`
- `X-Tenant-Id: <tenant-uuid>`
- `X-Correlation-Id: <optional-id>`
