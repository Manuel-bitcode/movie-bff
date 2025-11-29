import { Request, Response, NextFunction } from 'express';
import { logger } from '../middlewares/logger';

describe('Logger Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      socket: {
        remoteAddress: '192.168.1.1',
      } as any,
    };
    mockResponse = {};
    mockNext = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('debe loggear informacion de la peticion', () => {
    logger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test - IP: 127.0.0.1')
    );
    expect(mockNext).toHaveBeenCalled();
  });

  test('debe usar socket.remoteAddress cuando ip no esta disponible', () => {
    const requestWithoutIp = {
      method: 'GET',
      url: '/api/test',
      socket: {
        remoteAddress: '192.168.1.1',
      } as any,
    };

    logger(requestWithoutIp as Request, mockResponse as Response, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('192.168.1.1')
    );
    expect(mockNext).toHaveBeenCalled();
  });

  test('debe incluir timestamp en formato ISO', () => {
    logger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\]/)
    );
  });

  test('debe llamar a next para continuar la cadena de middlewares', () => {
    logger(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});

