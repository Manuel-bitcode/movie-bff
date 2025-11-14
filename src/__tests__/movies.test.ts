import request from 'supertest';
import app from '../app';
import pool from '../config/database';

describe('B1: GET /api/movies - Endpoint de películas', () => {
  
  // Cerrar conexión de base de datos después de todos los tests
  afterAll(async () => {
    await pool.end();
  });
  
  // Test 1: Debe responder con status 200 OK
  it('Debe responder con status 200 OK', async () => {
    const response = await request(app).get('/api/movies');
    expect(response.status).toBe(200);
  });

  // Test 2: Debe retornar exactamente 10 películas
  it('Debe retornar exactamente 10 películas', async () => {
    const response = await request(app).get('/api/movies');
    expect(response.body.data).toHaveLength(10);
    expect(response.body.count).toBe(10);
  });

  // Test 3: Debe tener la estructura correcta de respuesta
  it('Debe tener la estructura correcta de respuesta', async () => {
    const response = await request(app).get('/api/movies');
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('count');
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  // Test 4: Cada película debe tener todos los campos obligatorios
  it('Cada película debe tener todos los campos obligatorios', async () => {
    const response = await request(app).get('/api/movies');
    const movies = response.body.data;
    
    const requiredFields = [
      'imdbId',
      'title',
      'year',
      'genre',
      'director',
      'actors',
      'plot',
      'poster',
      'imdbRating',
      'imdbVotes',
      'runtime',
      'likes'
    ];

    movies.forEach((movie: any) => {
      requiredFields.forEach(field => {
        expect(movie).toHaveProperty(field);
      });
    });
  });

  // Test 5: Cada película debe tener imdbId con formato válido (ttXXXXXXX)
  it('Cada película debe tener imdbId con formato válido (ttXXXXXXX)', async () => {
    const response = await request(app).get('/api/movies');
    const movies = response.body.data;
    const imdbIdRegex = /^tt\d{7,8}$/;

    movies.forEach((movie: any) => {
      expect(movie.imdbId).toMatch(imdbIdRegex);
    });
  });

  // Test 6: El campo likes debe ser un número mayor o igual a 0
  it('El campo likes debe ser un número mayor o igual a 0', async () => {
    const response = await request(app).get('/api/movies');
    const movies = response.body.data;

    movies.forEach((movie: any) => {
      expect(typeof movie.likes).toBe('number');
      expect(movie.likes).toBeGreaterThanOrEqual(0);
    });
  });

  // Test 7: El campo imdbRating debe ser un string con formato válido
  it('El campo imdbRating debe ser un string con formato válido', async () => {
    const response = await request(app).get('/api/movies');
    const movies = response.body.data;

    movies.forEach((movie: any) => {
      expect(typeof movie.imdbRating).toBe('string');
      // Validar que sea un número válido en formato string (ej: "8.5")
      expect(parseFloat(movie.imdbRating)).not.toBeNaN();
    });
  });

  // Test 8: El endpoint debe responder en menos de 5 segundos
  it('El endpoint debe responder en menos de 5 segundos', async () => {
    const startTime = Date.now();
    await request(app).get('/api/movies');
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000); // 5 segundos
  });

  // Test 9: Debe incluir al menos algunas películas populares conocidas
  it('Debe incluir al menos algunas películas populares conocidas', async () => {
    const response = await request(app).get('/api/movies');
    const movies = response.body.data;
    const movieTitles = movies.map((m: any) => m.title);

    const popularMovies = [
      'The Shawshank Redemption',
      'The Godfather',
      'The Dark Knight'
    ];

    // Al menos 2 de las 3 películas populares deben estar presentes
    const foundMovies = popularMovies.filter(title => 
      movieTitles.includes(title)
    );
    expect(foundMovies.length).toBeGreaterThanOrEqual(2);
  });

  // Test 10: El campo poster debe ser una URL válida
  it('El campo poster debe ser una URL válida', async () => {
    const response = await request(app).get('/api/movies');
    const movies = response.body.data;
    const urlRegex = /^https?:\/\/.+/;

    movies.forEach((movie: any) => {
      expect(movie.poster).toMatch(urlRegex);
    });
  });
});
