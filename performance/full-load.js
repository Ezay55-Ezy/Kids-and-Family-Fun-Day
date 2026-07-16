import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { BASE_URL, COMMON_HEADERS, API_HEADERS } from './config.js';

const loginSuccess = new Counter('login_success');
const loginFail = new Counter('login_fail');
const bookingSuccess = new Counter('booking_success');
const bookingFail = new Counter('booking_fail');
const errors = new Counter('errors');

export const options = {
  scenarios: {
    homepage_browsers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 1000 },
        { duration: '1m', target: 1000 },
        { duration: '30s', target: 2000 },
        { duration: '1m', target: 2000 },
        { duration: '30s', target: 3500 },
        { duration: '1m', target: 3500 },
        { duration: '30s', target: 0 },
      ],
      exec: 'homepageFlow',
    },
    event_browsers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 150 },
        { duration: '1m', target: 150 },
        { duration: '30s', target: 300 },
        { duration: '1m', target: 300 },
        { duration: '30s', target: 600 },
        { duration: '1m', target: 600 },
        { duration: '30s', target: 1200 },
        { duration: '1m', target: 1200 },
        { duration: '30s', target: 1500 },
        { duration: '1m', target: 1500 },
        { duration: '30s', target: 0 },
      ],
      exec: 'eventFlow',
    },
    detail_viewers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 400 },
        { duration: '1m', target: 400 },
        { duration: '30s', target: 800 },
        { duration: '1m', target: 800 },
        { duration: '30s', target: 1000 },
        { duration: '1m', target: 1000 },
        { duration: '30s', target: 0 },
      ],
      exec: 'eventDetailFlow',
    },
    auth_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 400 },
        { duration: '1m', target: 400 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },
      ],
      exec: 'authFlow',
    },
    dashboard_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 400 },
        { duration: '1m', target: 400 },
        { duration: '30s', target: 500 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },
      ],
      exec: 'dashboardFlow',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2500', 'p(99)<6000'],
    login_success: ['count>50'],
    booking_success: ['count>20'],
  },
};

export function homepageFlow() {
  group('Homepage', function () {
    const res = http.get(`${BASE_URL}/`, { headers: COMMON_HEADERS, tags: { name: 'GET /' } });
    check(res, {
      'homepage status 200': (r) => r.status === 200,
      'homepage < 3s': (r) => r.timings.duration < 3000,
    });
    if (res.status !== 200) errors.add(1);
  });

  group('Vendor Marketplace API', function () {
    const res = http.get(`${BASE_URL}/api/vendors/marketplace`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/vendors/marketplace' },
    });
    check(res, {
      'marketplace status 200': (r) => r.status === 200,
    });
  });

  group('Gallery API', function () {
    const res = http.get(`${BASE_URL}/api/gallery`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/gallery' },
    });
    check(res, {
      'gallery status 200': (r) => r.status === 200,
    });
  });

  sleep(Math.random() * 3 + 1);
}

export function eventFlow() {
  group('Events Listing', function () {
    const res = http.get(`${BASE_URL}/events`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /events' },
    });
    check(res, {
      'events page status 200': (r) => r.status === 200,
      'events page < 3s': (r) => r.timings.duration < 3000,
    });
    if (res.status !== 200) errors.add(1);
  });

  group('Events API', function () {
    const res = http.get(`${BASE_URL}/api/events`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/events' },
    });
    check(res, {
      'events api status 200': (r) => r.status === 200,
    });
  });

  sleep(Math.random() * 4 + 2);
}

export function eventDetailFlow() {
  group('Event Detail Page', function () {
    const slug = 'kids-and-family-fun-day-2025';
    const res = http.get(`${BASE_URL}/events/${slug}`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /events/[slug]' },
    });
    check(res, {
      'event detail status 200': (r) => r.status === 200,
      'event detail < 3s': (r) => r.timings.duration < 3000,
    });
    if (res.status !== 200) errors.add(1);
  });

  sleep(Math.random() * 5 + 3);
}

export function authFlow() {
  group('Login Page Load', function () {
    const res = http.get(`${BASE_URL}/auth/login`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /auth/login' },
    });
    check(res, {
      'login page status 200': (r) => r.status === 200,
    });
  });

  group('Login API', function () {
    const payload = JSON.stringify({
      email: 'testuser@example.com',
      password: 'TestPassword123!',
    });

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
      'login attempt completed': () => success || res.status === 401,
    });

    if (success) {
      loginSuccess.add(1);
    } else if (res.status >= 400 && res.status !== 401) {
      loginFail.add(1);
      errors.add(1);
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

  sleep(Math.random() * 2 + 1);
}

export function dashboardFlow() {
  group('Dashboard Page', function () {
    const res = http.get(`${BASE_URL}/dashboard`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /dashboard' },
    });
    check(res, {
      'dashboard status 200 or 302': (r) => r.status === 200 || r.status === 302,
      'dashboard < 3s': (r) => r.timings.duration < 3000,
    });
  });

  group('Unread Count API', function () {
    const res = http.get(`${BASE_URL}/api/user/unread-count`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/user/unread-count' },
    });
    check(res, {
      'unread count responds': (r) => r.status === 200 || r.status === 401,
    });
  });

  group('Vendor Status API', function () {
    const res = http.get(`${BASE_URL}/api/user/vendor-status`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/user/vendor-status' },
    });
    check(res, {
      'vendor status responds': (r) => r.status === 200 || r.status === 401,
    });
  });

  group('Notifications API', function () {
    const res = http.get(`${BASE_URL}/api/notifications?limit=8`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/notifications' },
    });
    check(res, {
      'notifications responds': (r) => r.status === 200 || r.status === 401,
    });
  });

  group('Profile API', function () {
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
