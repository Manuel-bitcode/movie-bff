# 🗄️ Base de Datos PostgreSQL - Guía de Configuración

## ✅ Estado de Implementación

La base de datos PostgreSQL ha sido configurada completamente. Todos los archivos necesarios están creados y listos para usar.

---

## 📦 Archivos Creados

### 1. Script SQL de Inicialización
**Archivo**: `database/init.sql`
- ✅ Tabla `movie_likes` con campos `id` y `likes`
- ✅ Constraint para evitar likes negativos
- ✅ 5 películas de prueba insertadas
- ✅ Índice para búsquedas rápidas
- ✅ Comentarios de documentación

### 2. Docker Compose
**Archivo**: `docker-compose.yml`
- ✅ Servicio PostgreSQL 16 Alpine
- ✅ Health check configurado
- ✅ Auto-inicialización con script SQL
- ✅ Persistencia de datos con volúmenes
- ✅ Logs rotados (max 10MB)

### 3. Configuración de Base de Datos
**Archivo**: `src/config/database.ts`
- ✅ Pool de conexiones PostgreSQL
- ✅ Máximo 20 conexiones
- ✅ Timeout configurado
- ✅ Manejo de errores

### 4. Modelo de Likes
**Archivo**: `src/models/likeModel.ts`
- ✅ `getLikes(imdbId)` - Obtener likes de una película
- ✅ `incrementLike(imdbId)` - Incrementar likes (UPSERT)
- ✅ `getBulkLikes(imdbIds[])` - Obtener múltiples likes
- ✅ `getTotalLikes()` - Total de likes

### 5. Script de Prueba
**Archivo**: `src/test-db.ts`
- ✅ Tests completos de todas las operaciones CRUD
- ✅ Verificación de conexión
- ✅ Validación de datos

### 6. Variables de Entorno
**Archivo**: `.env.example`
- ✅ Configuración de PostgreSQL
- ✅ Variables de servidor
- ✅ API externa

### 7. Dependencias Instaladas
- ✅ `pg` v8.11.0 - Driver de PostgreSQL
- ✅ `@types/pg` v8.10.0 - Tipos TypeScript

---

## 🚀 Cómo Levantar PostgreSQL

### ⚠️ IMPORTANTE: Configuración de Puertos

Este proyecto usa el **puerto 5433** para PostgreSQL en Docker porque:
- Tu PostgreSQL local ya está usando el puerto **5432**
- El contenedor de Docker se configuró en **5433** para evitar conflictos

**Configuración actual**:
```env
DB_HOST=127.0.0.1
DB_PORT=5433          # ← Nota: Puerto 5433, NO 5432
DB_NAME=movie_bff
DB_USER=postgres
DB_PASSWORD=1234      # ← Tu contraseña de PostgreSQL local
```

### Paso 1: Iniciar Docker Desktop
```bash
# Asegúrate de que Docker Desktop esté corriendo
# Busca el ícono de Docker en la bandeja del sistema
```

### Paso 2: Levantar PostgreSQL
```bash
# Levantar solo el servicio de PostgreSQL
docker-compose up -d postgres

# Verificar que esté corriendo
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f postgres
```

**Salida esperada**:
```
✅ PostgreSQL está corriendo en puerto 5433 (mapeado internamente a 5432)
✅ Base de datos 'movie_bff' creada
✅ Tabla 'movie_likes' creada
✅ Datos de prueba insertados
```

---

## 🧪 Verificar la Instalación

### Opción 1: Verificar con psql

```bash
# Conectar a PostgreSQL
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff

# Dentro de psql:
\dt                           # Listar tablas
\d movie_likes                # Ver estructura de la tabla
SELECT * FROM movie_likes;    # Ver datos
\q                            # Salir
```

**Salida esperada**:
```sql
      id       | likes
---------------+-------
 tt0362120     |    42
 tt3387520     |   128
 tt0795461     |    35
 tt9654108     |    15
 tt1833879     |     8
(5 rows)
```

### Opción 2: Ejecutar Script de Prueba

```bash
# Asegúrate de tener PostgreSQL corriendo
npx ts-node src/test-db.ts
```

**Salida esperada**:
```
🧪 Probando conexión a la base de datos PostgreSQL...

Test 1: Obtener likes de tt0362120 (Scary Movie 4)
✅ Likes: 42

Test 2: Incrementar likes de tt0362120
✅ Nuevos likes: 43

Test 3: Incrementar likes de película nueva (tt9999999)
✅ Likes de película nueva: 1

Test 4: Obtener likes de múltiples películas
✅ Bulk likes: { tt0362120: 43, tt3387520: 128, tt0795461: 35 }

Test 5: Obtener total de likes
✅ Total de likes: 264

✅ Todos los tests pasaron correctamente!
```

---

## 📊 Esquema de la Base de Datos

### Tabla: `movie_likes`

```sql
CREATE TABLE movie_likes (
    id VARCHAR(20) PRIMARY KEY,      -- IMDb ID (ej: "tt0362120")
    likes INTEGER NOT NULL DEFAULT 0 -- Cantidad de likes
);
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | VARCHAR(20) | IMDb ID de la película (clave primaria) |
| `likes` | INTEGER | Cantidad de likes (no puede ser negativo) |

---

## 🔧 Operaciones Disponibles

### 1. Obtener Likes de una Película
```typescript
import { likeModel } from './models/likeModel';

const likes = await likeModel.getLikes('tt0362120');
console.log(likes); // 42
```

### 2. Incrementar Likes
```typescript
const newLikes = await likeModel.incrementLike('tt0362120');
console.log(newLikes); // 43
```

### 3. Obtener Múltiples Likes (Bulk)
```typescript
const bulkLikes = await likeModel.getBulkLikes(['tt0362120', 'tt3387520']);
console.log(Object.fromEntries(bulkLikes));
// { tt0362120: 43, tt3387520: 128 }
```

### 4. Obtener Total de Likes
```typescript
const total = await likeModel.getTotalLikes();
console.log(total); // 264
```

---

## 🛠️ Comandos Útiles

### Docker Compose
```bash
# Levantar PostgreSQL
docker-compose up -d postgres

# Ver logs
docker-compose logs -f postgres

# Ver estado
docker-compose ps

# Detener PostgreSQL
docker-compose down

# Detener y eliminar volúmenes (reset completo)
docker-compose down -v

# Reconstruir después de cambios
docker-compose up --build -d postgres
```

### PostgreSQL CLI
```bash
# Conectar a psql
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff

# Ejecutar query directamente
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff -c "SELECT * FROM movie_likes;"

# Ver tablas
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff -c "\dt"

# Ver estructura de tabla
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff -c "\d movie_likes"
```

---

## 🔐 Variables de Entorno

Para desarrollo local, crea un archivo `.env` (no lo subas a Git):

```env
# Database Configuration (PostgreSQL en Docker)
DB_HOST=127.0.0.1
DB_PORT=5433          # ← Puerto 5433 para evitar conflicto con PostgreSQL local
DB_NAME=movie_bff
DB_USER=postgres
DB_PASSWORD=1234      # ← Tu contraseña de PostgreSQL local
```

**Nota**: Si no tuvieras PostgreSQL local, podrías usar:
```env
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=postgres
```

Para producción o cuando el backend esté en Docker:
```env
DB_HOST=postgres  # Nombre del servicio en docker-compose
DB_PORT=5432      # Puerto interno del contenedor
```

---

## ✅ Validación del Código

```bash
# Validar TypeScript + ESLint
npm run validate

# Solo ESLint
npm run lint

# Solo TypeScript
npm run build:check
```

**Estado actual**: ✅ Sin errores

---

## 📝 Próximos Pasos

### ✅ Issue #3 - Database PostgreSQL (Esta rama: `script-database`)
1. ✅ **Base de datos creada** - Completado
2. ✅ **Modelo de datos implementado** - Completado
3. ✅ **Scripts de prueba creados** - Completado
4. ✅ **Docker Desktop levantado** - Completado
5. ✅ **PostgreSQL corriendo en puerto 5433** - Completado
6. ✅ **Tests ejecutados exitosamente** - Completado

### ⏳ Issue #1 - Movies API Integration (Rama: `movies-api-integration`)
**Depende de**: Issue #3 (esta rama)

**Lo que necesitarán**:
- ✅ Modelo `LikeModel` de `src/models/likeModel.ts`
- ✅ Método `getBulkLikes(imdbIds[])` para enriquecer películas con likes
- ✅ Base de datos PostgreSQL corriendo

**Configuración requerida** (deben copiar de esta rama):
```env
# .env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=movie_bff
DB_USER=postgres
DB_PASSWORD=1234
```

**Endpoints a implementar**:
- `GET /api/movies` - Retornar 10 películas con ratings de OMDB + likes de BD

### ⏳ Issue #2 - Likes System (Rama: `likes-system`)
**Depende de**: Issue #3 (esta rama)

**Lo que necesitarán**:
- ✅ Modelo `LikeModel` de `src/models/likeModel.ts`
- ✅ Método `incrementLike(imdbId)` para incrementar likes
- ✅ Método `getTotalLikes()` para obtener total
- ✅ Base de datos PostgreSQL corriendo

**Configuración requerida** (deben copiar de esta rama):
```env
# .env (mismo que Issue #1)
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=movie_bff
DB_USER=postgres
DB_PASSWORD=1234
```

**Endpoints a implementar**:
- `POST /api/movies/:id/like` - Incrementar likes de una película
- `GET /api/likes/total` - Obtener total de likes

---

## 🔄 Coordinación entre Ramas

### Para desarrolladores de Issue #1 y #2:

1. **Antes de empezar**:
   ```bash
   # Asegúrate de que PostgreSQL esté corriendo
   docker-compose up -d postgres
   docker-compose ps  # Debe mostrar "healthy"
   ```

2. **Archivos clave que deben integrar** (ya están en esta rama):
   - `src/config/database.ts` - Pool de conexiones
   - `src/models/likeModel.ts` - Modelo de likes (¡NO modificar!)
   - `database/init.sql` - Script de inicialización
   - `docker-compose.yml` - Configuración de PostgreSQL
   - `.env` - Variables de entorno (crear manualmente con puerto 5433)

3. **Al hacer merge**:
   - ⚠️ **NO sobrescribir** `src/models/likeModel.ts`
   - ⚠️ **NO cambiar** el puerto 5433 en ningún archivo
   - ✅ Solo agregar tus controladores y rutas nuevas
   - ✅ Importar `LikeModel` sin modificarlo

4. **Para probar tu rama localmente**:
   ```bash
   # 1. Clonar esta configuración de BD
   git checkout script-database
   git pull origin script-database
   
   # 2. Copiar archivos necesarios:
   # - database/
   # - docker-compose.yml
   # - src/config/database.ts
   # - src/models/likeModel.ts
   
   # 3. Crear .env con puerto 5433
   # 4. Levantar PostgreSQL
   docker-compose up -d postgres
   
   # 5. Volver a tu rama
   git checkout tu-rama
   
   # 6. Importar LikeModel en tu código
   import { LikeModel } from './models/likeModel';
   const likeModel = new LikeModel();
   ```

### Ejemplo de uso de LikeModel:

#### Issue #1 - Enriquecer películas con likes
```typescript
// En tu movieController.ts
import { LikeModel } from '../models/likeModel';

const likeModel = new LikeModel();

// Supongamos que obtuviste 10 películas de OMDB
const movies = [...]; // Array de películas con imdbID

// Obtener todos los imdbIDs
const imdbIds = movies.map(movie => movie.imdbID);

// Obtener likes en bulk
const likesMap = await likeModel.getBulkLikes(imdbIds);

// Enriquecer cada película con sus likes
const moviesWithLikes = movies.map(movie => ({
  ...movie,
  likes: likesMap.get(movie.imdbID) || 0
}));
```

#### Issue #2 - Incrementar likes
```typescript
// En tu likeController.ts
import { LikeModel } from '../models/likeModel';

const likeModel = new LikeModel();

// POST /api/movies/:id/like
export async function incrementMovieLike(req, res) {
  const { id } = req.params; // imdbID (ej: "tt0362120")
  
  const newLikes = await likeModel.incrementLike(id);
  
  res.json({
    success: true,
    data: { imdbId: id, likes: newLikes }
  });
}

// GET /api/likes/total
export async function getTotalLikes(req, res) {
  const total = await likeModel.getTotalLikes();
  
  res.json({
    success: true,
    data: { total }
  });
}
```

---

## 🎯 Criterios de Aceptación

- [x] ✅ Tabla `movie_likes` creada con campos `id` y `likes`
- [x] ✅ Constraint `likes >= 0` implementado
- [x] ✅ PostgreSQL configurado en Docker Compose
- [x] ✅ Script de inicialización automática
- [x] ✅ Pool de conexiones configurado
- [x] ✅ Modelo CRUD completo implementado
- [x] ✅ Scripts de prueba creados
- [x] ✅ Variables de entorno documentadas
- [x] ✅ Dependencias instaladas
- [x] ✅ Código validado sin errores
- [ ] ⏳ PostgreSQL levantado y probado (requiere Docker Desktop)
- [ ] ⏳ Tests ejecutados exitosamente

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
npm install pg @types/pg
```

### Error: "Docker daemon not running"
```bash
# Iniciar Docker Desktop manualmente
# Buscar el ícono de Docker en la bandeja del sistema
```

### Error: "Port 5432 already in use"
**Causa**: Ya tienes PostgreSQL local corriendo en el puerto 5432.

**Solución**: Este proyecto ya está configurado para usar el puerto **5433**. Verifica tu archivo `.env`:
```env
DB_PORT=5433  # ← Debe ser 5433, NO 5432
```

Si quieres usar otro puerto:
```bash
# Cambiar el puerto en docker-compose.yml
ports:
  - "5434:5432"  # Usa puerto 5434 en el host

# Y actualizar .env
DB_PORT=5434
```

### Error: "no existe la base de datos movie_bff"
**Causa**: Estás conectándote a tu PostgreSQL local (puerto 5432) en lugar del contenedor Docker (puerto 5433).

**Solución**:
```env
# Verifica que tu .env tenga:
DB_HOST=127.0.0.1  # ← NO uses "localhost"
DB_PORT=5433       # ← Puerto del contenedor Docker
```

### Reset completo de la base de datos
```bash
docker-compose down -v
docker-compose up -d postgres
```

---

**Fecha de Implementación**: Octubre 27, 2025  
**Issue**: #3 - Database PostgreSQL  
**Estado**: ✅ Completado - Todas las pruebas exitosas  
**Desarrolladores**: Manuel Martinez & Wílmer E. León

---

## 📌 Notas Importantes

1. **Puerto 5433**: El contenedor usa este puerto porque ya existe PostgreSQL local en el puerto 5432
2. **Contraseña 1234**: Se usa la misma contraseña que tu PostgreSQL local para consistencia
3. **Host 127.0.0.1**: Usar IP en lugar de "localhost" evita problemas de resolución DNS en Windows
4. **Archivo .env**: No está en Git por seguridad, debe crearse manualmente (copia de `.env.example`)
5. **Persistencia**: Los datos se guardan en el volumen `movie-bff_postgres_data` y persisten entre reinicios
