import { Server, Socket } from 'socket.io';
import { redis } from '../config/redis';

export function handleGameEvents(socket: Socket, io: Server) {
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

  socket.on('game:finish', async (data: {
    sessionId: string;
    results: any;
  }) => {
    io.to(data.sessionId).emit('game:finished', {
      sessionId: data.sessionId,
      results: data.results
    });
  });
}

