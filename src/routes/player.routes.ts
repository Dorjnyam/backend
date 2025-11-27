import { Router } from 'express';
import { Player, PlayerStats, PlayerInventory } from '../models';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/player/{id}:
 *   get:
 *     summary: Get player profile
 *     tags: [Player]
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
 *         description: Successfully retrieved player profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Player'
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
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .select('-passwordHash');

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'Player not found'
      });
    }

    res.json({ success: true, data: player });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch player' });
  }
});

/**
 * @swagger
 * /api/player/{id}/stats:
 *   get:
 *     summary: Get player statistics
 *     tags: [Player]
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
 *         description: Successfully retrieved player stats
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
 *                     $ref: '#/components/schemas/PlayerStats'
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
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await PlayerStats.find({ playerId: req.params.id });

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

/**
 * @swagger
 * /api/player/{id}:
 *   patch:
 *     summary: Update player profile
 *     tags: [Player]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: object
 *                 properties:
 *                   imageUrl:
 *                     type: string
 *                   frameId:
 *                     type: string
 *     responses:
 *       200:
 *         description: Player profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Player'
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
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { avatar } = req.body;

    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { $set: { avatar } },
      { new: true }
    ).select('-passwordHash');

    res.json({ success: true, data: player });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Update failed' });
  }
});

export default router;

