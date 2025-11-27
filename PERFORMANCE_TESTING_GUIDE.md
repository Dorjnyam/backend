# Performance Testing Guide

## 🎯 Зорилго

Backend-ийн гүйцэтгэлийг шалгах, bottleneck-ууд олох, production-д бэлтгэх.

---

## 📊 Testing Tools

### 1. **Apache Bench (ab)** - Хамгийн энгийн

#### Суулгах (Windows)
```bash
# Chocolatey ашиглах
choco install apache-httpd

# Эсвэл Git Bash-д байгаа
```

#### Ашиглах
```bash
# Basic test
ab -n 1000 -c 10 http://localhost:5000/health

# Parameters:
# -n: Нийт request тоо
# -c: Concurrent (зэрэг) request тоо
# -t: Timeout (секунд)
# -p: POST data file
# -T: Content-Type header

# POST request
ab -n 500 -c 5 -p post_data.json -T application/json http://localhost:5000/api/auth/login

# Results:
# Requests per second: X.XX [#/sec]
# Time per request: XX.XXX [ms]
# Transfer rate: XX.XX [Kbytes/sec]
```

#### Expected Results
- **Health Check**: 2000-5000 req/sec
- **Cached Endpoints**: 1000-2000 req/sec
- **Database Queries**: 100-500 req/sec

---

### 2. **Artillery** - Advanced Load Testing

#### Суулгах
```bash
# Local installation (recommended, no admin rights needed)
npm install artillery --save-dev

# Global installation (requires admin rights on Windows)
npm install -g artillery
```

#### Config файл: `artillery-config.yml`
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60      # 60 секунд
      arrivalRate: 10   # Секунд бүр 10 request
      name: "Warm up"
    - duration: 120
      arrivalRate: 50   # Секунд бүр 50 request
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100  # Секунд бүр 100 request
      name: "Spike test"
  processor: "./artillery-processor.js"
  defaults:
    headers:
      Content-Type: "application/json"

scenarios:
  - name: "Health Check"
    flow:
      - get:
          url: "/health"

  - name: "Register User"
    flow:
      - post:
          url: "/api/auth/register"
          json:
            username: "test{{ $randomString() }}"
            email: "test{{ $randomString() }}@example.com"
            password: "password123"

  - name: "Login and Get Profile"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.data.token"
              as: "token"
      - get:
          url: "/api/player/{{ $processEnvironment.PLAYER_ID }}"
          headers:
            Authorization: "Bearer {{ token }}"

  - name: "Get Daily Challenges"
    flow:
      - get:
          url: "/api/challenge/daily"
          headers:
            Authorization: "Bearer {{ token }}"
```

#### Ажиллуулах
```bash
# Using npm script (recommended)
npm run test:load

# Or directly with npx
npx artillery run artillery-config.yml

# Or if installed globally
artillery run artillery-config.yml
```

#### HTML Report
```bash
artillery run --output report.json artillery-config.yml
artillery report report.json
```

---

### 3. **k6** - Modern Load Testing

#### Суулгах (Optional - Separate Installation Required)

**Windows:**
```bash
# Option 1: Chocolatey (if installed)
choco install k6

# Option 2: winget (Windows 10/11)
winget install k6

# Option 3: Download from https://k6.io/docs/getting-started/installation/
# Extract and add to PATH
```

**Note**: k6 нь npm package биш, тусдаа tool. Суулгаагүй бол Artillery ашиглах (local installation).

#### Test Script: `load-test.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up: 0-20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 50 },    // Ramp up: 20-50 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 0 },    // Ramp down: 50-0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:5000';

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);

  // Register
  const registerPayload = JSON.stringify({
    username: `user_${Math.random().toString(36).substring(7)}`,
    email: `test_${Math.random().toString(36).substring(7)}@example.com`,
    password: 'password123',
  });

  res = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'register status 201': (r) => r.status === 201,
    'register has token': (r) => JSON.parse(r.body).data.token !== undefined,
  }) || errorRate.add(1);

  sleep(1);
}
```

#### Ажиллуулах
```bash
# If k6 is installed
k6 run load-test.js

# If not installed, use Artillery instead:
npm run test:load
```

#### HTML Report
```bash
k6 run --out json=results.json load-test.js
# Эсвэл
k6 run --out dashboard load-test.js
```

---

### 4. **Postman Collection Runner** - API Testing

#### Setup
1. Postman-д collection нээх
2. Collection → Run
3. Iterations: 100
4. Delay: 100ms

#### Monitor
- Response time
- Success rate
- Error rate

---

## 📈 Performance Metrics

### 1. **Response Time**
- **Excellent**: < 100ms
- **Good**: 100-200ms
- **Acceptable**: 200-500ms
- **Poor**: > 500ms

### 2. **Throughput (Requests per Second)**
- **Health Check**: 2000-5000 req/sec
- **Cached Endpoints**: 1000-2000 req/sec
- **Database Queries**: 100-500 req/sec
- **Complex Operations**: 50-200 req/sec

### 3. **Error Rate**
- **Target**: < 0.1% (1 error per 1000 requests)
- **Acceptable**: < 1%
- **Critical**: > 1%

### 4. **Concurrent Users**
- **Development**: 10-50 users
- **Staging**: 100-500 users
- **Production**: 1000+ users

---

## 🔍 Bottleneck Detection

### 1. **Database Queries**
```bash
# MongoDB slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)

# Mongoose debug mode
mongoose.set('debug', true);
```

### 2. **Redis Performance**
```bash
# Redis CLI
redis-cli

# Monitor commands
MONITOR

# Check memory
INFO memory

# Check connections
INFO clients
```

### 3. **Node.js Performance**
```bash
# CPU profiling
node --prof server.js
node --prof-process isolate-*.log > processed.txt

# Memory profiling
node --inspect server.js
# Chrome DevTools → chrome://inspect
```

---

## 🎯 Test Scenarios

### Scenario 1: Health Check (Baseline)
```bash
ab -n 10000 -c 100 http://localhost:5000/health
```
**Expected**: 2000+ req/sec, < 50ms response time

### Scenario 2: Authentication
```bash
# Register
ab -n 1000 -c 10 -p register.json -T application/json http://localhost:5000/api/auth/register

# Login
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:5000/api/auth/login
```
**Expected**: 100-200 req/sec, < 200ms response time

### Scenario 3: Cached Endpoints
```bash
# Leaderboard (Redis cached)
ab -n 5000 -c 50 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/leaderboard/global
```
**Expected**: 1000+ req/sec, < 100ms response time

### Scenario 4: Database Queries
```bash
# Player profile
ab -n 1000 -c 20 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/player/ID
```
**Expected**: 200-500 req/sec, < 150ms response time

### Scenario 5: WebSocket Connections
```javascript
// Test script: ws-test.js
const io = require('socket.io-client');

const clients = [];
for (let i = 0; i < 100; i++) {
  const socket = io('http://localhost:5000', {
    auth: { token: 'YOUR_TOKEN' }
  });
  clients.push(socket);
}
```
**Expected**: 1000+ concurrent connections

---

## 📊 Monitoring During Tests

### 1. **Server Resources**
```bash
# CPU usage
top
# Windows: Task Manager

# Memory usage
free -h
# Windows: Task Manager

# Network
netstat -an | findstr :5000
```

### 2. **Application Metrics**
```javascript
// Add to server.ts
setInterval(() => {
  const usage = process.memoryUsage();
  console.log({
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
  });
}, 5000);
```

### 3. **Database Metrics**
```javascript
// MongoDB connection pool
mongoose.connection.db.admin().serverStatus((err, info) => {
  console.log('Connections:', info.connections);
});
```

---

## 🚀 Optimization Tips

### 1. **Database**
- ✅ Indexes нэмэх
- ✅ Query optimization
- ✅ Connection pooling
- ✅ Read replicas (production)

### 2. **Caching**
- ✅ Redis caching (байгаа)
- ✅ Response caching headers
- ✅ CDN (static assets)

### 3. **Code**
- ✅ Async/await зөв ашиглах
- ✅ Avoid blocking operations
- ✅ Stream large responses

### 4. **Infrastructure**
- ✅ Load balancer
- ✅ Clustering (PM2)
- ✅ Auto-scaling

---

## 📝 Test Report Template

```markdown
# Performance Test Report

**Date**: 2025-01-XX
**Environment**: Development/Staging/Production
**Server**: localhost:5000

## Test Configuration
- Tool: Apache Bench / Artillery / k6
- Duration: XX minutes
- Concurrent Users: XX
- Total Requests: XX

## Results

### Health Check
- Requests/sec: XXX
- Avg Response Time: XXX ms
- 95th percentile: XXX ms
- Error Rate: X.XX%

### Authentication
- Register: XXX req/sec, XXX ms
- Login: XXX req/sec, XXX ms

### API Endpoints
- /api/player/:id: XXX req/sec, XXX ms
- /api/leaderboard/global: XXX req/sec, XXX ms

## Bottlenecks
1. Database queries (XXX ms)
2. Redis connection (XXX ms)
3. ...

## Recommendations
1. Add indexes to MongoDB
2. Increase Redis connection pool
3. ...
```

---

## 🎓 Best Practices

1. **Start Small**: 10 users → 50 → 100 → 500
2. **Monitor Resources**: CPU, Memory, Network
3. **Test Realistic Scenarios**: Actual user behavior
4. **Warm Up**: Server-ийг эхлээд халаах
5. **Multiple Runs**: 3-5 удаа test хийж дундаж авах
6. **Document Results**: Бүх test results хадгалах

---

**Дүгнэлт**: Performance testing нь production-д бэлтгэхэд зайлшгүй. Дээрх tool-ууд ашиглаж, bottleneck-ууд олж, сайжруулах.

