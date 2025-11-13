import request from 'supertest';
import app from '../app';
import pool from '../config/database';

describe('GET /api/likes/total - Contador Global de Likes', () => {
  beforeAll(async () => {
    // Limpiar base de datos antes de los tests
    await pool.query('DELETE FROM movie_likes');
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await pool.query('DELETE FROM movie_likes');
    await pool.end();
  });

  afterEach(async () => {
    // Limpiar después de cada test
    await pool.query('DELETE FROM movie_likes');
  });

  describe('✅ Casos de éxito', () => {
    it('debe retornar 0 cuando no hay likes en la base de datos', async () => {
      const response = await request(app)
        .get('/api/likes/total')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          totalLikes: 0
        },
        message: 'Total de likes calculado correctamente'
      });
    });

    it('debe retornar el total correcto con una sola película', async () => {
      // Insertar 1 película con 5 likes
      await pool.query(
        'INSERT INTO movie_likes (id, likes) VALUES ($1, $2)',
        ['tt0111161', 5]
      );

      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBe(5);
      expect(response.body.message).toBe('Total de likes calculado correctamente');
    });

    it('debe sumar correctamente likes de múltiples películas', async () => {
      // Insertar múltiples películas
      await pool.query(
        'INSERT INTO movie_likes (id, likes) VALUES ($1, $2), ($3, $4), ($5, $6)',
        ['tt0111161', 10, 'tt0068646', 15, 'tt0468569', 8]
      );

      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBe(33); // 10 + 15 + 8
      expect(response.body.message).toBe('Total de likes calculado correctamente');
    });

    it('debe actualizarse en tiempo real al incrementar likes', async () => {
      // Estado inicial: 0 likes
      let response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(0);

      // Incrementar like en película 1
      await request(app).post('/api/likes/tt0111161');
      response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(1);

      // Incrementar like en película 2
      await request(app).post('/api/likes/tt0068646');
      response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(2);

      // Incrementar otro like en película 1
      await request(app).post('/api/likes/tt0111161');
      response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(3);
    });

    it('debe manejar grandes cantidades de likes', async () => {
      // Insertar 100 películas con diferentes cantidades de likes
      const values: string[] = [];
      let expectedTotal = 0;

      for (let i = 1; i <= 100; i++) {
        const likes = i * 2; // 2, 4, 6, 8, ..., 200
        values.push(`('tt${String(i).padStart(7, '0')}', ${likes})`);
        expectedTotal += likes;
      }

      await pool.query(
        `INSERT INTO movie_likes (id, likes) VALUES ${values.join(', ')}`
      );

      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBe(expectedTotal); // 10100
      expect(response.body.data.totalLikes).toBe(10100);
    });
  });

  describe('🔧 Casos de validación de estructura', () => {
    it('debe retornar la estructura de respuesta correcta', async () => {
      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);

      // Validar estructura de respuesta
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('totalLikes');

      // Validar tipos de datos
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.data.totalLikes).toBe('number');
      expect(typeof response.body.message).toBe('string');
    });

    it('debe retornar Content-Type application/json', async () => {
      const response = await request(app)
        .get('/api/likes/total')
        .expect('Content-Type', /json/);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('⚡ Tests de rendimiento', () => {
    it('debe responder en menos de 100ms con 1000 películas', async () => {
      // Insertar 1000 películas
      const values: string[] = [];
      for (let i = 1; i <= 1000; i++) {
        values.push(`('tt${String(i).padStart(7, '0')}', ${Math.floor(Math.random() * 100)})`);
      }

      await pool.query(
        `INSERT INTO movie_likes (id, likes) VALUES ${values.join(', ')}`
      );

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`⏱️ Tiempo de respuesta con 1000 películas: ${responseTime}ms`);

      expect(responseTime).toBeLessThan(100);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBeGreaterThan(0);
    });
  });

  describe('🛡️ Tests de resiliencia', () => {
    it('debe mantener consistencia después de múltiples operaciones concurrentes', async () => {
      // Realizar 50 operaciones concurrentes de incrementar likes
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app).post(`/api/likes/tt${String(i % 10).padStart(7, '0')}`)
        );
      }

      await Promise.all(promises);

      // Verificar total
      const response = await request(app).get('/api/likes/total');
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBe(50);
    });

    it('debe retornar 0 si todas las películas se borran', async () => {
      // Insertar datos
      await pool.query(
        'INSERT INTO movie_likes (id, likes) VALUES ($1, $2), ($3, $4)',
        ['tt0111161', 10, 'tt0068646', 20]
      );

      // Verificar que hay likes
      let response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(30);

      // Borrar todas las películas
      await pool.query('DELETE FROM movie_likes');

      // Verificar que retorna 0
      response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(0);
    });
  });

  describe('❌ Casos de error', () => {
    it('debe manejar correctamente errores de base de datos', async () => {
      // Simular error cerrando temporalmente el pool
      const originalQuery = pool.query.bind(pool);
      pool.query = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/likes/total')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Error al obtener total de likes');

      // Restaurar
      pool.query = originalQuery;
    });
  });
});
