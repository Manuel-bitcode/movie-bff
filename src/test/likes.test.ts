import { Request, Response } from 'express';
import { incrementLike, getMovieLikes } from '../controllers/likeController';
import { likeModel } from '../models/likeModel';

jest.mock('../models/likeModel');

describe('Likes Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn(() => ({ json: jsonMock }));
    jsonMock = jest.fn();

    req = {
      params: { id: 'tt0362120' } // tu película real
    };

    res = {
      status: statusMock,
      json: jsonMock
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('incrementLike debería retornar 200 cuando un like se incrementa correctamente', async () => {
    // Mockear funciones del modelo
    (likeModel.movieExists as jest.Mock).mockResolvedValue(true);
    (likeModel.getLikes as jest.Mock).mockResolvedValue(5);
    (likeModel.incrementLike as jest.Mock).mockResolvedValue(6);

    await incrementLike(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: { imdbId: 'tt0362120', likes: 6, previousLikes: 5 }
    }));
  });

  it('getMovieLikes debería retornar 200 con los likes actuales', async () => {
    (likeModel.getLikes as jest.Mock).mockResolvedValue(10);

    await getMovieLikes(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: { imdbId: 'tt0362120', likes: 10 }
    }));
  });
});
