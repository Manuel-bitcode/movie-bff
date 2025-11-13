# 📚 Diccionario de Datos - Movie BFF

## 📊 Información General de la Base de Datos

| Propiedad | Valor |
|-----------|-------|
| **Nombre de la Base de Datos** | `movie_bff` |
| **Motor de Base de Datos** | PostgreSQL 16 Alpine |
| **Usuario Administrador** | `postgres` |
| **Puerto** | 5433 (externo) → 5432 (interno Docker) |
| **Codificación** | UTF-8 |
| **Esquema Principal** | `public` |
| **Total de Tablas** | 1 |

---

## 📋 Tabla: `movie_likes`

### Descripción General
Almacena la información de likes (me gusta) de películas identificadas por su IMDb ID. Permite llevar un conteo de popularidad de cada película en el sistema.

### Propósito
- Registrar la cantidad de likes que cada película ha recibido
- Proporcionar métricas de popularidad de películas
- Soportar funcionalidades de "dar like" sin duplicados
- Permitir consultas de rankings de películas más populares

### Metadatos de la Tabla

| Metadato | Valor |
|----------|-------|
| **Nombre de la Tabla** | `movie_likes` |
| **Esquema** | `public` |
| **Propietario** | `postgres` |
| **Método de Acceso** | heap |
| **Registros Actuales** | 7 películas |
| **Total de Likes Registrados** | 394 likes |
| **Promedio de Likes** | 56 likes/película |
| **Rango de Likes** | 3 - 150 likes |

---

## 🔧 Estructura de Columnas

### 1. Columna: `id`

| Atributo | Valor |
|----------|-------|
| **Nombre** | `id` |
| **Tipo de Dato** | `VARCHAR(20)` |
| **Longitud Máxima** | 20 caracteres |
| **Colación** | Por defecto (UTF-8) |
| **Nulable** | ❌ NO (NOT NULL) |
| **Valor por Defecto** | Ninguno (debe proporcionarse) |
| **Storage** | Extended |
| **Compresión** | Ninguna |
| **Clave Primaria** | ✅ SÍ |
| **Índice** | ✅ SÍ (PRIMARY KEY + idx_movie_likes_id) |
| **Descripción** | IMDb ID único de la película |

#### Detalles de Negocio
- **Formato Esperado**: `ttXXXXXXX` (ejemplo: `tt0362120`)
  - Prefijo obligatorio: `tt`
  - Seguido de dígitos numéricos (mínimo 7 dígitos)
- **Unicidad**: Cada IMDb ID debe ser único en el sistema
- **Validación**: Se valida en la capa de aplicación con regex `^tt\d+$`
- **Uso**: Identificador primario para relacionar con APIs externas de películas (OMDb, TMDb, etc.)

#### Ejemplos de Valores Válidos
```
tt0111161  - The Shawshank Redemption
tt0068646  - The Godfather
tt0468569  - The Dark Knight
tt0362120  - The Prestige
tt1375666  - Inception
```

#### Restricciones
- ✅ Debe ser único (PRIMARY KEY)
- ✅ No puede ser NULL
- ✅ Máximo 20 caracteres
- ✅ Case-sensitive (distingue mayúsculas/minúsculas)

---

### 2. Columna: `likes`

| Atributo | Valor |
|----------|-------|
| **Nombre** | `likes` |
| **Tipo de Dato** | `INTEGER` |
| **Rango de Valores** | -2,147,483,648 a 2,147,483,647 |
| **Colación** | N/A (numérico) |
| **Nulable** | ❌ NO (NOT NULL) |
| **Valor por Defecto** | `0` |
| **Storage** | Plain |
| **Compresión** | Ninguna |
| **Clave Primaria** | ❌ NO |
| **Índice** | ❌ NO (podría agregarse para ORDER BY) |
| **Descripción** | Cantidad total de likes de la película |

#### Detalles de Negocio
- **Inicialización**: Toda película nueva se crea con `0` likes por defecto
- **Incremento**: Se incrementa en 1 cada vez que un usuario da "like"
- **Decremento**: No implementado actualmente (no se permite "unlike")
- **Rango Válido**: 0 o positivo (restricción `CHECK`)
- **Uso**: Métricas de popularidad, rankings, estadísticas

#### Operaciones Permitidas
```sql
-- ✅ Incrementar like
UPDATE movie_likes SET likes = likes + 1 WHERE id = 'tt0362120';

-- ✅ Obtener total de likes
SELECT SUM(likes) FROM movie_likes;

-- ✅ Ranking de películas
SELECT id, likes FROM movie_likes ORDER BY likes DESC LIMIT 10;

-- ❌ No se permite valor negativo
UPDATE movie_likes SET likes = -5 WHERE id = 'tt0362120'; -- FALLA por CHECK constraint
```

#### Restricciones
- ✅ No puede ser NULL
- ✅ Debe ser >= 0 (CHECK constraint: `likes_positive`)
- ✅ Valor por defecto: 0
- ⚠️ No hay límite superior definido (puede crecer indefinidamente)

---

## 🔑 Claves e Índices

### Clave Primaria: `movie_likes_pkey`

| Atributo | Valor |
|----------|-------|
| **Nombre** | `movie_likes_pkey` |
| **Tipo** | PRIMARY KEY |
| **Columna(s)** | `id` |
| **Método** | B-Tree |
| **Unicidad** | ✅ Única |
| **Propósito** | Garantizar que cada película tenga un IMDb ID único |

#### Ventajas
- ✅ Búsquedas rápidas por `id` (O(log n))
- ✅ Previene duplicados automáticamente
- ✅ Optimiza JOINs con otras tablas (futuro)

---

### Índice Adicional: `idx_movie_likes_id`

| Atributo | Valor |
|----------|-------|
| **Nombre** | `idx_movie_likes_id` |
| **Tipo** | INDEX (B-Tree) |
| **Columna(s)** | `id` |
| **Unicidad** | ❌ No única (pero `id` es PK, así que siempre única) |
| **Propósito** | Redundante con PRIMARY KEY, puede eliminarse |

#### Nota
⚠️ Este índice es redundante porque ya existe la PRIMARY KEY en la misma columna. PostgreSQL automáticamente crea un índice para PRIMARY KEY.

**Recomendación**: Considerar eliminar `idx_movie_likes_id` para ahorrar espacio y reducir overhead de escritura.

---

## ✅ Restricciones (Constraints)

### 1. Restricción: `likes_positive`

| Atributo | Valor |
|----------|-------|
| **Nombre** | `likes_positive` |
| **Tipo** | CHECK Constraint |
| **Condición** | `likes >= 0` |
| **Columna Afectada** | `likes` |

#### Propósito
Garantizar que la cantidad de likes nunca sea negativa, manteniendo la integridad de datos de negocio.

#### Comportamiento
```sql
-- ✅ Permitido
INSERT INTO movie_likes (id, likes) VALUES ('tt1234567', 0);
INSERT INTO movie_likes (id, likes) VALUES ('tt1234567', 100);

-- ❌ Rechazado
INSERT INTO movie_likes (id, likes) VALUES ('tt1234567', -1);
-- ERROR: new row for relation "movie_likes" violates check constraint "likes_positive"
```

---

## 📈 Estadísticas Actuales

| Métrica | Valor |
|---------|-------|
| **Total de Películas** | 7 |
| **Total de Likes Acumulados** | 394 |
| **Promedio de Likes por Película** | 56 |
| **Película con Más Likes** | 150 likes |
| **Película con Menos Likes** | 3 likes |
| **Mediana de Likes** | ~43 likes (estimado) |

---

## 🔄 Operaciones CRUD Soportadas

### CREATE (Insertar)

#### Inserción Manual
```sql
INSERT INTO movie_likes (id, likes) 
VALUES ('tt1234567', 10);
```

#### Inserción desde API (auto-incremento)
```sql
INSERT INTO movie_likes (id, likes) 
VALUES ('tt1234567', 1) 
ON CONFLICT (id) 
DO UPDATE SET likes = movie_likes.likes + 1
RETURNING id, likes;
```

**Endpoint API:** `POST /api/movies/:id/like`

---

### READ (Consultar)

#### Obtener likes de una película
```sql
SELECT id, likes 
FROM movie_likes 
WHERE id = 'tt0362120';
```

**Endpoint API:** `GET /api/movies/:id/likes`

#### Top 10 películas
```sql
SELECT id, likes 
FROM movie_likes 
ORDER BY likes DESC 
LIMIT 10;
```

#### Total de likes
```sql
SELECT SUM(likes) as total_likes 
FROM movie_likes;
```

**Endpoint API:** `GET /api/likes/total`

---

### UPDATE (Actualizar)

#### Incrementar like manualmente
```sql
UPDATE movie_likes 
SET likes = likes + 1 
WHERE id = 'tt0362120';
```

#### Establecer valor específico
```sql
UPDATE movie_likes 
SET likes = 100 
WHERE id = 'tt0362120';
```

---

### DELETE (Eliminar)

#### Eliminar película específica
```sql
DELETE FROM movie_likes 
WHERE id = 'tt1234567';
```

#### Eliminar películas sin likes
```sql
DELETE FROM movie_likes 
WHERE likes = 0;
```

⚠️ **Nota**: No hay endpoint API para DELETE, solo operaciones de base de datos directas.

---

## 🎯 Casos de Uso

### Caso de Uso 1: Usuario da "Like" a una Película
1. Usuario hace clic en botón "Like" para `tt0362120`
2. Frontend envía `POST /api/movies/tt0362120/like`
3. Backend valida formato de IMDb ID
4. Backend ejecuta `INSERT ... ON CONFLICT DO UPDATE`
5. Si película no existe: se crea con `likes = 1`
6. Si película existe: se incrementa `likes + 1`
7. Se retorna nuevo valor de likes

### Caso de Uso 2: Mostrar Top 10 Películas Populares
1. Frontend solicita `GET /api/movies?sort=likes&limit=10`
2. Backend ejecuta `SELECT * ORDER BY likes DESC LIMIT 10`
3. Se retorna lista ordenada de películas más populares

### Caso de Uso 3: Dashboard de Estadísticas
1. Admin solicita métricas generales
2. Backend ejecuta:
   - `SELECT COUNT(*) FROM movie_likes` (total películas)
   - `SELECT SUM(likes) FROM movie_likes` (total likes)
   - `SELECT AVG(likes) FROM movie_likes` (promedio)
3. Se retorna objeto JSON con todas las métricas

---

## 🔒 Seguridad y Permisos

### Usuarios de Base de Datos

| Usuario | Permisos |
|---------|----------|
| `postgres` | SUPERUSER (todos los permisos) |

### Configuración de Acceso
- **Método de Autenticación**: Contraseña (md5)
- **Contraseña**: `1234` (⚠️ usar contraseña fuerte en producción)
- **Conexiones Permitidas**: Desde cualquier IP dentro de la red Docker

### Recomendaciones de Seguridad
- ⚠️ Crear usuario con permisos limitados para la aplicación
- ⚠️ Cambiar contraseña por defecto en producción
- ✅ Usar variables de entorno para credenciales
- ✅ Implementar SSL/TLS para conexiones remotas
- ✅ Limitar conexiones concurrentes

---

## 🚀 Optimizaciones Recomendadas

### Índices Adicionales (Futuro)

#### 1. Índice en `likes` para ordenamiento
```sql
CREATE INDEX idx_movie_likes_likes ON movie_likes(likes DESC);
```
**Beneficio**: Acelera queries de ranking y top películas

#### 2. Índice parcial para películas populares
```sql
CREATE INDEX idx_movie_likes_popular ON movie_likes(likes) 
WHERE likes > 100;
```
**Beneficio**: Optimiza búsquedas de películas muy populares

### Particionamiento (Futuro)
Si la tabla crece mucho (millones de registros), considerar:
- Particionamiento por rangos de likes (0-100, 101-1000, 1001+)
- Particionamiento por fecha de creación (si se agrega columna `created_at`)

### Compresión (Futuro)
- Activar compresión TOAST para columnas grandes
- Considerar almacenamiento columnar con extensión `cstore_fdw`

---

## 📝 Historial de Cambios

| Versión | Fecha | Cambio | Autor |
|---------|-------|--------|-------|
| 1.0 | 2025-10-23 | Creación inicial de tabla `movie_likes` | Wílmer E. León |
| 1.1 | 2025-10-28 | Agregado sistema de likes completo (Issue #2) | Wílmer E. León |
| 1.2 | 2025-10-30 | Diccionario de datos creado | Wílmer E. León |

---

## 🔗 Referencias

### Documentación Relacionada
- [README.md](./README.md) - Documentación general del proyecto
- [LIKES_SYSTEM.md](./LIKES_SYSTEM.md) - Documentación técnica del sistema de likes
- [IMPLEMENTACIÓN_DE_BASE_DE_DATOS.md](./IMPLEMENTACIÓN_DE_BASE_DE_DATOS.md) - Guía de setup de BD
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de problemas comunes

### Script de Inicialización
- [database/init.sql](./database/init.sql) - Script de creación de tablas e inserción de datos iniciales

### Colección de Postman
- [postman/Movie-BFF-Likes.postman_collection.json](./postman/Movie-BFF-Likes.postman_collection.json) - Tests de API

---

## 📞 Contacto y Soporte

**Desarrollador:** Wílmer E. León  
**Email:** leon.wilmer@outlook.com  
**Repositorio:** https://github.com/Manuel-bitcode/movie-bff  
**Issue Tracker:** https://github.com/Manuel-bitcode/movie-bff/issues

---

**Última actualización:** 30 de Octubre, 2025  
**Versión del documento:** 1.0
