# 🧪 Pruebas con Postman - Sistema de Likes

Esta colección de Postman te permite validar que el sistema de likes funcione correctamente y que las respuestas cumplan con las interfaces TypeScript definidas.

## 📦 Instalación

### 1. Importar la Colección

**Opción A: Desde el archivo**
1. Abre Postman
2. Click en **Import** (arriba izquierda)
3. Selecciona `postman/Movie-BFF-Likes.postman_collection.json`
4. Click **Import**

**Opción B: Desde el repositorio**
```bash
# La colección ya está en el repositorio
git pull origin likes-system
```

---

## 🚀 Preparación

### 1. Levantar el servidor backend

```bash
# Opción 1: Local
npm run dev

# Opción 2: Docker
docker-compose up -d
```

### 2. Verificar que PostgreSQL esté corriendo

```bash
docker ps --filter "name=movie-bff-postgres"
```

Debe mostrar: `Up X minutes (healthy)`

---

## 🧪 Ejecutar las Pruebas

### Orden Recomendado:

1. **Health Check** → Verifica que el servidor esté corriendo
2. **Obtener Likes de Película** → Lee likes actuales de tt0362120
3. **Incrementar Like de Película** → Incrementa el contador
4. **Obtener Total de Likes** → Verifica la suma global
5. **Película Nueva** → Prueba UPSERT con película nueva
6. **Error - IMDb ID Inválido** → Valida manejo de errores

### Ejecutar Todas las Pruebas:

1. Click derecho en la colección **"Movie BFF - Sistema de Likes"**
2. Click en **"Run collection"**
3. Click **"Run Movie BFF - Sistema de Likes"**

Deberías ver: **✅ 6/6 requests passed**

---

## 📊 Qué Valida Cada Prueba

### 1. **Health Check**
```http
GET /health
```

**Validaciones:**
- ✅ Status 200
- ✅ Estructura: `{ status, timestamp, service }`
- ✅ status = "OK"
- ✅ service = "movie-bff"

---

### 2. **Obtener Likes de Película**
```http
GET /api/movies/tt0362120/likes
```

**Validaciones:**
- ✅ Status 200
- ✅ Cumple con `LikeResponse` interface
- ✅ `success` es boolean
- ✅ `data` tiene `imdbId` (string) y `likes` (number)
- ✅ `message` es string
- ✅ `likes >= 0`
- ✅ Guarda likes actuales en variable de entorno

**Ejemplo de respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "imdbId": "tt0362120",
    "likes": 42
  },
  "message": "Likes obtenidos correctamente"
}
```

---

### 3. **Incrementar Like de Película**
```http
POST /api/movies/tt0362120/like
```

**Validaciones:**
- ✅ Status 200
- ✅ Cumple con `LikeResponse` interface
- ✅ Like se incrementó en +1 (compara con variable guardada)
- ✅ Todos los tipos de datos correctos

**Ejemplo de respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "imdbId": "tt0362120",
    "likes": 43
  },
  "message": "Like incrementado"
}
```

---

### 4. **Obtener Total de Likes**
```http
GET /api/likes/total
```

**Validaciones:**
- ✅ Status 200
- ✅ Cumple con `TotalLikesResponse` interface
- ✅ `totalLikes` es number
- ✅ `totalLikes >= 228` (suma de datos de prueba)

**Ejemplo de respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "totalLikes": 230
  },
  "message": "Total de likes calculado"
}
```

---

### 5. **Película Nueva (Primera vez)**
```http
POST /api/movies/tt9999999/like
```

**Validaciones:**
- ✅ Status 200
- ✅ UPSERT funciona correctamente
- ✅ Primera vez = 1 like (no 0)

**Qué prueba:** Verifica que cuando se da like a una película que NO existe en la BD, se crea con `likes = 1`.

---

### 6. **Error - IMDb ID Inválido**
```http
POST /api/movies/invalid-id/like
```

**Validaciones:**
- ✅ Status 400 Bad Request
- ✅ `success = false`
- ✅ Tiene mensaje de error

**Qué prueba:** Verifica que la validación de IMDb ID funciona y devuelve errores apropiados.

---

## 🔧 Personalizar las Pruebas

### Cambiar la URL base:

1. En Postman, click en la colección
2. Tab **Variables**
3. Editar `baseUrl`:
   - Local: `http://localhost:3000`
   - Docker: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`

### Probar con diferentes películas:

Editar el `imdbId` en cada request:
- Scary Movie 4: `tt0362120`
- Scary Stories: `tt3387520`
- Scary Movie 5: `tt0795461`
- The Scary House: `tt9654108`
- Scary or Die: `tt1833879`

---

## 📋 Interpretar Resultados

### ✅ Todos los tests pasan:
```
✅ Health Check (5 tests passed)
✅ Obtener Likes (5 tests passed)
✅ Incrementar Like (5 tests passed)
✅ Total de Likes (5 tests passed)
✅ Película Nueva (2 tests passed)
✅ Error IMDb Inválido (2 tests passed)
```

**Significado:** El sistema funciona correctamente y las interfaces TypeScript están bien implementadas.

---

### ❌ Algunos tests fallan:

**Error común 1: "Cannot GET /api/movies/..."**
- **Causa:** El servidor no está corriendo o las rutas no están registradas
- **Solución:** Ejecutar `npm run dev` o `docker-compose up`

**Error común 2: "Status code is 500"**
- **Causa:** Error en el servidor (probablemente PostgreSQL no conecta)
- **Solución:** Verificar logs (`docker logs movie-bff-postgres`)

**Error común 3: "Expected likes to equal X but got Y"**
- **Causa:** Los datos de prueba cambiaron
- **Solución:** Reiniciar la base de datos con datos frescos

---

## 🔄 Reiniciar Base de Datos

Si los datos se desincronizaron:

```bash
# Detener y eliminar volúmenes
docker-compose down -v

# Levantar de nuevo (ejecutará init.sql automáticamente)
docker-compose up -d postgres

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Verificar datos iniciales
docker exec movie-bff-postgres psql -U postgres -d movie_bff -c "SELECT * FROM movie_likes;"
```

---

## 📖 Documentación de las Interfaces

Las interfaces validadas en estas pruebas están definidas en:

📁 `src/types/movie.types.ts`

```typescript
// Respuesta de like individual
export interface LikeResponse {
  success: boolean;
  data: {
    imdbId: string;
    likes: number;
  };
  message?: string;
}

// Respuesta de contador global
export interface TotalLikesResponse {
  success: boolean;
  data: {
    totalLikes: number;
  };
  message?: string;
}
```

---

## 🎯 Beneficios de Estas Pruebas

1. ✅ **Validan la estructura de datos** (TypeScript interfaces)
2. ✅ **Detectan errores de tipado** (number vs string)
3. ✅ **Prueban la lógica de negocio** (incremento, UPSERT)
4. ✅ **Verifican el manejo de errores** (validaciones)
5. ✅ **Documentan la API** (ejemplos de uso)
6. ✅ **Pueden ejecutarse automáticamente** (CI/CD)

---

## 🚀 Próximos Pasos

Una vez que todas las pruebas pasen:

1. ✅ El sistema de likes funciona correctamente
2. ✅ Las interfaces TypeScript están implementadas
3. ✅ La base de datos PostgreSQL funciona
4. ✅ **Issue #3 completado** ✨

Ahora pueden proceder con:
- **Issue #1:** Integración con OMDB API
- **Issue #2:** Endpoints de películas con likes

---

**Autores:** Manuel Martinez & Wílmer E. León  
**Fecha:** Octubre 2025  
**Issue:** #3 - Base de datos PostgreSQL para likes
