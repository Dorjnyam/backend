# Performance Testing Results & Guide

## 🎯 Зорилго

Backend-ийн performance testing хийх, results хадгалах, bottleneck-ууд олох.

---

## 📊 Testing Tools Setup

### 1. Artillery

**Install:**
```bash
npm install -g artillery
```

**Config File**: `artillery-config.yml`
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 30
      arrivalRate: 5
      name: "Warm up"
    - duration: 60
      arrivalRate: 20
      name: "Sustained load"
    - duration: 30
      arrivalRate: 50
      name: "Spike test"
```

**Run:**
```bash
artillery run artillery-config.yml
```

### 2. k6

**Install:**
```bash
# Windows
choco install k6
```

**Script**: `load-test.js`
- Ramp up: 0 → 20 → 50 → 100 users
- Thresholds: 95th percentile < 500ms, error rate < 1%

**Run:**
```bash
k6 run load-test.js
```

### 3. Apache Bench

**Install:**
```bash
choco install apache-httpd
```

**Run:**
```bash
ab -n 1000 -c 10 http://localhost:5000/health
```

---

## 📈 Expected Performance

### Health Check Endpoint
```bash
ab -n 10000 -c 100 http://localhost:5000/health
```

**Expected Results:**
- **Requests/sec**: 2000-5000
- **Time per request**: < 50ms (mean)
- **95th percentile**: < 100ms
- **Error rate**: 0%

### Register Endpoint
```bash
ab -n 1000 -c 10 -p register.json -T application/json http://localhost:5000/api/auth/register
```

**Expected Results:**
- **Requests/sec**: 50-100 req/sec
- **Time per request**: < 2000ms (mean)
- **95th percentile**: < 3000ms
- **Error rate**: < 1%

### Login Endpoint
```bash
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:5000/api/auth/login
```

**Expected Results:**
- **Requests/sec**: 100-200 req/sec
- **Time per request**: < 1000ms (mean)
- **95th percentile**: < 1500ms
- **Error rate**: < 1%

### Leaderboard (Cached)
```bash
ab -n 5000 -c 50 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/leaderboard/global
```

**Expected Results:**
- **Requests/sec**: 1000-2000 req/sec
- **Time per request**: < 100ms (mean)
- **95th percentile**: < 200ms
- **Error rate**: 0%

---

## 🔍 Performance Metrics

### Response Time Categories
- **Excellent**: < 100ms
- **Good**: 100-200ms
- **Acceptable**: 200-500ms
- **Poor**: > 500ms

### Throughput (Requests per Second)
- **Health Check**: 2000-5000 req/sec
- **Cached Endpoints**: 1000-2000 req/sec
- **Database Queries**: 100-500 req/sec
- **Complex Operations**: 50-200 req/sec

### Error Rate
- **Target**: < 0.1% (1 error per 1000 requests)
- **Acceptable**: < 1%
- **Critical**: > 1%

### Concurrent Users
- **Development**: 10-50 users
- **Staging**: 100-500 users
- **Production**: 1000+ users

---

## 📊 Test Scenarios

### Scenario 1: Baseline (Health Check)
```bash
ab -n 10000 -c 100 http://localhost:5000/health
```

**Purpose**: Server-ийн baseline performance шалгах

**Expected**: 2000+ req/sec, < 50ms response time

### Scenario 2: Authentication Load
```bash
# Register
ab -n 1000 -c 10 -p register.json -T application/json http://localhost:5000/api/auth/register

# Login
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:5000/api/auth/login
```

**Purpose**: Authentication endpoints-ийн performance

**Expected**: 50-200 req/sec, < 2000ms response time

### Scenario 3: Cached Endpoints
```bash
ab -n 5000 -c 50 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/leaderboard/global
```

**Purpose**: Redis caching-ийн effectiveness

**Expected**: 1000+ req/sec, < 100ms response time

### Scenario 4: Database Queries
```bash
ab -n 1000 -c 20 -H "Authorization: Bearer TOKEN" http://localhost:5000/api/player/ID
```

**Purpose**: Database query performance

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

**Purpose**: WebSocket connection capacity

**Expected**: 1000+ concurrent connections

---

## 📝 Test Report Template

```markdown
# Performance Test Report

**Date**: 2025-01-XX
**Environment**: Development/Staging/Production
**Server**: localhost:5000
**Tool**: Apache Bench / Artillery / k6

## Test Configuration
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

## 🚀 Optimization Tips

### 1. Database
- ✅ Add indexes (MongoDB)
- ✅ Query optimization
- ✅ Connection pooling (Mongoose default: 10)
- ✅ Read replicas (production)

### 2. Caching
- ✅ Redis caching (байгаа)
- ✅ Response caching headers
- ✅ CDN (static assets)

### 3. Code
- ✅ Async/await зөв ашиглах
- ✅ Avoid blocking operations
- ✅ Stream large responses

### 4. Infrastructure
- ✅ Load balancer (Nginx, AWS ALB)
- ✅ Clustering (PM2, Kubernetes)
- ✅ Auto-scaling

---

## 🔍 Monitoring During Tests

### Server Resources
```bash
# CPU usage
# Windows: Task Manager

# Memory usage
# Windows: Task Manager

# Network
netstat -an | findstr :5000
```

### Application Metrics
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

### Database Metrics
```javascript
// MongoDB connection pool
mongoose.connection.db.admin().serverStatus((err, info) => {
  console.log('Connections:', info.connections);
});
```

---

## 📊 Actual Test Results (Example)

### Health Check (Apache Bench)
```
Server Software:        
Server Hostname:        localhost
Server Port:            5000

Document Path:          /health
Document Length:        100 bytes

Concurrency Level:      10
Time taken for tests:   2.345 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      150000 bytes
HTML transferred:       100000 bytes
Requests per second:    426.44 [#/sec] (mean)
Time per request:       23.450 [ms] (mean)
Time per request:       2.345 [ms] (mean, across all concurrent requests)
Transfer rate:          62.45 [Kbytes/sec] received
```

### Register Endpoint (Artillery)
```
Summary report @ 15:30:45(+0800) 2025-01-XX
  Scenarios launched:  100
  Scenarios completed: 100
  Requests completed:  100
  Mean response/sec:   10.5
  Response time (msec):
    min: 150
    max: 2500
    median: 800
    p95: 2000
    p99: 2300
  Scenario counts:
    Register User: 100 (100%)
  Codes:
    201: 100
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

## 📚 Resources

- **Artillery Docs**: https://www.artillery.io/docs
- **k6 Docs**: https://k6.io/docs
- **Apache Bench**: https://httpd.apache.org/docs/2.4/programs/ab.html

---

**Дүгнэлт**: Performance testing tools бэлэн. Дээрх scenarios-ууд ашиглаж, backend-ийн performance шалгах. Results-ийг хадгалах, bottleneck-ууд олох, сайжруулах.

