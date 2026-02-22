import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 30, duration: '3m' };

export default function () {
  const headers = {
    Authorization: `Bearer ${__ENV.ACCESS_TOKEN}`,
    'X-Tenant-Id': __ENV.TENANT_ID,
    'Idempotency-Key': `hold-${__VU}-${__ITER}`,
    'Content-Type': 'application/json'
  };
  const payload = JSON.stringify({ listingId: __ENV.LISTING_ID, checkIn: '2026-04-01', checkOut: '2026-04-03' });
  const res = http.post(`${__ENV.BASE_URL}/api/bookings/hold`, payload, { headers });
  check(res, { 'hold accepted': (r) => [200, 409, 429].includes(r.status) });
  sleep(1);
}
