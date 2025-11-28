import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import config from '../config/config';
import { likeModel } from '../models/likeModel';

/**
 * Lista estática de 10 películas populares
 * Se usa para obtener datos de OMDB API y combinar con likes de BD
 */
const POPULAR_MOVIES_IMDB_IDS = [
  'tt0111161', // The Shawshank Redemption
  'tt0068646', // The Godfather
  'tt0468569', // The Dark Knight
  'tt0071562', // The Godfather Part II
  'tt0050083', // 12 Angry Men
  'tt0108052', // Schindler's List
  'tt0167260', // The Lord of the Rings: The Return of the King
  'tt0110912', // Pulp Fiction
  'tt0060196', // The Good, the Bad and the Ugly
  'tt0137523'  // Fight Club
];

/**
 * GET /api/movies
 * Obtener lista de películas populares con datos de OMDB API + likes de BD
 * Limitado a 10 películas
 */
export const getAllMovies = async (
  _req: Request,
  res: Response<any>,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🎬 Obteniendo películas populares...');

    // Obtener datos de cada película desde OMDB API
    const moviePromises = POPULAR_MOVIES_IMDB_IDS.map(async (imdbId) => {
      try {
        // 1. Obtener datos de OMDB API
        const omdbResponse = await axios.get(
          `http://www.omdbapi.com/?apikey=${config.OMDB_API_KEY}&i=${imdbId}`
        );

        if (omdbResponse.data.Response === 'False') {
          console.warn(`⚠️ Película ${imdbId} no encontrada en OMDB`);
          return null;
        }

        // 2. Obtener likes de la base de datos
        const likes = await likeModel.getLikesByImdbId(imdbId);

        // 3. Construir objeto de película con formato para frontend
        return {
          imdbId: omdbResponse.data.imdbID,
          title: omdbResponse.data.Title,
          year: omdbResponse.data.Year,
          rated: omdbResponse.data.Rated,
          genre: omdbResponse.data.Genre,
          director: omdbResponse.data.Director,
          actors: omdbResponse.data.Actors,
          plot: omdbResponse.data.Plot,
          poster: omdbResponse.data.Poster,
          imdbRating: omdbResponse.data.imdbRating,
          imdbVotes: omdbResponse.data.imdbVotes,
          runtime: omdbResponse.data.Runtime,
          likes: likes // Likes desde nuestra BD
        };
      } catch (error) {
        console.error(`❌ Error obteniendo película ${imdbId}:`, error);
        return null;
      }
    });

    // Esperar todas las peticiones y filtrar nulos
    const movies = (await Promise.all(moviePromises)).filter(movie => movie !== null);

    console.log(`✅ ${movies.length} películas obtenidas exitosamente`);

    res.status(200).json({
      success: true,
      data: movies,
      count: movies.length,
      message: 'Películas obtenidas correctamente'
    });
  } catch (error) {
    console.error('❌ Error en getAllMovies:', error);
    next(error);
  }
};


