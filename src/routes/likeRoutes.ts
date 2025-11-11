import { Router } from 'express';
import * as likeController from '../controllers/likeController';

const router = Router();

/**
 * Rutas de Likes
 */
router.get('/:id/likes', likeController.getMovieLikes);
router.post('/:id/like', likeController.incrementLike);

/**
 * Ruta de total de likes
 */
router.get('/total', likeController.getTotalLikes);

export default router;
