import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { getAllMovies } from '../controllers/movieController';
import { likeModel } from '../models/likeModel';

jest.mock('axios');
jest.mock('../models/likeModel');
jest.mock('../config/config', () => ({
  __esModule: true,
  default: {
    OMDB_API_KEY: 'test-api-key',
  },
}));

describe('MovieController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockRequest = {};
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
    mockNext = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('getAllMovies', () => {
    test('debe retornar lista de peliculas con datos de OMDB y likes', async () => {
      const mockOmdbResponse = {
        data: {
          Response: 'True',
          imdbID: 'tt0111161',
          Title: 'The Shawshank Redemption',
          Year: '1994',
          Rated: 'R',
          Genre: 'Drama',
          Director: 'Frank Darabont',
          Actors: 'Tim Robbins, Morgan Freeman',
          Plot: 'Two imprisoned men bond',
          Poster: 'https://example.com/poster.jpg',
          imdbRating: '9.3',
          imdbVotes: '2,500,000',
          Runtime: '142 min',
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockOmdbResponse);
      (likeModel.getLikesByImdbId as jest.Mock).mockResolvedValue(42);

      await getAllMovies(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            imdbId: 'tt0111161',
            title: 'The Shawshank Redemption',
            likes: 42,
          }),
        ]),
        count: expect.any(Number),
        message: 'Películas obtenidas correctamente',
      });
    });

    test('debe filtrar peliculas que OMDB no encuentra', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { Response: 'False' },
      });
      (likeModel.getLikesByImdbId as jest.Mock).mockResolvedValue(0);

      await getAllMovies(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
        message: 'Películas obtenidas correctamente',
      });
    });

    test('debe manejar errores de axios y continuar con otras peliculas', async () => {
      (axios.get as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          data: {
            Response: 'True',
            imdbID: 'tt0068646',
            Title: 'The Godfather',
            Year: '1972',
            Rated: 'R',
            Genre: 'Crime, Drama',
            Director: 'Francis Ford Coppola',
            Actors: 'Marlon Brando, Al Pacino',
            Plot: 'The aging patriarch',
            Poster: 'https://example.com/poster2.jpg',
            imdbRating: '9.2',
            imdbVotes: '1,800,000',
            Runtime: '175 min',
          },
        });
      (likeModel.getLikesByImdbId as jest.Mock).mockResolvedValue(10);

      await getAllMovies(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );
    });

    test('debe loggear error cuando falla obteniendo una pelicula', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      (likeModel.getLikesByImdbId as jest.Mock).mockResolvedValue(0);

      await getAllMovies(mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    test('debe incluir likes en 0 cuando no hay likes en BD', async () => {
      const mockOmdbResponse = {
        data: {
          Response: 'True',
          imdbID: 'tt0111161',
          Title: 'Test Movie',
          Year: '2000',
          Rated: 'PG',
          Genre: 'Action',
          Director: 'Test Director',
          Actors: 'Actor 1',
          Plot: 'Test plot',
          Poster: 'test.jpg',
          imdbRating: '7.5',
          imdbVotes: '1000',
          Runtime: '120 min',
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockOmdbResponse);
      (likeModel.getLikesByImdbId as jest.Mock).mockResolvedValue(0);

      await getAllMovies(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              likes: 0,
            }),
          ]),
        })
      );
    });
  });
});

