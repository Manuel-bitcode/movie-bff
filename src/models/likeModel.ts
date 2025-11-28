import { PoolClient } from 'pg';
import { getConnectionWithRetry } from '../config/database';

export class LikeModel {
  private async withClient<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await getConnectionWithRetry();
    try {
      return await callback(client);
    } finally {
      client.release();
    }
  }

  async getTotalLikes(): Promise<number> {
    return this.withClient(async client => {
      const result = await client.query<{ total: string }>(
        'SELECT COALESCE(SUM(likes_count), 0) AS total FROM movie_likes',
      );
      return Number(result.rows[0].total);
    });
  }

  async getLikesByImdbId(imdbId: string): Promise<number> {
    return this.withClient(async client => {
      const result = await client.query<{ likes_count: number }>(
        'SELECT likes_count FROM movie_likes WHERE imdb_id = $1',
        [imdbId],
      );

      if (result.rows.length === 0) {
        return 0;
      }

      return result.rows[0].likes_count;
    });
  }

  async createLikeEntry(imdbId: string): Promise<void> {
    await this.withClient(async client => {
      await client.query(
        `
          INSERT INTO movie_likes (imdb_id, likes_count)
          VALUES ($1, 0)
          ON CONFLICT (imdb_id) DO NOTHING
        `,
        [imdbId],
      );
    });
  }

  async incrementLike(imdbId: string): Promise<number> {
    return this.withClient(async client => {
      const result = await client.query<{ likes_count: number }>(
        `
          INSERT INTO movie_likes (imdb_id, likes_count)
          VALUES ($1, 1)
          ON CONFLICT (imdb_id)
          DO UPDATE
          SET likes_count = movie_likes.likes_count + 1,
              updated_at = CURRENT_TIMESTAMP
          RETURNING likes_count
        `,
        [imdbId],
      );

      return result.rows[0].likes_count;
    });
  }
}

export const likeModel = new LikeModel();
export default likeModel;
