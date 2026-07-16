import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, COMMON_HEADERS, API_HEADERS } from './config.js';

const errors = new Counter('errors');

export const options = {
  scenarios: {
    dashboard_users: {
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
  group('Dashboard Page', function () {
    const res = http.get(`${BASE_URL}/dashboard`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /dashboard' },
    });
    check(res, {
      'dashboard responds': (r) => r.status === 200 || r.status === 302,
      'dashboard < 3s': (r) => r.timings.duration < 3000,
    });
  });

  group('Shell - Unread Count', function () {
    const res = http.get(`${BASE_URL}/api/user/unread-count`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/user/unread-count' },
    });
    check(res, {
      'unread count responds': (r) => r.status === 200 || r.status === 401,
    });
  });

  group('Shell - Vendor Status', function () {
    const res = http.get(`${BASE_URL}/api/user/vendor-status`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/user/vendor-status' },
    });
    check(res, {
      'vendor status responds': (r) => r.status === 200 || r.status === 401,
    });
  });

  group('Shell - Notifications', function () {
    const res = http.get(`${BASE_URL}/api/notifications?limit=8`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/notifications' },
    });
    check(res, {
      'notifications responds': (r) => r.status === 200 || r.status === 401,
    });
  });

  group('Profile', function () {
    const res = http.get(`${BASE_URL}/api/user/profile`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/user/profile' },
    });
    check(res, {
      'profile responds': (r) => r.status === 200 || r.status === 401,
    });
  });

  sleep(Math.random() * 5 + 2);
}
