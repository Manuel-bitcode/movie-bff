import path from 'path';
import { spawnSync } from 'child_process';
import { Pool } from 'pg';
import pool, { ensureDatabaseConnection } from '../config/database';
import likeModel from '../models/likeModel';

jest.setTimeout(120000);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const composeCommand = (process.env.DOCKER_COMPOSE_CMD || 'docker compose').split(' ');
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_NAME = process.env.DB_NAME || 'movie_bff';

const runCompose = (args: string[]) => {
  const result = spawnSync(composeCommand[0], [...composeCommand.slice(1), ...args], {
    cwd: PROJECT_ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${composeCommand.join(' ')} ${args.join(' ')}\n${result.stderr || result.stdout}`,
    );
  }

  return result.stdout.trim();
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const waitForPostgres = async (retries = 20, delayMs = 1500): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      runCompose(['exec', '-T', 'postgres', 'pg_isready', '-U', DB_USER, '-d', DB_NAME]);
      return;
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
      await sleep(delayMs);
    }
  }
};

const truncateLikesTable = async () => {
  await pool.query('TRUNCATE TABLE movie_likes RESTART IDENTITY;');
};

beforeAll(async () => {
  runCompose(['up', '-d', 'postgres']);
  await waitForPostgres();
  await ensureDatabaseConnection();
});

afterAll(async () => {
  await pool.end();
  try {
    runCompose(['down']);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to stop docker compose stack:', error);
  }
});

beforeEach(async () => {
  await waitForPostgres();
  await truncateLikesTable();
});

describe('Database connectivity and persistence', () => {
  test('Conexion exitosa usando pg_isready', async () => {
    await expect(waitForPostgres()).resolves.not.toThrow();
  });

  test('getTotalLikes retorna suma correcta', async () => {
    await likeModel.createLikeEntry('tt0111161');
    await likeModel.createLikeEntry('tt0068646');

    await likeModel.incrementLike('tt0111161');
    await likeModel.incrementLike('tt0111161');
    await likeModel.incrementLike('tt0068646');

    const total = await likeModel.getTotalLikes();
    expect(total).toBe(3);
  });

  test('Persistencia tras reinicio de contenedor', async () => {
    const imdbId = 'tt0133093';

    await likeModel.createLikeEntry(imdbId);
    await likeModel.incrementLike(imdbId);
    await likeModel.incrementLike(imdbId);

    const likesBeforeRestart = await likeModel.getLikesByImdbId(imdbId);
    expect(likesBeforeRestart).toBe(2);

    runCompose(['stop', 'postgres']);
    await sleep(2000);
    runCompose(['start', 'postgres']);
    await waitForPostgres();
    await ensureDatabaseConnection();

    const likesAfterRestart = await likeModel.getLikesByImdbId(imdbId);
    expect(likesAfterRestart).toBe(likesBeforeRestart);
  });

  test('Multiples inserts concurrentes actualizan correctamente', async () => {
    const imdbId = 'tt0468569';
    await likeModel.createLikeEntry(imdbId);

    const increments = Array.from({ length: 10 }, () => likeModel.incrementLike(imdbId));
    const results = await Promise.all(increments);
    const sortedResults = [...results].sort((a, b) => a - b);

    expect(sortedResults).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const persistedLikes = await likeModel.getLikesByImdbId(imdbId);
    expect(persistedLikes).toBe(10);
  });

  test('Manejo de errores de conexion y timeout respetado', async () => {
    const start = Date.now();
    const faultyPool = new Pool({
      host: '127.0.0.1',
      port: 6543, // Puerto incorrecto para forzar fallo
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      connectionTimeoutMillis: 5000,
    });

    await expect(faultyPool.connect()).rejects.toThrow();
    const duration = Date.now() - start;
    expect(duration).toBeLessThanOrEqual(6000);

    await faultyPool.end();
  });
});

