import pool from '../config/database';
import { PoolClient } from 'pg';
import logger from '../utils/logger';

/**
 * Modelo simple para gestionar likes de películas
 */
export class LikeModel {
  /**
   * Verifica si existe el registro de esa película
   */
static async movieExists(imdbId: string): Promise<boolean> {
  const query = `SELECT 1 FROM movie_likes 
    WHERE imdb_id = $1 LIMIT 1`;
  const result = await pool.query(query, [imdbId]);
  return (result.rowCount ?? 0) > 0;
}

  /**
   * Obtiene el número actual de likes de una película
   */
  static async getLikes(imdbId: string): Promise<number> {
    const query = `SELECT likes_count FROM movie_likes 
    WHERE imdb_id = $1`;
    const result = await pool.query(query, [imdbId]);
    return result.rows.length > 0 ? result.rows[0].likes_count : 0;
  }

  /**
   * Incrementa likes con transacción y bloqueo de fila
   */
  static async incrementLike(imdbId: string): Promise<number> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');

      const selectQuery = `SELECT likes_count FROM movie_likes 
      WHERE imdb_id = $1 FOR UPDATE`;
      const selectResult = await client.query(selectQuery, [imdbId]);

      let newLikes: number;

      if (selectResult.rowCount === 0) {
        const insertQuery = `
          INSERT INTO movie_likes (imdb_id, likes_count) 
          VALUES ($1, 1) 
          RETURNING likes_count
        `;
        const insertResult = await client.query(insertQuery, [imdbId]);
        newLikes = insertResult.rows[0].likes_count;
      } else {
        const updateQuery = `
          UPDATE movie_likes 
          SET likes_count = likes_count + 1 
          WHERE imdb_id = $1 
          RETURNING likes_count
        `;
        const updateResult = await client.query(updateQuery, [imdbId]);
        newLikes = updateResult.rows[0].likes_count;
      }

      await client.query('COMMIT');
      logger.info('Like incrementado correctamente', { imdbId, newLikes });

      return newLikes;

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error incrementando like', { error, imdbId });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtiene el total de likes de todas las películas
   */
  static async getTotalLikes(): Promise<number> {
    const query = `SELECT COALESCE(SUM(likes_count), 0) AS total 
    FROM movie_likes`;
    const result = await pool.query(query);
    return parseInt(result.rows[0].total, 10);
  }
}

// Export como alias corto
export const likeModel = LikeModel;
