import { Request, Response } from 'express';
import { likeModel } from '../models/likeModel';
import { LikeResponse, TotalLikesResponse } from '../types/movie.types';

/**
 * Obtener cantidad de likes de una película específica
 */
export const getMovieLikes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido (formato IMDb: ttXXXXXXX)
    if (!id || !id.match(/^tt\d+$/)) {
      res.status(400).json({
        success: false,
        error: 'ID de IMDb inválido. Debe tener el formato ttXXXXXXX'
      });
      return;
    }

    const likes = await likeModel.getLikes(id);
    
    const response: LikeResponse = {
      success: true,
      data: {
        imdbId: id,
        likes
      },
      message: 'Likes obtenidos correctamente'
    };

    console.log('✅ Enviando respuesta:', JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error('❌ Error en getMovieLikes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener likes de la película'
    });
  }
};

/**
 * Incrementar like de una película
 */
export const incrementLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea válido
    if (!id || !id.match(/^tt\d+$/)) {
      res.status(400).json({
        success: false,
        error: 'ID de IMDb inválido. Debe tener el formato ttXXXXXXX'
      });
      return;
    }

    const newLikes = await likeModel.incrementLike(id);
    
    const response: LikeResponse = {
      success: true,
      data: {
        imdbId: id,
        likes: newLikes
      },
      message: 'Like incrementado correctamente'
    };

    res.json(response);
  } catch (error) {
    console.error('Error al incrementar like:', error);
    res.status(500).json({
      success: false,
      error: 'Error al incrementar like de la película'
    });
  }
};

/**
 * Obtener total de likes de todas las películas
 */
export const getTotalLikes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalLikes = await likeModel.getTotalLikes();
    
    const response: TotalLikesResponse = {
      success: true,
      data: {
        totalLikes
      },
      message: 'Total de likes calculado correctamente'
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener total de likes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener total de likes'
    });
  }
};
