import { Request, Response } from 'express';
import { incrementLike } from '../controllers/likeController';
import { likeModel } from '../models/likeModel';

jest.mock('../models/likeModel');

describe('incrementLike Controller', () => {
  it('debería retornar 200 cuando un like se incrementa correctamente', async () => {
    const mockReq = {
      params: { id: 'tt0362120' }
    } as unknown as Request;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    (likeModel.movieExists as jest.Mock).mockResolvedValue(true);
    (likeModel.getLikes as jest.Mock).mockResolvedValue(5);
    (likeModel.incrementLike as jest.Mock).mockResolvedValue(6);

    await incrementLike(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          imdbId: 'tt0362120',
          likes: 6,
          previousLikes: 5
        })
      })
    );
  });
});
