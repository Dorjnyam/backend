import { Router } from 'express';
import { GameSession, GameResult, Player } from '../models';
import { authMiddleware } from '../middleware/auth.middleware';
import { calculateRewards } from '../utils/rewards.util';

const router = Router();

/**
 * @swagger
 * /api/game/session/create:
 *   post:
 *     summary: Create a new game session
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameType
 *               - mode
 *               - seasonId
 *             properties:
 *               gameType:
 *                 type: string
 *                 enum: [running, jumping, throwing, balance, endurance]
 *                 example: running
 *               mode:
 *                 type: string
 *                 enum: [1v1, battle-royale, tournament]
 *                 example: 1v1
 *               seasonId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Game session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GameSession'
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
router.post('/session/create', authMiddleware, async (req, res) => {
  try {
    const { gameType, mode, seasonId } = req.body;
    const playerId = req.user!.playerId;

    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    const session = await GameSession.create({
      gameType,
      mode,
      seasonId,
      players: [{
        playerId: player._id,
        username: player.username,
        avatar: player.avatar.imageUrl
      }],
      status: 'waiting'
    });

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
});

/**
 * @swagger
 * /api/game/session/{id}/result:
 *   post:
 *     summary: Submit game result
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *               - rank
 *             properties:
 *               score:
 *                 type: number
 *                 example: 1500
 *               rank:
 *                 type: number
 *                 example: 1
 *               stats:
 *                 type: object
 *                 properties:
 *                   accuracy:
 *                     type: number
 *                   speed:
 *                     type: number
 *                   distance:
 *                     type: number
 *     responses:
 *       200:
 *         description: Game result submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GameResult'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Session not found
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
router.post('/session/:id/result', authMiddleware, async (req, res) => {
  try {
    const { score, stats, rank } = req.body;
    const playerId = req.user!.playerId;
    const sessionId = req.params.id;

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
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

    session.status = 'finished';
    session.endedAt = new Date();
    if (rank === 1) {
      session.winnerId = playerId as any;
    }
    await session.save();

    const { getIo } = await import('../config/socket');
    try {
      const io = getIo();
      io.to(sessionId).emit('game:finished', {
        sessionId,
        results: result
      });
    } catch (error) {
      console.error('Socket.IO not available:', error);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit result' });
  }
});

/**
 * @swagger
 * /api/game/session/{id}:
 *   get:
 *     summary: Get game session details
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Successfully retrieved session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GameSession'
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
router.get('/session/:id', authMiddleware, async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.id);
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch session' });
  }
});

export default router;

