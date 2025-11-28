import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isDocker = process.env.DOCKER_ENV === 'true';
const DB_HOST = process.env.DB_HOST || (isDocker ? 'postgres' : 'localhost');
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_NAME = process.env.DB_NAME || 'movie_bff';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const MAX_CONNECTION_RETRIES = parseInt(process.env.DB_CONN_RETRIES || '5', 10);
const CONNECTION_TIMEOUT_MS = parseInt(process.env.DB_CONN_TIMEOUT_MS || '5000', 10);
const RETRY_DELAY_MS = parseInt(process.env.DB_CONN_RETRY_DELAY_MS || '1000', 10);

const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
});

pool.on('error', (err: Error) => {
  console.error('❌ Error en el pool de PostgreSQL:', err);
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testClient(client: PoolClient): Promise<void> {
  await client.query('SELECT 1');
}

export async function getConnectionWithRetry(
  retries = MAX_CONNECTION_RETRIES,
  delayMs = RETRY_DELAY_MS,
): Promise<PoolClient> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    try {
      const client = await pool.connect();
      try {
        await testClient(client);
        return client;
      } catch (validationError) {
        client.release();
        throw validationError;
      }
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt >= retries) {
        break;
      }
      await delay(delayMs);
    }
  }

  throw new Error(
    `Unable to acquire a PostgreSQL connection after ${retries} attempts. Last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

export async function ensureDatabaseConnection(): Promise<void> {
  const client = await getConnectionWithRetry();
  client.release();
}

export default pool;
