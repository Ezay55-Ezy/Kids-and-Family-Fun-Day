import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, COMMON_HEADERS, API_HEADERS } from './config.js';

const errors = new Counter('errors');

export const options = {
  scenarios: {
    homepage_load: {
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
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
  },
};

export default function () {
  group('Homepage', function () {
    const res = http.get(`${BASE_URL}/`, { headers: COMMON_HEADERS, tags: { name: 'GET /' } });
    check(res, {
      'homepage status 200': (r) => r.status === 200,
      'homepage < 2s': (r) => r.timings.duration < 2000,
      'homepage < 5s': (r) => r.timings.duration < 5000,
    });
    if (res.status !== 200) errors.add(1);
  });

  sleep(Math.random() * 3 + 1);
}
