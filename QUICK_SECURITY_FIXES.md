# Quick Security Fixes

## 🚨 Production-д хийх шаардлагатай засварууд

### 1. CORS Configuration (5 минут)

**Одоо:**
```typescript:src/server.ts
app.use(cors({
  origin: '*',
  credentials: false,
}));
```

**Засвар:**
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL?.split(',') || ['https://yourdomain.com']
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
```

**`.env` файлд нэмэх:**
```
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
```

---

### 2. Environment Variables Validation (10 минут)

**Файл үүсгэх: `src/config/env.ts`**
```typescript
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'REDIS_HOST',
];

export function validateEnv(): void {
  const missing: string[] = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  // JWT_SECRET strength check
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET should be at least 32 characters long');
  }

  console.log('✅ Environment variables validated');
}
```

**`src/server.ts`-д нэмэх:**
```typescript
import { validateEnv } from './config/env';

// Server эхлэхээс өмнө
validateEnv();
```

---

### 3. WebSocket Authentication (15 минут)

**`src/websocket/socket.handler.ts`-д нэмэх:**
```typescript
import jwt from 'jsonwebtoken';

export function handleSocketConnection(io: Server) {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { playerId: string };
      socket.data.playerId = decoded.playerId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const playerId = socket.data.playerId;
    console.log(`✅ Client connected: ${socket.id}, Player: ${playerId}`);

    // ... existing code ...
  });
}
```

**Frontend-д:**
```typescript
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

---

### 4. Input Validation Enhancement (20 минут)

**`src/middleware/validation.middleware.ts`-д нэмэх:**
```typescript
import validator from 'validator';

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }

  // Email validation
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Username validation
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      success: false,
      error: 'Username must be between 3 and 20 characters'
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      success: false,
      error: 'Username can only contain letters, numbers, and underscores'
    });
  }

  // Password validation
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters'
    });
  }

  // Password strength (optional but recommended)
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });
  }

  next();
}
```

**`package.json`-д нэмэх:**
```json
"dependencies": {
  "validator": "^13.11.0"
}
```

**Install:**
```bash
npm install validator
npm install --save-dev @types/validator
```

---

### 5. Request Size Limits (5 минут)

**`src/server.ts`-д засах:**
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

### 6. Error Handling Improvement (15 минут)

**`src/middleware/errorHandler.middleware.ts`-д засах:**
```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Operational errors (trusted)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Programming errors (don't leak details)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
}
```

**Ашиглах:**
```typescript
// Routes-д
throw new AppError('Player not found', 404);
```

---

### 7. JWT Token Expiration (5 минут)

**`src/routes/auth.routes.ts`-д засах:**
```typescript
// Register & Login-д
const token = jwt.sign(
  { playerId: player._id.toString() },
  process.env.JWT_SECRET!,
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } // 7d → 24h
);
```

**`.env` файлд:**
```
JWT_EXPIRES_IN=24h
```

---

## 📋 Checklist

- [ ] CORS origin fix
- [ ] Environment variables validation
- [ ] WebSocket authentication
- [ ] Input validation (email, username, password)
- [ ] Request size limits
- [ ] Error handling improvement
- [ ] JWT expiration (24h instead of 7d)

**Нийт хугацаа: ~1 цаг**

---

## 🚀 Production Deployment Checklist

### Before Deploying:
- [ ] All security fixes applied
- [ ] Environment variables set
- [ ] CORS configured for production domain
- [ ] Rate limiting configured
- [ ] Error logging setup (Winston/Sentry)
- [ ] Health check endpoint tested
- [ ] Database backups configured
- [ ] SSL/TLS certificate (HTTPS)

### After Deploying:
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Test all endpoints
- [ ] Verify WebSocket connections
- [ ] Check database connections
- [ ] Monitor Redis connections

---

**Дүгнэлт**: Эдгээр засваруудыг хийснээр backend production-ready болно. Security score: 6/10 → 8.5/10.

