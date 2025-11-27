import { Player } from '../models';
import { redis } from '../config/redis';
import { gameConfig } from '../config/game-config';

export interface LeaderboardEntry {
  playerId: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
}

export async function getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  const cacheKey = 'leaderboard:global';
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const players = await Player.find()
    .sort({ totalPoints: -1 })
    .limit(limit)
    .select('username avatar totalPoints');

  const leaderboard = players.map((player, index) => ({
    playerId: player._id.toString(),
    username: player.username,
    avatar: player.avatar.imageUrl,
    points: player.totalPoints,
    rank: index + 1
  }));

  await redis.setex(cacheKey, gameConfig.leaderboard.cacheTTL, JSON.stringify(leaderboard));

  return leaderboard;
}

export async function getSeasonLeaderboard(seasonId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
  const cacheKey = `leaderboard:season:${seasonId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const { GameResult } = await import('../models');
  
  const results = await GameResult.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: '$playerId',
        totalPoints: { $sum: '$pointsEarned' }
      }
    },
    { $sort: { totalPoints: -1 } },
    { $limit: limit }
  ]);

  const playerIds = results.map(r => r._id);
  const players = await Player.find({ _id: { $in: playerIds } })
    .select('username avatar');

  const playerMap = new Map(players.map(p => [p._id.toString(), p]));

  const leaderboard = results.map((result, index) => {
    const player = playerMap.get(result._id.toString());
    return {
      playerId: result._id.toString(),
      username: player?.username || 'Unknown',
      avatar: player?.avatar.imageUrl || '',
      points: result.totalPoints,
      rank: index + 1
    };
  });

  await redis.setex(cacheKey, gameConfig.leaderboard.cacheTTL, JSON.stringify(leaderboard));

  return leaderboard;
}

export async function getPlayerRank(playerId: string): Promise<number> {
  const players = await Player.countDocuments({
    totalPoints: { $gt: await Player.findById(playerId).then(p => p?.totalPoints || 0) }
  });

  return players + 1;
}

