import { Request, Response } from 'express';
import { movieApiService, NormalizedMovie } from '../services/movieApiService';
import { likeModel } from '../models/likeModel';

/**
 * Interfaz para película enriquecida con likes
 */
interface EnrichedMovie extends NormalizedMovie {
  likes: number;
}

/**
 * Controlador para endpoints de películas
 */
export class MovieController {
  /**
   * GET /api/movies
   * Obtiene listado estático de 10 películas con datos de API + likes de BD
   */
  async getPopularMovies(req: Request, res: Response): Promise<void> {
    try {
      // 1. Obtener películas de la API externa (con rating)
      const externalMovies = await movieApiService.fetchPopularMovies();

      // 2. Extraer todos los imdbIDs para consulta bulk
      const imdbIds = externalMovies.map(movie => movie.id);

      // 3. Obtener likes de todas las películas en una sola query (optimización)
      const likesMap = await likeModel.getBulkLikes(imdbIds);

      // 4. Enriquecer películas con likes
      const enrichedMovies: EnrichedMovie[] = externalMovies.map(movie => ({
        ...movie,
        likes: likesMap.get(movie.id) || 0 // Si no tiene likes, retornar 0
      }));

      // 5. Response exitoso
      res.status(200).json({
        success: true,
        data: enrichedMovies,
        count: enrichedMovies.length,
        message: 'Películas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error en getStaticMovies:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener películas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

// Exportar instancia
export const movieController = new MovieController();
