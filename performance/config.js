export const BASE_URL = 'https://kids-and-family-fun-day.vercel.app';

export const RAMP_STAGES = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '2m', target: 1000 },
    { duration: '1m', target: 2500 },
    { duration: '2m', target: 2500 },
    { duration: '1m', target: 5000 },
    { duration: '2m', target: 5000 },
    { duration: '2m', target: 0 },
  ],
};

export const THRESHOLDS = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<2000', 'p(99)<5000'],
};

export const COMMON_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

export const API_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
