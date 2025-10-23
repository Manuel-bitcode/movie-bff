import { Router } from 'express';
import * as movieController from '../controllers/movieController';

const router = Router();

// GET /api/movies - Obtener todas las películas
router.get('/', movieController.getAllMovies);

export default router;

