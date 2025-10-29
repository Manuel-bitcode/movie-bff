import { Router } from 'express';
import * as movieController from '../controllers/movieController';
import * as likeController from '../controllers/likeController';

const router = Router();

/**
 * Rutas de Likes
 */
router.get('/:id/likes', likeController.getMovieLikes);
router.post('/:id/like', likeController.incrementLike);

/**
 * Rutas de Movies
 */
router.get('/', movieController.getAllMovies);

export default router;

