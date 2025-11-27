# Physical Asia Game - Backend

Express.js + MongoDB + WebSocket + Redis backend system for Physical Asia Game.

## Features

- ✅ Authentication (JWT)
- ✅ Player Management
- ✅ Game Sessions & Results
- ✅ Real-time WebSocket Communication
- ✅ Matchmaking System
- ✅ Leaderboard (MongoDB + Redis)
- ✅ Tournament System
- ✅ Daily Challenges
- ✅ Achievement Tracking
- ✅ Redis Caching

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start MongoDB (if local)
mongod

# 4. Start Redis (if local)
redis-server

# 5. Run development server
npm run dev

# 6. Build for production
npm run build

# 7. Start production server
npm start
```

## Docker Setup

```bash
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new player
- `POST /api/auth/login` - Login player

### Player
- `GET /api/player/:id` - Get player profile
- `GET /api/player/:id/stats` - Get player stats
- `PATCH /api/player/:id` - Update player profile

### Game
- `POST /api/game/session/create` - Create game session
- `GET /api/game/session/:id` - Get session details
- `POST /api/game/session/:id/result` - Submit game result

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/season/:id` - Season leaderboard
- `GET /api/leaderboard/game/:type` - Game-specific leaderboard
- `GET /api/leaderboard/player/:id/rank` - Player rank
- `GET /api/leaderboard/player/:id/nearby` - Nearby players

### Tournament
- `GET /api/tournament/list` - List tournaments
- `POST /api/tournament/:id/register` - Register for tournament
- `GET /api/tournament/:id/bracket` - Get tournament bracket

### Challenge
- `GET /api/challenge/daily` - Get daily challenges
- `GET /api/challenge/progress` - Get player progress
- `POST /api/challenge/:id/claim` - Claim reward

## WebSocket Events

### Client -> Server
- `game:join` - Join game session
- `game:leave` - Leave game session
- `game:update` - Update game state
- `matchmaking:join` - Join matchmaking queue

### Server -> Client
- `player:joined` - Player joined
- `player:left` - Player left
- `game:state` - Game state update
- `game:finished` - Game finished
- `matchmaking:queued` - Matchmaking queued
- `matchmaking:found` - Match found
- `leaderboard:update` - Leaderboard update

## Project Structure

```
src/
├── server.ts                    # Main server file
├── models/                      # MongoDB models
├── routes/                      # API routes
├── services/                    # Business logic
├── websocket/                   # WebSocket handlers
├── middleware/                  # Express middleware
├── utils/                       # Utility functions
├── jobs/                        # Scheduled jobs
└── config/                      # Configuration
```

## Frontend Integration

**Дэлгэрэнгүй зааварчилгаа:** [FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)

Frontend интеграцчлахын тулд:
- API Client setup
- Authentication flow
- WebSocket integration
- TypeScript types
- Example code
- Error handling

## API Documentation (Swagger)

Swagger UI-г дараах хаягаар нээх:

```
http://localhost:5000/api-docs
```

Дэлгэрэнгүй: [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

## Environment Variables

See `.env.example` for all required environment variables.

## Daily Challenges

Систем нь өдөр бүр санамсаргүй challenge-ууд сонгодог. Challenge pool-д олон challenge байна:

### Challenge Pool

Challenge pool-ийг `src/config/challenge-pool.ts` файлд засварлана. Challenge нэмэх:

```typescript
{
  challengeId: 'unique-id',
  type: 'play_games' | 'win_games' | 'score_points' | 'streak' | 'special',
  gameType: 'running' | 'jumping' | 'throwing' | 'balance' | 'endurance', // optional
  title: 'Challenge Title',
  description: 'Challenge description',
  requirement: { field: 'gamesPlayed', value: 5 },
  reward: { coins: 100, xp: 200 },
  difficulty: 'easy' | 'medium' | 'hard'
}
```

### Challenge Pool харах

```bash
npm run challenges
```

### Challenge төрлүүд

- **play_games**: Тоглоом тоглох тоо
- **win_games**: Хожих тоо
- **score_points**: Оноо цуглуулах
- **streak**: Дараалсан хожил
- **special**: Тусгай challenge

### Автомат үүсгэлт

Өдөр бүр шөнө дунд (00:00) автоматаар:
- 1 Easy challenge
- 1 Medium challenge  
- 1 Hard challenge

санамсаргүй сонгогдоно.

## Documentation

### 📚 Дэлгэрэнгүй Баримт Бичиг

#### Backend Analysis & Security
- **[BACKEND_ANALYSIS.md](./BACKEND_ANALYSIS.md)** - Backend дүн шинжилгээ, сайжруулах зөвлөмж
- **[QUICK_SECURITY_FIXES.md](./QUICK_SECURITY_FIXES.md)** - Production-д хийх security засварууд
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Хийгдсэн security fixes, testing setup тайлбар

#### Testing & Performance
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing зааварчилгаа, хэрхэн test хийх
- **[PERFORMANCE_TESTING_GUIDE.md](./PERFORMANCE_TESTING_GUIDE.md)** - Performance testing зааварчилгаа
- **[PERFORMANCE_RESULTS.md](./PERFORMANCE_RESULTS.md)** - Performance testing results, benchmarks

#### Technology & Integration
- **[TECHNOLOGY_EXPLANATION.md](./TECHNOLOGY_EXPLANATION.md)** - Technology stack тайлбар, яагаад сонгосон
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** - Frontend интеграцчлах зааварчилгаа
- **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** - Postman collection ашиглах зааварчилгаа
- **[SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)** - Swagger UI ашиглах зааварчилгаа

### 🧪 Testing

#### Unit & Integration Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Дэлгэрэнгүй: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

#### Performance Testing
```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:5000/health

# Artillery
npm install -g artillery
artillery run artillery-config.yml

# k6
k6 run load-test.js
```

Дэлгэрэнгүй: [PERFORMANCE_TESTING_GUIDE.md](./PERFORMANCE_TESTING_GUIDE.md), [PERFORMANCE_RESULTS.md](./PERFORMANCE_RESULTS.md)

### 🔒 Security

Production-д deploy хийхээс өмнө security засварууд хийх:

Дэлгэрэнгүй: [QUICK_SECURITY_FIXES.md](./QUICK_SECURITY_FIXES.md)

**Гол засварууд:**
- CORS origin configuration
- WebSocket authentication
- Environment variables validation
- Input validation enhancement
- Error handling improvement

### 📊 Backend Analysis

Backend-ийн чанар, сайжруулах зөвлөмж:

Дэлгэрэнгүй: [BACKEND_ANALYSIS.md](./BACKEND_ANALYSIS.md)

**Одоогийн түвшин: 7.5/10**
- ✅ Architecture: 9/10
- ⚠️ Security: 6/10 (siteжруулах шаардлагатай)
- ✅ Performance: 7/10
- ⚠️ Testing: 2/10 (test files алга)

### 💡 Technology Stack

Яагаад эдгээр технологи сонгосон бэ?

Дэлгэрэнгүй: [TECHNOLOGY_EXPLANATION.md](./TECHNOLOGY_EXPLANATION.md)

**Core Stack:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Redis
- Socket.IO
- JWT

## License

MIT

