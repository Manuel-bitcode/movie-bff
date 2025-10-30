import pool from '../config/database';

/**
 * Modelo simple para gestionar likes de películas
 */
export class LikeModel {
  /**
   * Obtener likes de una película por su imdbID
   * @param imdbId ID de IMDb de la película (ej: "tt0362120")
   * @returns Cantidad de likes o 0 si no existe
   */
  async getLikes(imdbId: string): Promise<number> {
    const client = await pool.connect();
    try {
      const query = 'SELECT likes FROM movie_likes WHERE id = $1';
      const result = await client.query(query, [imdbId]);
      
      if (result.rows.length === 0) {
        return 0; // Si no existe, retornar 0
      }
      
      return result.rows[0].likes;
    } finally {
      client.release();
    }
  }

  /**
   * Incrementar likes de una película
   * Si la película no existe, la crea con 1 like
   * @param imdbId ID de IMDb de la película
   * @returns Nueva cantidad de likes
   */
  async incrementLike(imdbId: string): Promise<number> {
    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO movie_likes (id, likes)
        VALUES ($1, 1)
        ON CONFLICT (id)
        DO UPDATE SET likes = movie_likes.likes + 1
        RETURNING likes
      `;
      
      const result = await client.query(query, [imdbId]);
      return result.rows[0].likes;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener likes de múltiples películas en una sola query
   * @param imdbIds Array de IMDb IDs
   * @returns Map con imdbId como key y likes como value
   */
  async getBulkLikes(imdbIds: string[]): Promise<Map<string, number>> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT id, likes
        FROM movie_likes
        WHERE id = ANY($1)
      `;
      
      const result = await client.query(query, [imdbIds]);
      
      const likesMap = new Map<string, number>();
      result.rows.forEach(row => {
        likesMap.set(row.id, row.likes);
      });
      
      return likesMap;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener el total de likes de todas las películas
   * @returns Suma total de likes
   */
  async getTotalLikes(): Promise<number> {
    const client = await pool.connect();
    try {
      const query = 'SELECT COALESCE(SUM(likes), 0) AS total FROM movie_likes';
      const result = await client.query(query);
      return parseInt(result.rows[0].total, 10);
    } finally {
      client.release();
    }
  }
}

// Exportar instancia singleton
export const likeModel = new LikeModel();
