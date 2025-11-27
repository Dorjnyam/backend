import express, { Express } from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { redis } from './config/redis';
import { handleSocketConnection } from './websocket/socket.handler';
import { errorHandler } from './middleware/errorHandler.middleware';
import { startLeaderboardJob } from './jobs/leaderboard.job';
import { startSeasonJob } from './jobs/season.job';
import { startDailyChallengeJob } from './jobs/daily-challenge.job';
import { setIo } from './config/socket';
import { setupSwagger } from './config/swagger';
import { validateEnv } from './config/env';

dotenv.config();
validateEnv();

const app: Express = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(compression());
// CORS - Allow all origins
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

import authRoutes from './routes/auth.routes';
import playerRoutes from './routes/player.routes';
import gameRoutes from './routes/game.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import tournamentRoutes from './routes/tournament.routes';
import challengeRoutes from './routes/challenge.routes';

app.use('/api/auth', authRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/challenge', challengeRoutes);

setupSwagger(app);

setIo(io);
handleSocketConnection(io);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 mongodb:
 *                   type: string
 *                   example: connected
 *                 redis:
 *                   type: string
 *                   example: ready
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: 'connected',
    redis: redis.status
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      
      startLeaderboardJob();
      startSeasonJob();
      startDailyChallengeJob();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { io };

