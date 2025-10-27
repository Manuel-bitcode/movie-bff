import pool from './config/database';
import dotenv from 'dotenv';
import { LikeModel } from './models/likeModel';

// Cargar variables de entorno
dotenv.config();

// Debug: imprimir variables de entorno
console.log('🔍 Variables de entorno:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : 'undefined');
console.log('');

const likeModel = new LikeModel();

async function testDatabase() {
  console.log('🧪 Probando conexión a la base de datos PostgreSQL...\n');

  try {
    // Test 1: Obtener likes de una película existente
    console.log('Test 1: Obtener likes de tt0362120 (Scary Movie 4)');
    const likes = await likeModel.getLikes('tt0362120');
    console.log(`✅ Likes: ${likes}\n`);

    // Test 2: Incrementar likes
    console.log('Test 2: Incrementar likes de tt0362120');
    const newLikes = await likeModel.incrementLike('tt0362120');
    console.log(`✅ Nuevos likes: ${newLikes}\n`);

    // Test 3: Crear película nueva con like
    console.log('Test 3: Incrementar likes de película nueva (tt9999999)');
    const newMovieLikes = await likeModel.incrementLike('tt9999999');
    console.log(`✅ Likes de película nueva: ${newMovieLikes}\n`);

    // Test 4: Obtener likes en bulk
    console.log('Test 4: Obtener likes de múltiples películas');
    const bulkLikes = await likeModel.getBulkLikes(['tt0362120', 'tt3387520', 'tt0795461']);
    console.log('✅ Bulk likes:', Object.fromEntries(bulkLikes));
    console.log();

    // Test 5: Total de likes
    console.log('Test 5: Obtener total de likes');
    const total = await likeModel.getTotalLikes();
    console.log(`✅ Total de likes: ${total}\n`);

    console.log('✅ Todos los tests pasaron correctamente!');
  } catch (error) {
    console.error('❌ Error en los tests:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();
