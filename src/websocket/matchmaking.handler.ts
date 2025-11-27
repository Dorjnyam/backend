import { Server, Socket } from 'socket.io';
import { redis } from '../config/redis';
import { GameSession } from '../models';

export function handleMatchmaking(socket: Socket, io: Server) {
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

    const position = await redis.llen(queueKey);
    socket.emit('matchmaking:queued', { position });

    if (position >= 2) {
      await tryMatchPlayers(queueKey, io, data.gameType, data.mode);
    }
  });

  socket.on('matchmaking:leave', async (data: {
    gameType: string;
    mode: string;
  }) => {
    const queueKey = `queue:${data.gameType}:${data.mode}`;
    const queue = await redis.lrange(queueKey, 0, -1);

    for (const item of queue) {
      const player = JSON.parse(item);
      if (player.socketId === socket.id) {
        await redis.lrem(queueKey, 1, item);
        break;
      }
    }
  });
}

async function tryMatchPlayers(
  queueKey: string,
  io: Server,
  gameType: string,
  mode: string
): Promise<void> {
  const queueSize = await redis.llen(queueKey);
  if (queueSize < 2) return;

  const player1Data = await redis.lpop(queueKey);
  const player2Data = await redis.lpop(queueKey);

  if (!player1Data || !player2Data) return;

  const player1 = JSON.parse(player1Data);
  const player2 = JSON.parse(player2Data);

  const { Player } = await import('../models');
  const p1 = await Player.findById(player1.playerId);
  const p2 = await Player.findById(player2.playerId);

  if (!p1 || !p2) return;

  const session = await GameSession.create({
    gameType,
    mode,
    players: [
      {
        playerId: p1._id,
        username: p1.username,
        avatar: p1.avatar.imageUrl
      },
      {
        playerId: p2._id,
        username: p2.username,
        avatar: p2.avatar.imageUrl
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

