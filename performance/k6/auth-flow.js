import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 20, duration: '2m' };

export default function () {
  const res = http.post(`${__ENV.BASE_URL}/api/auth/login`, JSON.stringify({ email: __ENV.USER_EMAIL, password: __ENV.USER_PASSWORD }), { headers: { 'Content-Type': 'application/json' } });
  check(res, { 'login status 200/409': (r) => r.status === 200 || r.status === 409 });
  sleep(1);
}
