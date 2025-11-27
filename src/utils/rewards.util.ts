import { MiniGameType } from '../models';
import { gameConfig } from '../config/game-config';

export interface Rewards {
  points: number;
  xp: number;
  coins: number;
  seasonPassXp: number;
}

export function calculateRewards(
  score: number,
  rank: number,
  gameType: MiniGameType
): Rewards {
  const basePoints = score * 10;
  const rankMultiplier = rank === 1 ? 2 : rank === 2 ? 1.5 : 1;

  const points = Math.floor(basePoints * rankMultiplier);
  const xp = Math.floor(points * 0.5);
  const coins = Math.floor(points * 0.1);
  const seasonPassXp = Math.floor(xp * 0.3);

  return { points, xp, coins, seasonPassXp };
}

export function calculateWinRewards(): Rewards {
  return {
    points: gameConfig.points.perWin,
    xp: gameConfig.xp.perWin,
    coins: gameConfig.coins.perWin,
    seasonPassXp: Math.floor(gameConfig.xp.perWin * 0.3)
  };
}

export function calculateLossRewards(): Rewards {
  return {
    points: gameConfig.points.perLoss,
    xp: gameConfig.xp.perLoss,
    coins: gameConfig.coins.perLoss,
    seasonPassXp: Math.floor(gameConfig.xp.perLoss * 0.3)
  };
}

