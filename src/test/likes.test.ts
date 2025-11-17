// src/test/likes.test.ts
import { Request, Response } from 'express';
import { incrementLike, getMovieLikes, getTotalLikes } from '../controllers/likeController';
import { likeModel } from '../models/likeModel';

jest.mock('../models/likeModel');

describe('LikeController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('incrementLike', () => {
    it('debería retornar 200 cuando un like se incrementa correctamente', async () => {
      req = { params: { id: 'tt0362120' } };

      const mockedMovieExists = likeModel.movieExists as jest.MockedFunction<typeof likeModel.movieExists>;
      const mockedGetLikes = likeModel.getLikes as jest.MockedFunction<typeof likeModel.getLikes>;
      const mockedIncrementLike = likeModel.incrementLike as jest.MockedFunction<typeof likeModel.incrementLike>;

      mockedMovieExists.mockResolvedValue(true);
      mockedGetLikes.mockResolvedValue(5);
      mockedIncrementLike.mockResolvedValue(6);

      await incrementLike(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { imdbId: 'tt0362120', likes: 6, previousLikes: 5 },
        })
      );
    });

    it('debería retornar 404 si la película no existe', async () => {
      req = { params: { id: 'tt0000000' } };
      const mockedMovieExists = likeModel.movieExists as jest.MockedFunction<typeof likeModel.movieExists>;
      mockedMovieExists.mockResolvedValue(false);

      await incrementLike(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Movie not found',
        })
      );
    });
  });

  describe('getMovieLikes', () => {
    it('debería retornar los likes correctamente', async () => {
      req = { params: { id: 'tt0362120' } };
      const mockedGetLikes = likeModel.getLikes as jest.MockedFunction<typeof likeModel.getLikes>;
      mockedGetLikes.mockResolvedValue(10);

      await getMovieLikes(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { imdbId: 'tt0362120', likes: 10 },
        })
      );
    });

    it('debería retornar 400 si el ID es inválido', async () => {
      req = { params: { id: 'invalid_id' } };

      await getMovieLikes(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });

  describe('getTotalLikes', () => {
    it('debería retornar el total de likes', async () => {
      const mockedGetTotalLikes = likeModel.getTotalLikes as jest.MockedFunction<typeof likeModel.getTotalLikes>;
      mockedGetTotalLikes.mockResolvedValue(42);

      await getTotalLikes({} as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { totalLikes: 42 },
        })
      );
    });
  });
});
