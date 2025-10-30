# Sistema de Likes - Movie BFF

## 📋 Descripción

Sistema completo de gestión de likes para películas implementado en el Movie BFF (Backend For Frontend). Permite a los usuarios dar "like" a películas y consultar estadísticas de popularidad.

## 🎯 Funcionalidades Implementadas

### 1. Obtener Likes de una Película
- **Endpoint:** `GET /api/movies/:id/likes`
- **Descripción:** Consulta la cantidad de likes de una película específica por su IMDb ID
- **Parámetros:** 
  - `id` (path): IMDb ID de la película (formato: `ttXXXXXXX`)
- **Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "imdbId": "tt0362120",
    "likes": 43
  },
  "message": "Likes obtenidos correctamente"
}
```

### 2. Incrementar Like de una Película
- **Endpoint:** `POST /api/movies/:id/like`
- **Descripción:** Incrementa en 1 el contador de likes de una película. Si la película no existe en la BD, la crea automáticamente.
- **Parámetros:** 
  - `id` (path): IMDb ID de la película (formato: `ttXXXXXXX`)
- **Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "imdbId": "tt0362120",
    "likes": 44
  },
  "message": "Like incrementado correctamente"
}
```

### 3. Obtener Total de Likes
- **Endpoint:** `GET /api/likes/total`
- **Descripción:** Obtiene la suma total de todos los likes de todas las películas
- **Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "totalLikes": 12345
  },
  "message": "Total de likes obtenido correctamente"
}
```

### 4. Validación de IMDb ID
Todos los endpoints validan que el IMDb ID tenga el formato correcto (`ttXXXXXXX`):
- **Respuesta de error (400):**
```json
{
  "success": false,
  "error": "ID de IMDb inválido. Debe tener el formato ttXXXXXXX"
}
```

## 🏗️ Arquitectura

### Capa de Modelo (Data Access Layer)
**Archivo:** `src/models/likeModel.ts`

```typescript
class LikeModel {
  // Obtener likes de una película
  async getLikes(imdbId: string): Promise<number>
  
  // Incrementar like de una película (crea si no existe)
  async incrementLike(imdbId: string): Promise<number>
  
  // Obtener total de likes de todas las películas
  async getTotalLikes(): Promise<number>
  
  // Obtener likes de múltiples películas (uso futuro)
  async getBulkLikes(imdbIds: string[]): Promise<Map<string, number>>
}
```

### Capa de Controlador (Business Logic Layer)
**Archivo:** `src/controllers/likeController.ts`

```typescript
// GET /api/movies/:id/likes
export const getMovieLikes = async (req: Request, res: Response): Promise<void>

// POST /api/movies/:id/like
export const incrementLike = async (req: Request, res: Response): Promise<void>

// GET /api/likes/total
export const getTotalLikes = async (_req: Request, res: Response): Promise<void>
```

### Capa de Rutas (API Layer)
**Archivos:** 
- `src/routes/movieRoutes.ts` - Rutas de likes por película
- `src/routes/likesTotalRoutes.ts` - Ruta de total de likes

### Tipos TypeScript
**Archivo:** `src/types/movie.types.ts`

```typescript
interface LikeResponse {
  success: boolean;
  data: {
    imdbId: string;
    likes: number;
  };
  message?: string;
  error?: string;
}

interface TotalLikesResponse {
  success: boolean;
  data: {
    totalLikes: number;
  };
  message?: string;
}
```

## 🗄️ Base de Datos

### Tabla: `movie_likes`
```sql
CREATE TABLE IF NOT EXISTS movie_likes (
    id SERIAL PRIMARY KEY,
    imdb_id VARCHAR(20) UNIQUE NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices
- `UNIQUE INDEX` en `imdb_id` para evitar duplicados
- `INDEX` en `likes` para optimizar consultas de ordenamiento

## 🧪 Testing

### Colección de Postman
**Archivo:** `postman/Movie-BFF-Likes.postman_collection.json`

La colección incluye 6 requests con tests automáticos:

1. **Health Check** - Verifica que el servidor esté corriendo
2. **Obtener Likes de Película** - GET con validación de estructura de respuesta
3. **Incrementar Like de Película** - POST con validación de incremento
4. **Obtener Total de Likes** - GET con validación de suma total
5. **Película Nueva (Primera vez)** - POST que crea nueva película
6. **Error - IMDb ID Inválido** - Validación de error 400

### Tests Automáticos Incluidos
Cada request incluye tests que validan:
- ✅ Status code correcto (200, 400, etc.)
- ✅ Estructura de la respuesta JSON
- ✅ Tipos de datos correctos
- ✅ Valores esperados (success: true, incrementos, etc.)
- ✅ Mensajes de error apropiados

## 🐳 Docker

### Construcción de la Imagen
```bash
docker-compose build app
```

### Ejecución con Docker Compose
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs del backend
docker-compose logs app -f

# Detener servicios
docker-compose down
```

### Configuración
El servicio backend (`app`) en `docker-compose.yml`:
- Puerto: 3000
- Depende de PostgreSQL (postgres)
- Health check en `/health`
- Variables de entorno desde `.env`

## 📊 Ejemplos de Uso

### cURL
```bash
# Obtener likes de "The Prestige"
curl http://localhost:3000/api/movies/tt0362120/likes

# Incrementar like
curl -X POST http://localhost:3000/api/movies/tt0362120/like

# Total de likes
curl http://localhost:3000/api/likes/total
```

### JavaScript/Fetch
```javascript
// Obtener likes
const response = await fetch('http://localhost:3000/api/movies/tt0362120/likes');
const data = await response.json();
console.log(data.data.likes); // 43

// Incrementar like
await fetch('http://localhost:3000/api/movies/tt0362120/like', {
  method: 'POST'
});
```

### Postman
1. Importar colección desde `postman/Movie-BFF-Likes.postman_collection.json`
2. Configurar baseUrl en las variables de entorno (opcional)
3. Ejecutar requests individuales o toda la colección
4. Ver resultados de tests en la pestaña "Test Results"

## 🔒 Seguridad y Validación

### Validaciones Implementadas
- ✅ Formato de IMDb ID (`ttXXXXXXX`)
- ✅ Manejo de películas inexistentes (auto-creación)
- ✅ Transacciones ACID en la base de datos
- ✅ SQL Injection prevención (prepared statements)
- ✅ Error handling con try-catch
- ✅ Respuestas JSON estandarizadas

### Buenas Prácticas
- TypeScript para type safety
- Separación de capas (MVC)
- Async/await para código asíncrono
- Pool de conexiones PostgreSQL
- Logs estructurados
- Health checks

## 📝 Notas Técnicas

### Comportamiento de `incrementLike`
Usa `INSERT ... ON CONFLICT` de PostgreSQL para:
1. Intentar insertar una nueva película con 1 like
2. Si ya existe (CONFLICT), incrementar el contador
3. Retornar el valor actualizado

```sql
INSERT INTO movie_likes (imdb_id, likes) 
VALUES ($1, 1) 
ON CONFLICT (imdb_id) 
DO UPDATE SET 
  likes = movie_likes.likes + 1,
  updated_at = CURRENT_TIMESTAMP
RETURNING likes;
```

### Performance
- Query optimizado para `getTotalLikes` usando `SUM()`
- Índice en `imdb_id` para búsquedas rápidas
- Connection pooling para múltiples requests concurrentes

## 🚀 Próximos Pasos (Futuras Mejoras)

- [ ] Rate limiting para prevenir spam de likes
- [ ] Implementar "dislikes" o "rating system"
- [ ] Historial de likes por usuario
- [ ] Analytics de películas más populares
- [ ] Cache con Redis para likes frecuentemente consultados
- [ ] WebSockets para actualizaciones en tiempo real

---

**Desarrollado por:** Wílmer E. León  
**Fecha:** Octubre 2025  
**Issue:** #2 - Implementación del Sistema de Likes
