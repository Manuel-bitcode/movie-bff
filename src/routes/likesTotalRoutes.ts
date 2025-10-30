import { Router } from 'express';
import * as likeController from '../controllers/likeController';

const router = Router();

/**
 * @route   GET /api/likes/total
 * @desc    Obtener total de likes de todas las películas
 * @access  Public
 */
router.get('/total', likeController.getTotalLikes);

export default router;
