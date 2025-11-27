import { redis } from '../config/redis';
import { Player } from '../models';

export interface LeaderboardEntry {
  playerId: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
}

const LEADERBOARD_KEY = 'leaderboard:global:sorted';

export async function updateLeaderboardRedis(): Promise<void> {
  const players = await Player.find()
    .select('_id username avatar totalPoints');

  const pipeline = redis.pipeline();
  pipeline.del(LEADERBOARD_KEY);

  for (const player of players) {
    pipeline.zadd(LEADERBOARD_KEY, player.totalPoints, player._id.toString());
  }

  await pipeline.exec();
}

export async function getGlobalLeaderboardRedis(limit: number = 100): Promise<LeaderboardEntry[]> {
  const playerIds = await redis.zrevrange(LEADERBOARD_KEY, 0, limit - 1, 'WITHSCORES');

  const ids: string[] = [];
  for (let i = 0; i < playerIds.length; i += 2) {
    ids.push(playerIds[i]);
  }

  const players = await Player.find({ _id: { $in: ids } })
    .select('username avatar');

  const playerMap = new Map(players.map(p => [p._id.toString(), p]));

  const leaderboard: LeaderboardEntry[] = [];
  for (let i = 0; i < playerIds.length; i += 2) {
    const playerId = playerIds[i];
    const points = parseInt(playerIds[i + 1]);
    const player = playerMap.get(playerId);

    leaderboard.push({
      playerId,
      username: player?.username || 'Unknown',
      avatar: player?.avatar.imageUrl || '',
      points,
      rank: Math.floor(i / 2) + 1
    });
  }

  return leaderboard;
}

export async function getPlayerRankRedis(playerId: string): Promise<number> {
  const rank = await redis.zrevrank(LEADERBOARD_KEY, playerId);
  return rank !== null ? rank + 1 : 0;
}

export async function incrementPlayerPoints(playerId: string, points: number): Promise<void> {
  await redis.zincrby(LEADERBOARD_KEY, points, playerId);
}

