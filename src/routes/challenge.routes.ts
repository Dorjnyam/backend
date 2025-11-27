import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getDailyChallenges,
  getPlayerChallengeProgress,
  claimChallengeReward
} from '../services/challenge.service';

const router = Router();

/**
 * @swagger
 * /api/challenge/daily:
 *   get:
 *     summary: Get today's daily challenges
 *     tags: [Daily Challenge]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved daily challenges
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
 *                     _id:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     challenges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Challenge'
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
router.get('/daily', authMiddleware, async (req, res) => {
  try {
    const challenges = await getDailyChallenges();
    res.json({ success: true, data: challenges });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch challenges' });
  }
});

/**
 * @swagger
 * /api/challenge/progress:
 *   get:
 *     summary: Get player's challenge progress for today
 *     tags: [Daily Challenge]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved player progress
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
 *                     $ref: '#/components/schemas/ChallengeProgress'
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
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const playerId = req.user!.playerId;
    const progress = await getPlayerChallengeProgress(playerId);

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch progress' });
  }
});

/**
 * @swagger
 * /api/challenge/{id}/claim:
 *   post:
 *     summary: Claim reward for completed challenge
 *     tags: [Daily Challenge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Challenge ID (e.g., play-3-games, win-1-game)
 *         examples:
 *           play-3-games:
 *             value: play-3-games
 *           win-1-game:
 *             value: win-1-game
 *           score-500-points:
 *             value: score-500-points
 *     responses:
 *       200:
 *         description: Reward claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reward claimed
 *       400:
 *         description: Cannot claim reward (not completed or already claimed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/claim', authMiddleware, async (req, res) => {
  try {
    const playerId = req.user!.playerId;
    await claimChallengeReward(playerId, req.params.id);

    res.json({ success: true, message: 'Reward claimed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

