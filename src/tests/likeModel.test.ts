import { likeModel } from '../models/likeModel';

jest.mock('../config/database', () => ({
  getConnectionWithRetry: jest.fn(),
}));

import { getConnectionWithRetry } from '../config/database';

describe('LikeModel', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (getConnectionWithRetry as jest.Mock).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTotalLikes', () => {
    test('debe retornar el total de likes', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ total: '42' }],
      });

      const result = await likeModel.getTotalLikes();

      expect(result).toBe(42);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT COALESCE(SUM(likes_count), 0) AS total FROM movie_likes'
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('debe retornar 0 cuando no hay likes', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ total: '0' }],
      });

      const result = await likeModel.getTotalLikes();

      expect(result).toBe(0);
    });
  });

  describe('getLikesByImdbId', () => {
    test('debe retornar likes de una pelicula especifica', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ likes_count: 10 }],
      });

      const result = await likeModel.getLikesByImdbId('tt0111161');

      expect(result).toBe(10);
      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT likes_count FROM movie_likes WHERE imdb_id = $1',
        ['tt0111161']
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('debe retornar 0 cuando la pelicula no existe', async () => {
      mockClient.query.mockResolvedValue({
        rows: [],
      });

      const result = await likeModel.getLikesByImdbId('tt9999999');

      expect(result).toBe(0);
    });
  });

  describe('createLikeEntry', () => {
    test('debe crear entrada de likes para una pelicula', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      await likeModel.createLikeEntry('tt0111161');

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO movie_likes'),
        ['tt0111161']
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('incrementLike', () => {
    test('debe incrementar likes y retornar nuevo valor', async () => {
      mockClient.query.mockResolvedValue({
        rows: [{ likes_count: 11 }],
      });

      const result = await likeModel.incrementLike('tt0111161');

      expect(result).toBe(11);
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO movie_likes'),
        ['tt0111161']
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('withClient error handling', () => {
    test('debe liberar cliente incluso si hay error', async () => {
      mockClient.query.mockRejectedValue(new Error('Database error'));

      await expect(likeModel.getTotalLikes()).rejects.toThrow('Database error');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});

