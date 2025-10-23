import { Request, Response, NextFunction } from 'express';
import { Movie } from '../types/movie.types';

// Mock data - Reemplazar con llamadas a base de datos o API externa
let movies: Movie[] = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    year: 1994,
    genre: 'Drama',
    director: 'Frank Darabont'
  },
  {
    id: 2,
    title: 'The Godfather',
    year: 1972,
    genre: 'Crime',
    director: 'Francis Ford Coppola'
  }
];

// Obtener todas las películas
export const getAllMovies = async (
  req: Request,
  res: Response<any>,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    next(error);
  }
};


