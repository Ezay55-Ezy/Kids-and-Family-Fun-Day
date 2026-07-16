import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { COMMON_HEADERS, API_HEADERS } from './config.js';

const BASE_URL = 'https://kids-and-family-fun-day.vercel.app';
const errors = new Counter('errors');

export const options = {
  scenarios: {
    comparison: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
  },
};

const pages = [
  { name: 'Homepage', path: '/', headers: COMMON_HEADERS, threshold: 3000 },
  { name: 'Events Page', path: '/events', headers: COMMON_HEADERS, threshold: 3000 },
  { name: 'Events API', path: '/api/events', headers: API_HEADERS, threshold: 2000 },
  { name: 'Vendor Marketplace', path: '/api/vendors/marketplace', headers: API_HEADERS, threshold: 2000 },
  { name: 'Gallery API', path: '/api/gallery', headers: API_HEADERS, threshold: 2000 },
];

export default function () {
  const page = pages[Math.floor(Math.random() * pages.length)];

  group(page.name, function () {
    const res = http.get(`${BASE_URL}${page.path}`, {
      headers: page.headers,
      tags: { name: page.name },
    });
    check(res, {
      [`${page.name} status 200`]: (r) => r.status === 200,
      [`${page.name} < ${page.threshold / 1000}s`]: (r) => r.timings.duration < page.threshold,
    });
    if (res.status !== 200) errors.add(1);
  });

  sleep(Math.random() * 3 + 1);
}
