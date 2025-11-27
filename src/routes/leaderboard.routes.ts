import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getGlobalLeaderboard, getSeasonLeaderboard, getPlayerRank } from '../services/leaderboard.service';
import { getGlobalLeaderboardRedis, getPlayerRankRedis } from '../services/leaderboard-redis.service';

const router = Router();

/**
 * @swagger
 * /api/leaderboard/global:
 *   get:
 *     summary: Get global leaderboard
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of players to return
 *       - in: query
 *         name: redis
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Use Redis Sorted Sets (faster)
 *     responses:
 *       200:
 *         description: Successfully retrieved global leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeaderboardEntry'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/global', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const useRedis = req.query.redis === 'true';

    const leaderboard = useRedis
      ? await getGlobalLeaderboardRedis(limit)
      : await getGlobalLeaderboard(limit);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

/**
 * @swagger
 * /api/leaderboard/season/{id}:
 *   get:
 *     summary: Get season leaderboard
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of players to return
 *     responses:
 *       200:
 *         description: Successfully retrieved season leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeaderboardEntry'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/season/:id', authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await getSeasonLeaderboard(req.params.id, limit);

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch season leaderboard' });
  }
});

/**
 * @swagger
 * /api/leaderboard/game/{type}:
 *   get:
 *     summary: Get game-specific leaderboard
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [running, jumping, throwing, balance, endurance]
 *         description: Game type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of players to return
 *     responses:
 *       200:
 *         description: Successfully retrieved game leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       playerId:
 *                         type: string
 *                       username:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       totalScore:
 *                         type: number
 *                       gamesPlayed:
 *                         type: number
 *                       rank:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/game/:type', authMiddleware, async (req, res) => {
  try {
    const { GameResult } = await import('../models');
    const limit = parseInt(req.query.limit as string) || 100;

    const results = await GameResult.aggregate([
      { $match: { gameType: req.params.type } },
      {
        $group: {
          _id: '$playerId',
          totalScore: { $sum: '$score' },
          gamesPlayed: { $sum: 1 }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit }
    ]);

    const { Player } = await import('../models');
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
        totalScore: result.totalScore,
        gamesPlayed: result.gamesPlayed,
        rank: index + 1
      };
    });

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch game leaderboard' });
  }
});

/**
 * @swagger
 * /api/leaderboard/player/{id}/rank:
 *   get:
 *     summary: Get player rank
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *       - in: query
 *         name: redis
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Use Redis (faster)
 *     responses:
 *       200:
 *         description: Successfully retrieved player rank
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rank:
 *                       type: number
 *                       example: 42
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/player/:id/rank', authMiddleware, async (req, res) => {
  try {
    const useRedis = req.query.redis === 'true';
    const rank = useRedis
      ? await getPlayerRankRedis(req.params.id)
      : await getPlayerRank(req.params.id);

    res.json({ success: true, data: { rank } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch player rank' });
  }
});

/**
 * @swagger
 * /api/leaderboard/player/{id}/nearby:
 *   get:
 *     summary: Get nearby players (players with similar points)
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Successfully retrieved nearby players
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LeaderboardEntry'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Player not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/player/:id/nearby', authMiddleware, async (req, res) => {
  try {
    const { Player } = await import('../models');
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const rank = await getPlayerRank(req.params.id);
    const range = 5;

    const players = await Player.find({
      totalPoints: { $gte: player.totalPoints - 100, $lte: player.totalPoints + 100 }
    })
      .sort({ totalPoints: -1 })
      .limit(range * 2 + 1)
      .select('username avatar totalPoints');

    const leaderboard = players.map((p, index) => ({
      playerId: p._id.toString(),
      username: p.username,
      avatar: p.avatar.imageUrl,
      points: p.totalPoints,
      rank: rank - range + index
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch nearby players' });
  }
});

export default router;

