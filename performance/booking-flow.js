import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter } from 'k6/metrics';
import { BASE_URL, COMMON_HEADERS, API_HEADERS } from './config.js';

const bookingSuccess = new Counter('booking_success');
const bookingFail = new Counter('booking_fail');

export const options = {
  scenarios: {
    booking_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '2m', target: 200 },
        { duration: '1m', target: 500 },
        { duration: '2m', target: 500 },
        { duration: '1m', target: 1000 },
        { duration: '2m', target: 1000 },
        { duration: '1m', target: 1500 },
        { duration: '2m', target: 1500 },
        { duration: '2m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<5000', 'p(99)<10000'],
  },
};

export default function () {
  group('Browse Events', function () {
    const res = http.get(`${BASE_URL}/api/events`, {
      headers: API_HEADERS,
      tags: { name: 'GET /api/events' },
    });
    check(res, {
      'events loaded': (r) => r.status === 200,
    });
  });

  group('Event Detail', function () {
    const slug = 'kids-and-family-fun-day-2025';
    const res = http.get(`${BASE_URL}/events/${slug}`, {
      headers: COMMON_HEADERS,
      tags: { name: 'GET /events/[slug]' },
    });
    check(res, {
      'event detail loaded': (r) => r.status === 200,
    });
  });

  sleep(2);

  group('Create Booking', function () {
    const payload = JSON.stringify({
      eventId: 1,
      items: [
        { ticketTypeId: 1, quantity: 2 },
      ],
    });

    const res = http.post(`${BASE_URL}/api/bookings`, payload, {
      headers: API_HEADERS,
      tags: { name: 'POST /api/bookings' },
    });

    check(res, {
      'booking request completed': (r) => r.status === 200 || r.status === 400 || r.status === 401 || r.status === 409,
    });

    if (res.status === 200) {
      bookingSuccess.add(1);
    } else {
      bookingFail.add(1);
    }
  });

  sleep(Math.random() * 5 + 3);
}
