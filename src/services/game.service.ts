import { GameSession, GameResult, Player, PlayerStats } from '../models';
import { calculateRewards } from '../utils/rewards.util';

export async function createGameSession(
  gameType: string,
  mode: string,
  seasonId: string,
  players: Array<{ playerId: string; username: string; avatar: string }>
): Promise<any> {
  return await GameSession.create({
    gameType,
    mode,
    seasonId,
    players,
    status: 'waiting'
  });
}

export async function submitGameResult(
  sessionId: string,
  playerId: string,
  score: number,
  rank: number,
  stats: any
): Promise<any> {
  const session = await GameSession.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const rewards = calculateRewards(score, rank, session.gameType);

  const result = await GameResult.create({
    sessionId,
    playerId,
    gameType: session.gameType,
    score,
    rank,
    pointsEarned: rewards.points,
    xpEarned: rewards.xp,
    stats,
    rewards: {
      coins: rewards.coins,
      seasonPassXp: rewards.seasonPassXp
    }
  });

  await Player.findByIdAndUpdate(playerId, {
    $inc: {
      totalPoints: rewards.points,
      xp: rewards.xp,
      gamesPlayed: 1,
      wins: rank === 1 ? 1 : 0,
      losses: rank !== 1 ? 1 : 0
    }
  });

  await updatePlayerStats(playerId, session.gameType, score, rank === 1);

  session.status = 'finished';
  session.endedAt = new Date();
  if (rank === 1) {
    session.winnerId = playerId as any;
  }
  await session.save();

  return result;
}

async function updatePlayerStats(
  playerId: string,
  gameType: string,
  score: number,
  isWin: boolean
): Promise<void> {
  const stats = await PlayerStats.findOne({ playerId, gameType });

  if (!stats) {
    await PlayerStats.create({
      playerId,
      gameType,
      gamesPlayed: 1,
      wins: isWin ? 1 : 0,
      losses: isWin ? 0 : 1,
      totalScore: score,
      averageScore: score,
      bestScore: score,
      winRate: isWin ? 100 : 0,
      currentStreak: isWin ? 1 : 0,
      longestStreak: isWin ? 1 : 0,
      lastPlayedAt: new Date()
    });
  } else {
    const newGamesPlayed = stats.gamesPlayed + 1;
    const newWins = stats.wins + (isWin ? 1 : 0);
    const newLosses = stats.losses + (isWin ? 0 : 1);
    const newTotalScore = stats.totalScore + score;
    const newAverageScore = Math.floor(newTotalScore / newGamesPlayed);
    const newBestScore = Math.max(stats.bestScore, score);
    const newWinRate = Math.floor((newWins / newGamesPlayed) * 100);
    const newCurrentStreak = isWin ? stats.currentStreak + 1 : 0;
    const newLongestStreak = Math.max(stats.longestStreak, newCurrentStreak);

    await PlayerStats.findByIdAndUpdate(stats._id, {
      gamesPlayed: newGamesPlayed,
      wins: newWins,
      losses: newLosses,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      winRate: newWinRate,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastPlayedAt: new Date()
    });
  }
}

