import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 50, iterations: 300 };

export default function () {
  const headers = {
    Authorization: `Bearer ${__ENV.ACCESS_TOKEN}`,
    'X-Tenant-Id': __ENV.TENANT_ID,
    'Idempotency-Key': `pay-${__ITER % 5}`
  };
  const res = http.post(`${__ENV.BASE_URL}/api/payments/bookings/${__ENV.BOOKING_ID}/confirm`, null, { headers });
  check(res, { 'idempotent/limited': (r) => [200, 409, 429].includes(r.status) });
}
