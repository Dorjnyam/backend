import { Router } from 'express';
import { Tournament } from '../models';
import { authMiddleware } from '../middleware/auth.middleware';
import { registerForTournament, generateBracket } from '../services/tournament.service';

const router = Router();

/**
 * @swagger
 * /api/tournament/list:
 *   get:
 *     summary: List all tournaments
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved tournaments
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
 *                     $ref: '#/components/schemas/Tournament'
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
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .sort({ startDate: -1 })
      .limit(50);

    res.json({ success: true, data: tournaments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tournaments' });
  }
});

/**
 * @swagger
 * /api/tournament/{id}/register:
 *   post:
 *     summary: Register for tournament
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Successfully registered for tournament
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
 *                   example: Registered successfully
 *       400:
 *         description: Registration failed (tournament full or already registered)
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    const playerId = req.user!.playerId;
    await registerForTournament(req.params.id, playerId);

    res.json({ success: true, message: 'Registered successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /api/tournament/{id}/bracket:
 *   get:
 *     summary: Get tournament bracket
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Successfully retrieved tournament bracket
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
 *                   description: Tournament bracket structure
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tournament not found
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
router.get('/:id/bracket', authMiddleware, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Tournament not found' });
    }

    res.json({ success: true, data: tournament.bracket });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch bracket' });
  }
});

/**
 * @swagger
 * /api/tournament/{id}/generate-bracket:
 *   post:
 *     summary: Generate tournament bracket
 *     tags: [Tournament]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Bracket generated successfully
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
 *                   example: Bracket generated
 *       400:
 *         description: Cannot generate bracket (not enough participants, etc.)
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/generate-bracket', authMiddleware, async (req, res) => {
  try {
    await generateBracket(req.params.id);
    res.json({ success: true, message: 'Bracket generated' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

