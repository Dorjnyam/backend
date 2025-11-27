import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { redis } from '../config/redis';
import { GameSession } from '../models';

export function handleSocketConnection(io: Server) {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.replace('Bearer ', '');
      
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

    socket.on('game:join', async (data: { sessionId: string; playerId: string }) => {
      socket.join(data.sessionId);

      await redis.set(
        `player:${data.playerId}:session`,
        data.sessionId,
        'EX',
        3600
      );

      io.to(data.sessionId).emit('player:joined', {
        playerId: data.playerId,
        socketId: socket.id
      });
    });

    socket.on('game:leave', async (data: { sessionId: string; playerId: string }) => {
      socket.leave(data.sessionId);

      await redis.del(`player:${data.playerId}:session`);

      io.to(data.sessionId).emit('player:left', {
        playerId: data.playerId
      });
    });

    socket.on('game:update', (data: {
      sessionId: string;
      playerId: string;
      state: any;
    }) => {
      io.to(data.sessionId).emit('game:state', {
        playerId: data.playerId,
        state: data.state,
        timestamp: Date.now()
      });
    });

    socket.on('matchmaking:join', async (data: {
      playerId: string;
      gameType: string;
      mode: string;
    }) => {
      const queueKey = `queue:${data.gameType}:${data.mode}`;

      await redis.rpush(queueKey, JSON.stringify({
        playerId: data.playerId,
        socketId: socket.id,
        timestamp: Date.now()
      }));

      socket.emit('matchmaking:queued', {
        position: await redis.llen(queueKey)
      });

      const queueSize = await redis.llen(queueKey);
      if (queueSize >= 2) {
        const player1 = JSON.parse((await redis.lpop(queueKey))!);
        const player2 = JSON.parse((await redis.lpop(queueKey))!);

        const { Player } = await import('../models');
        const p1 = await Player.findById(player1.playerId);
        const p2 = await Player.findById(player2.playerId);

        const session = await GameSession.create({
          gameType: data.gameType,
          mode: data.mode,
          players: [
            {
              playerId: p1!._id,
              username: p1!.username,
              avatar: p1!.avatar.imageUrl
            },
            {
              playerId: p2!._id,
              username: p2!.username,
              avatar: p2!.avatar.imageUrl
            }
          ],
          seasonId: '507f1f77bcf86cd799439011' as any,
          status: 'countdown'
        });

        io.to(player1.socketId).emit('matchmaking:found', {
          sessionId: session._id,
          opponent: player2.playerId
        });

        io.to(player2.socketId).emit('matchmaking:found', {
          sessionId: session._id,
          opponent: player1.playerId
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

