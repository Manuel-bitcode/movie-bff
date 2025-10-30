import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Detectar si estamos corriendo dentro de Docker
const isDocker = process.env.DOCKER_ENV === 'true';

// Definir host dinámicamente
const DB_HOST = isDocker ? process.env.DB_HOST || 'postgres' : process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || (isDocker ? '5432' : '5433'), 10);
const DB_NAME = process.env.DB_NAME || 'movie_bff';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

// Debug
console.log('🔍 Configuración de conexión:');
console.log(`Host: ${DB_HOST}`);
console.log(`Port: ${DB_PORT}`);
console.log(`Database: ${DB_NAME}`);
console.log(`User: ${DB_USER}`);
console.log('');

/**
 * Configuración de conexión a PostgreSQL
 */
const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('❌ Error en el pool de PostgreSQL:', err);
  process.exit(-1);
});

export default pool;
