import { Request, Response } from 'express';
import { getMovieLikes, incrementLike, getTotalLikes } from '../controllers/likeController';
import { likeModel } from '../models/likeModel';

jest.mock('../models/likeModel');

describe('LikeController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockRequest = {
      params: {},
    };
    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('getMovieLikes', () => {
    test('debe retornar likes de una pelicula', async () => {
      mockRequest.params = { id: 'tt0111161' };
      (likeModel.getLikesByImdbId as jest.Mock).mockResolvedValue(42);

      await getMovieLikes(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          imdbId: 'tt0111161',
          likes: 42,
        },
        message: 'Likes obtenidos correctamente',
      });
    });

    test('debe retornar error 400 cuando id es invalido', async () => {
      mockRequest.params = { id: 'invalid' };

      await getMovieLikes(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'ID de IMDb inválido. Debe tener el formato ttXXXXXXX',
      });
    });

    test('debe retornar error 400 cuando id no esta presente', async () => {
      mockRequest.params = {};

      await getMovieLikes(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    test('debe manejar errores de base de datos', async () => {
      mockRequest.params = { id: 'tt0111161' };
      (likeModel.getLikesByImdbId as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await getMovieLikes(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Error al obtener likes de la película',
      });
    });
  });

  describe('incrementLike', () => {
    test('debe incrementar likes correctamente', async () => {
      mockRequest.params = { id: 'tt0111161' };
      (likeModel.incrementLike as jest.Mock).mockResolvedValue(43);

      await incrementLike(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          imdbId: 'tt0111161',
          likes: 43,
        },
        message: 'Like incrementado correctamente',
      });
    });

    test('debe retornar error 400 cuando id es invalido', async () => {
      mockRequest.params = { id: 'invalid' };

      await incrementLike(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'ID de IMDb inválido. Debe tener el formato ttXXXXXXX',
      });
    });

    test('debe manejar errores al incrementar', async () => {
      mockRequest.params = { id: 'tt0111161' };
      (likeModel.incrementLike as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await incrementLike(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Error al incrementar like de la película',
      });
    });
  });

  describe('getTotalLikes', () => {
    test('debe retornar el total de likes', async () => {
      (likeModel.getTotalLikes as jest.Mock).mockResolvedValue(1000);

      await getTotalLikes(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          totalLikes: 1000,
        },
        message: 'Total de likes calculado correctamente',
      });
    });

    test('debe manejar errores al obtener total', async () => {
      (likeModel.getTotalLikes as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await getTotalLikes(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Error al obtener total de likes',
      });
    });
  });
});

