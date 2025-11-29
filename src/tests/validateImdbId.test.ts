import { Request, Response, NextFunction } from 'express';
import { validateImdbId } from '../middlewares/validateImdbId';

describe('ValidateImdbId Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {
      params: {},
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn();
  });

  test('debe retornar error 400 cuando imdbId no esta presente', () => {
    validateImdbId(mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'imdbId parameter is required',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('debe retornar error 400 cuando formato de imdbId es invalido', () => {
    mockRequest.params = { imdbId: 'invalid123' };

    validateImdbId(mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid imdbId format. Expected format: tt1234567 (tt + at least 7 digits)',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('debe retornar error 400 cuando imdbId tiene menos de 7 digitos', () => {
    mockRequest.params = { imdbId: 'tt12345' };

    validateImdbId(mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('debe llamar a next cuando imdbId es valido con 7 digitos', () => {
    mockRequest.params = { imdbId: 'tt1234567' };

    validateImdbId(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  test('debe llamar a next cuando imdbId es valido con mas de 7 digitos', () => {
    mockRequest.params = { imdbId: 'tt12345678' };

    validateImdbId(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  test('debe validar formato IMDb real', () => {
    mockRequest.params = { imdbId: 'tt0111161' };

    validateImdbId(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

