import { Request, Response } from 'express';
import { likeModel } from '../models/likeModel';
import { LikeResponse, TotalLikesResponse } from '../types/movie.types';

export const getMovieLikes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^tt\d+$/)) {
      res.status(400).json({
        success: false,
        error: 'ID de IMDb inválido. Debe tener formato ttXXXXXXX'
      });
      return;
    }

    const likes = await likeModel.getLikes(id);

    const response: LikeResponse = {
      success: true,
      data: { imdbId: id, likes },
      message: 'Likes obtenidos correctamente'
    };

    res.json(response);
  } catch (error) {
    console.error('Error en getMovieLikes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener likes' });
  }
};

export const incrementLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: imdbId } = req.params;

    const exists = await likeModel.movieExists(imdbId);
    if (!exists) {
      res.status(404).json({ success: false, error: 'Movie not found' });
      return;
    }

    const previousLikes = await likeModel.getLikes(imdbId);
    const newLikes = await likeModel.incrementLike(imdbId);

    res.status(200).json({
      success: true,
      message: 'Like incrementado correctamente',
      data: { imdbId, likes: newLikes, previousLikes },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

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
