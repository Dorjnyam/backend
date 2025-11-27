import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const tokenRate = new Rate('token_received');

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up: 0-20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 50 },   // Ramp up: 20-50 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 100 },  // Ramp up: 50-100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down: 100-0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // 1. Health check
  let res = http.get(`${BASE_URL}/health`);
  const healthCheck = check(res, {
    'health check status 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  if (!healthCheck) errorRate.add(1);
  sleep(1);

  // 2. Register new user
  const username = `user_${Math.random().toString(36).substring(7)}`;
  const email = `test_${Math.random().toString(36).substring(7)}@example.com`;
  const registerPayload = JSON.stringify({
    username: username,
    email: email,
    password: 'password123',
  });

  res = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const registerCheck = check(res, {
    'register status 201': (r) => r.status === 201,
    'register has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.token !== undefined;
      } catch {
        return false;
      }
    },
  });
  if (!registerCheck) errorRate.add(1);
  else tokenRate.add(1);

  let token = '';
  try {
    const body = JSON.parse(res.body);
    token = body.data?.token || '';
  } catch (e) {
    // Ignore
  }

  sleep(1);

  // 3. Login (if we have a test account)
  if (token) {
    res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: email,
        password: 'password123',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    check(res, {
      'login status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    try {
      const body = JSON.parse(res.body);
      token = body.data?.token || token;
    } catch (e) {
      // Ignore
    }
  }

  sleep(1);

  // 4. Get daily challenges (if authenticated)
  if (token) {
    res = http.get(`${BASE_URL}/api/challenge/daily`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    check(res, {
      'daily challenges status 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  }

  sleep(1);

  // 5. Get leaderboard (public)
  res = http.get(`${BASE_URL}/api/leaderboard/global`);
  check(res, {
    'leaderboard status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  // Simple text summary
  return `
    ====================
    Load Test Summary
    ====================
    Total Requests: ${data.metrics.http_reqs.values.count}
    Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%
    Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
    P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
    ====================
  `;
}

