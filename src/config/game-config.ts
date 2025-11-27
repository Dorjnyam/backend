export const gameConfig = {
  points: {
    perWin: Number(process.env.POINTS_PER_WIN) || 100,
    perLoss: 10,
    perDraw: 50
  },
  xp: {
    perWin: Number(process.env.XP_PER_WIN) || 50,
    perLoss: 5,
    perDraw: 25
  },
  coins: {
    perWin: Number(process.env.COINS_PER_WIN) || 10,
    perLoss: 1,
    perDraw: 5
  },
  leaderboard: {
    updateInterval: Number(process.env.LEADERBOARD_UPDATE_INTERVAL) || 5,
    cacheTTL: Number(process.env.LEADERBOARD_CACHE_TTL) || 300
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

