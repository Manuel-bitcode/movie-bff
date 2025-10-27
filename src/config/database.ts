import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env
dotenv.config();

// Debug: imprimir configuración de conexión
console.log('🔍 Configuración de conexión:');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5432'}`);
console.log(`Database: ${process.env.DB_NAME || 'movie_bff'}`);
console.log(`User: ${process.env.DB_USER || 'postgres'}`);
console.log('');

/**
 * Configuración de conexión a PostgreSQL
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'movie_bff',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Verificar conexión a la base de datos
 */
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err: Error) => {
  console.error('❌ Error en el pool de PostgreSQL:', err);
  process.exit(-1);
});

export default pool;
