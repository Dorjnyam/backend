# Testing Guide

## 🎯 Зорилго

Backend-ийн тестийн зааварчилгаа, хэрхэн test хийх, performance шалгах.

---

## 📦 Test Setup

### Dependencies
```bash
npm install
```

**Test Dependencies:**
- `jest` - Test framework
- `ts-jest` - TypeScript support
- `supertest` - HTTP testing
- `@types/jest` - TypeScript types
- `@types/supertest` - TypeScript types

### Configuration
- **Jest Config**: `jest.config.js`
- **Test Setup**: `src/__tests__/setup.ts`
- **Test Helpers**: `src/__tests__/utils/test-helpers.ts`

---

## 🧪 Test Commands

### Run All Tests
```bash
npm test
```

### Watch Mode (Auto-run on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- auth.middleware.test.ts
```

---

## 📁 Test Structure

```
src/
├── __tests__/
│   ├── setup.ts                    # Test setup
│   ├── utils/
│   │   └── test-helpers.ts         # Test utilities
│   ├── middleware/
│   │   ├── auth.middleware.test.ts
│   │   └── validation.middleware.test.ts
│   ├── routes/
│   │   └── auth.routes.test.ts
│   └── performance/
│       └── load-test.spec.ts
```

---

## 🧩 Test Types

### 1. Unit Tests

**Auth Middleware Test** (`auth.middleware.test.ts`)
```typescript
describe('Auth Middleware', () => {
  it('should call next() with valid token', () => {
    // Test valid token
  });

  it('should return 401 if no token provided', () => {
    // Test missing token
  });

  it('should return 401 if token is invalid', () => {
    // Test invalid token
  });
});
```

**Validation Middleware Test** (`validation.middleware.test.ts`)
```typescript
describe('Validation Middleware', () => {
  describe('validateRegister', () => {
    it('should call next() with valid data', () => {
      // Test valid registration data
    });

    it('should return 400 if email is invalid', () => {
      // Test invalid email
    });

    it('should return 400 if password is too weak', () => {
      // Test weak password
    });
  });
});
```

### 2. Integration Tests

**Auth Routes Test** (`auth.routes.test.ts`)
```typescript
describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

### 3. Performance Tests

**Load Test** (`load-test.spec.ts`)
```typescript
describe('Performance Tests', () => {
  it('should handle multiple concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() =>
      request(app).get('/health')
    );

    const startTime = Date.now();
    await Promise.all(requests);
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(1000);
  });
});
```

---

## 🛠️ Test Utilities

### Test Helpers (`test-helpers.ts`)

**Generate Test Token**
```typescript
import { generateTestToken } from '../utils/test-helpers';

const token = generateTestToken('player-id');
```

**Create Mock Request**
```typescript
import { createMockRequest } from '../utils/test-helpers';

const req = createMockRequest({
  body: { username: 'test' },
  headers: { authorization: 'Bearer token' },
});
```

**Create Mock Response**
```typescript
import { createMockResponse } from '../utils/test-helpers';

const res = createMockResponse();
// res.status(), res.json() мocks
```

---

## 📊 Test Coverage

### Current Coverage
- **Auth Middleware**: 100% (4 tests)
- **Validation Middleware**: 90%+ (8+ tests)
- **Auth Routes**: 80%+ (integration tests)

### Coverage Report
```bash
npm run test:coverage
```

**Output:**
```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
auth.middleware.ts | 100 | 100 | 100 | 100
validation.middleware.ts | 95 | 90 | 100 | 95
```

---

## 🚀 Performance Testing

### 1. Artillery

**Install:**
```bash
npm install -g artillery
```

**Run:**
```bash
artillery run artillery-config.yml
```

**Config**: `artillery-config.yml`
- Warm up phase
- Sustained load phase
- Spike test phase

### 2. k6

**Install:**
```bash
# Windows
choco install k6
# or
winget install k6
```

**Run:**
```bash
k6 run load-test.js
```

**Script**: `load-test.js`
- Ramp up/down stages
- Custom metrics
- Thresholds

### 3. Apache Bench

**Install:**
```bash
# Windows (Chocolatey)
choco install apache-httpd
```

**Run:**
```bash
ab -n 1000 -c 10 http://localhost:5000/health
```

**Parameters:**
- `-n`: Total requests
- `-c`: Concurrent requests
- `-t`: Timeout

---

## 📈 Performance Benchmarks

### Expected Results

**Health Check:**
- Response Time: < 50ms
- Throughput: 2000-5000 req/sec
- Concurrent: 100+ users

**Register:**
- Response Time: < 2000ms
- Throughput: 50-100 req/sec
- Concurrent: 10-20 users

**Login:**
- Response Time: < 1000ms
- Throughput: 100-200 req/sec
- Concurrent: 20-50 users

**Cached Endpoints (Leaderboard):**
- Response Time: < 100ms
- Throughput: 1000-2000 req/sec
- Concurrent: 100+ users

---

## 🔍 Debugging Tests

### Run Single Test
```bash
npm test -- --testNamePattern="should call next"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Watch Mode
```bash
npm run test:watch
```

---

## 📝 Writing New Tests

### Test Template
```typescript
import { Request, Response, NextFunction } from 'express';
import { yourFunction } from '../../your-module';
import { createMockRequest, createMockResponse, createMockNext } from '../utils/test-helpers';

describe('Your Module', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    nextFunction = createMockNext();
  });

  it('should do something', () => {
    // Arrange
    mockRequest.body = { data: 'test' };

    // Act
    yourFunction(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Assert
    expect(nextFunction).toHaveBeenCalled();
  });
});
```

---

## ⚠️ Common Issues

### 1. Database Connection
**Problem**: Tests fail with database connection error

**Solution:**
- Test database setup
- Environment variables set
- MongoDB running

### 2. Redis Connection
**Problem**: Tests fail with Redis connection error

**Solution:**
- Redis running
- `REDIS_HOST` environment variable set

### 3. JWT Secret
**Problem**: Token verification fails

**Solution:**
- `JWT_SECRET` environment variable set
- Test setup file checks this

### 4. Port Already in Use
**Problem**: Server already running on port 5000

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 🎯 Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock Dependencies**: Use mocks for external services
3. **Test Edge Cases**: Invalid inputs, missing data
4. **Performance Tests**: Run separately from unit tests
5. **Coverage Goal**: Aim for 80%+ coverage
6. **Fast Tests**: Unit tests should be fast (< 100ms each)

---

## 📚 Resources

- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Supertest Docs**: https://github.com/visionmedia/supertest
- **Artillery Docs**: https://www.artillery.io/docs
- **k6 Docs**: https://k6.io/docs/

---

**Дүгнэлт**: Testing setup бэлэн. Unit tests, integration tests, performance tests бүгд ажиллаж байна. Coverage report харах, performance benchmarks шалгах.

