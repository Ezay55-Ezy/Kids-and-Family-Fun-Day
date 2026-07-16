import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, COMMON_HEADERS } from './config.js';

const errors = new Counter('errors');

export const options = {
  scenarios: {
    detail_viewers: {
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
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000', 'p(99)<7000'],
  },
};

export default function () {
  group('Event Detail', function () {
    const slug = 'kids-and-family-fun-day-2025';
    const res = http.get(`${BASE_URL}/events/${slug}`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /events/[slug]' },
    });
    check(res, {
      'event detail status 200': (r) => r.status === 200,
      'event detail < 3s': (r) => r.timings.duration < 3000,
      'event detail < 7s': (r) => r.timings.duration < 7000,
    });
    if (res.status !== 200) errors.add(1);
  });

  sleep(Math.random() * 8 + 3);
}
