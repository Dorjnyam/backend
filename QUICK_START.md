# Quick Start Guide

## 🚀 Backend-ийг хурдан эхлүүлэх

### 1. Dependencies суулгах
```bash
npm install
```

### 2. Environment Variables
`.env` файл үүсгэх (`.env.example`-аас хуулж):
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Эсвэл гараар үүсгэх
```

**Required variables:**
```
JWT_SECRET=your-secret-key-min-32-characters-long
MONGODB_URI=mongodb://localhost:27017/physical-game
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. MongoDB & Redis эхлүүлэх
```bash
# Docker ашиглах (recommended)
docker-compose up -d

# Эсвэл гараар
# MongoDB: mongod
# Redis: redis-server
```

### 4. Server эхлүүлэх
```bash
npm run dev
```

Server `http://localhost:5000` дээр ажиллана.

---

## 🧪 Testing

### Unit Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Performance Testing
```bash
# Artillery (load testing)
npm run test:load

# k6 (if installed)
k6 run load-test.js

# Apache Bench
ab -n 1000 -c 10 http://localhost:5000/health
```

---

## 📚 API Documentation

Swagger UI:
```
http://localhost:5000/api-docs
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                 # Start production server

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:load        # Load testing

# Database
npm run seed             # Seed database
npm run challenges       # Seed challenges
```

---

## ⚠️ Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error
- MongoDB эхлээд байгаа эсэхийг шалгах
- `MONGODB_URI` environment variable зөв эсэхийг шалгах

### Redis Connection Error
- Redis эхлээд байгаа эсэхийг шалгах
- `REDIS_HOST` болон `REDIS_PORT` зөв эсэхийг шалгах

### Test Failures
- Environment variables set эсэхийг шалгах
- Database connection эсэхийг шалгах
- `npm install` дахин хийх

---

## 📖 Дэлгэрэнгүй Баримт Бичиг

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing зааварчилгаа
- **[PERFORMANCE_TESTING_GUIDE.md](./PERFORMANCE_TESTING_GUIDE.md)** - Performance testing
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Frontend integration
- **[BACKEND_ANALYSIS.md](./BACKEND_ANALYSIS.md)** - Backend дүн шинжилгээ

---

**Дүгнэлт**: Backend-ийг хурдан эхлүүлэх, test хийх, performance шалгах.

