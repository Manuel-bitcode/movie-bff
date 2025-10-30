import { Router } from 'express';
import * as likeController from '../controllers/likeController';
import { validateImdbId } from '../middlewares/validateImdbId';

const router = Router();

// POST /api/movies/:imdbId/like - Dar like a una película
router.post('/:imdbId/like', validateImdbId, likeController.likeMovie);

// GET /api/movies/:imdbId/likes - Obtener likes de una película
router.get('/:imdbId/likes', validateImdbId, likeController.getMovieLikes);

router.get('/total', likeController.getTotalLikes);


export default router;

//app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
