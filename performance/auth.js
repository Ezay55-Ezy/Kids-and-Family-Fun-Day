import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, COMMON_HEADERS, API_HEADERS } from './config.js';

const loginSuccess = new Counter('login_success');
const loginFail = new Counter('login_fail');

export const options = {
  scenarios: {
    auth_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 500 },
        { duration: '1m', target: 1000 },
        { duration: '2m', target: 1000 },
        { duration: '1m', target: 2500 },
        { duration: '2m', target: 2500 },
        { duration: '1m', target: 5000 },
        { duration: '2m', target: 5000 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000', 'p(99)<7000'],
  },
};

export default function () {
  group('Login Page', function () {
    const res = http.get(`${BASE_URL}/auth/login`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /auth/login' },
    });
    check(res, {
      'login page status 200': (r) => r.status === 200,
      'login page < 2s': (r) => r.timings.duration < 2000,
    });
  });

  group('CSRF Token', function () {
    const res = http.get(`${BASE_URL}/api/auth/csrf`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/auth/csrf' },
    });
    check(res, {
      'csrf token retrieved': (r) => r.status === 200,
    });
  });

  group('Login POST', function () {
    const csrfRes = http.get(`${BASE_URL}/api/auth/csrf`, { headers: API_HEADERS });
    let csrfToken = '';
    if (csrfRes.status === 200) {
      try {
        const body = JSON.parse(csrfRes.body);
        csrfToken = body.csrfToken || '';
      } catch (e) {}
    }

    const payload = `email=testuser%40example.com&password=TestPassword123%21&csrfToken=${csrfToken}`;

    const res = http.post(`${BASE_URL}/api/auth/callback/credentials`, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...COMMON_HEADERS,
      },
      tags: { name: 'POST /api/auth/callback/credentials' },
      redirects: 0,
    });

    const success = res.status === 200 || res.status === 302 || res.status === 303;
    check(res, {
      'login completed': () => success || res.status === 401,
    });

    if (success) {
      loginSuccess.add(1);
    } else {
      loginFail.add(1);
    }
  });

  group('Session Check', function () {
    const res = http.get(`${BASE_URL}/api/auth/session`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/auth/session' },
    });
    check(res, {
      'session endpoint responds': (r) => r.status === 200,
    });
  });

  sleep(Math.random() * 3 + 1);
}
