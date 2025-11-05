# 🚀 Guía de Integración para Desarrolladores Frontend

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Desplegar Backend con Docker](#desplegar-backend-con-docker)
4. [Endpoints Disponibles](#endpoints-disponibles)
5. [Pruebas de API](#pruebas-de-api)
6. [Integración con Frontend](#integración-con-frontend)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Requisitos Previos

### Software Necesario:
- ✅ **Git** (para clonar el repositorio)
- ✅ **Docker Desktop** (para ejecutar contenedores)
- ✅ **Node.js v20+** (opcional, solo si quieres ejecutar sin Docker)
- ✅ **PostgreSQL** (opcional, solo si quieres ejecutar sin Docker)

### Verificar Instalaciones:
```bash
# Verificar Git
git --version

# Verificar Docker
docker --version
docker-compose --version

# Verificar Node (opcional)
node --version
npm --version
```

---

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio
```bash
# Clonar desde GitHub
git clone https://github.com/Manuel-bitcode/movie-bff.git
cd movie-bff

# Cambiar a la rama con el sistema de likes
git checkout movies-api-integration

# Verificar rama actual
git branch
```

### 2. Configurar Variables de Entorno (Opcional)
```bash
# Crear archivo .env en la raíz del proyecto
# El proyecto funciona sin este archivo usando valores por defecto
```

**Archivo `.env` (opcional):**
```env
# Base de datos (valores por defecto si no se especifican)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=movie_bff
DB_USER=postgres
DB_PASSWORD=1234

# Puerto del backend (default: 3000)
PORT=3000

# API Key de OMDB (opcional para búsqueda de películas)
OMDB_API_KEY=tu_api_key_aqui
```

---

## 🐳 Desplegar Backend con Docker

### Opción A: Despliegue Completo (RECOMENDADO)

**Un solo comando despliega todo:**
```bash
# Levantar backend + base de datos
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver solo logs del backend
docker logs movie-bff -f

# Ver solo logs de PostgreSQL
docker logs movie-bff-postgres -f
```

**Verificar que los contenedores estén corriendo:**
```bash
docker ps

# Deberías ver:
# - movie-bff (backend en puerto 3000)
# - movie-bff-postgres (PostgreSQL en puerto 5433)
```

### Opción B: Reconstruir desde Cero

**Si necesitas reconstruir por cambios en el código:**
```bash
# Detener contenedores
docker-compose down

# Reconstruir y levantar
docker-compose up -d --build

# Ver logs de la construcción
docker-compose logs
```

### Verificar Salud del Backend

```bash
# Opción 1: Con cURL (Windows PowerShell)
curl http://localhost:3000/health

# Opción 2: Con navegador
# Abre: http://localhost:3000/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2025-10-30T..."}
```

---

## 🌐 Endpoints Disponibles

### Base URL
```
http://localhost:3000
```

### 1. Health Check
```http
GET /health
```
**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T20:00:00.000Z"
}
```

---

### 2. Obtener Todas las Películas
```http
GET /api/movies
```
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "The Shawshank Redemption",
      "year": 1994,
      "genre": "Drama",
      "director": "Frank Darabont"
    },
    // ... más películas
  ],
  "count": 7,
  "message": "Películas obtenidas correctamente"
}
```

---

### 3. Obtener Detalle de Película
```http
GET /api/movies/:id
```
**Ejemplo:**
```bash
curl http://localhost:3000/api/movies/1
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "The Shawshank Redemption",
    "year": 1994,
    "genre": "Drama",
    "director": "Frank Darabont"
  },
  "message": "Película obtenida correctamente"
}
```

---

### 4. Obtener Likes de Película ⭐ NUEVO
```http
GET /api/movies/:imdbId/likes
```
**Ejemplo:**
```bash
curl http://localhost:3000/api/movies/tt0111161/likes
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "imdbId": "tt0111161",
    "likes": 57
  },
  "message": "Likes obtenidos correctamente"
}
```

**Nota:** Si la película no tiene likes, retorna 0:
```json
{
  "success": true,
  "data": {
    "imdbId": "tt9999999",
    "likes": 0
  },
  "message": "Likes obtenidos correctamente"
}
```

---

### 5. Incrementar Like de Película ⭐ NUEVO
```http
POST /api/movies/:imdbId/like
```
**Ejemplo (PowerShell):**
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/movies/tt0111161/like"
```

**Ejemplo (cURL Linux/Mac):**
```bash
curl -X POST http://localhost:3000/api/movies/tt0111161/like
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "imdbId": "tt0111161",
    "likes": 58
  },
  "message": "Like incrementado correctamente"
}
```

---

### 6. Obtener Total de Likes Global ⭐ NUEVO
```http
GET /api/likes/total
```
**Ejemplo:**
```bash
curl http://localhost:3000/api/likes/total
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalLikes": 402
  },
  "message": "Total de likes calculado correctamente"
}
```

---

## 🧪 Pruebas de API

### Usando PowerShell (Windows)

```powershell
# 1. Health Check
curl http://localhost:3000/health

# 2. Obtener todas las películas
curl http://localhost:3000/api/movies

# 3. Obtener likes de película
curl http://localhost:3000/api/movies/tt0111161/likes

# 4. Incrementar like
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/movies/tt0111161/like"

# 5. Total de likes
curl http://localhost:3000/api/likes/total
```

### Usando Postman

1. **Importar Colección:**
   - Archivo: `postman/Movie-BFF-Likes.postman_collection.json`
   - En Postman: File → Import → Seleccionar archivo

2. **Endpoints incluidos:**
   - ✅ Health Check
   - ✅ Get All Movies
   - ✅ Get Movie Likes
   - ✅ Increment Like
   - ✅ Get Total Likes

3. **Ejecutar pruebas:**
   - Seleccionar endpoint
   - Click en "Send"
   - Verificar respuesta

---

## 💻 Integración con Frontend

### Configuración en Frontend (Next.js/React)

**1. Crear servicio de API:**

```typescript
// services/movieApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const movieApi = {
  // Obtener todas las películas
  getMovies: async () => {
    const response = await fetch(`${API_BASE_URL}/api/movies`);
    return response.json();
  },

  // Obtener likes de película
  getMovieLikes: async (imdbId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/movies/${imdbId}/likes`);
    return response.json();
  },

  // Incrementar like
  incrementLike: async (imdbId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/movies/${imdbId}/like`, {
      method: 'POST',
    });
    return response.json();
  },

  // Total de likes
  getTotalLikes: async () => {
    const response = await fetch(`${API_BASE_URL}/api/likes/total`);
    return response.json();
  },
};
```

**2. Ejemplo de uso en componente:**

```typescript
// components/MovieCard.tsx
import { useState, useEffect } from 'react';
import { movieApi } from '@/services/movieApi';

export function MovieCard({ imdbId }: { imdbId: string }) {
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLikes();
  }, [imdbId]);

  const loadLikes = async () => {
    try {
      const response = await movieApi.getMovieLikes(imdbId);
      if (response.success) {
        setLikes(response.data.likes);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const handleLike = async () => {
    setLoading(true);
    try {
      const response = await movieApi.incrementLike(imdbId);
      if (response.success) {
        setLikes(response.data.likes);
      }
    } catch (error) {
      console.error('Error incrementing like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleLike} disabled={loading}>
        ❤️ {likes}
      </button>
    </div>
  );
}
```

**3. Variables de entorno en Frontend:**

```env
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🔧 Troubleshooting

### Problema 1: Docker no inicia

**Síntomas:**
```
Error: Cannot connect to Docker daemon
```

**Solución:**
```bash
# Windows: Abrir Docker Desktop
# Verificar que esté corriendo
docker ps
```

---

### Problema 2: Puerto 3000 ocupado

**Síntomas:**
```
Error: Port 3000 is already in use
```

**Solución:**
```bash
# Opción A: Detener proceso en puerto 3000
# Windows PowerShell (como administrador)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Opción B: Cambiar puerto en docker-compose.yml
# Modificar línea: - "3001:3000"  # Usar puerto 3001
```

---

### Problema 3: Base de datos no conecta

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Reiniciar contenedores
docker-compose down
docker-compose up -d

# Ver logs de PostgreSQL
docker logs movie-bff-postgres
```

---

### Problema 4: CORS errors en frontend

**Síntomas:**
```
Access to fetch blocked by CORS policy
```

**Solución:**
El backend ya tiene CORS habilitado para todos los orígenes (`*`). Si persiste:

```typescript
// En frontend, agregar headers
fetch('http://localhost:3000/api/movies', {
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

### Problema 5: Cambios no se reflejan

**Solución:**
```bash
# Reconstruir imagen Docker
docker-compose down
docker-compose up -d --build

# Limpiar cache de Docker
docker system prune -a
```

---

## 📚 Recursos Adicionales

### Documentación:
- 📄 **README.md** - Información general del proyecto
- 📄 **LIKES_SYSTEM.md** - Documentación del sistema de likes
- 📄 **DATABASE_DICTIONARY.md** - Diccionario de datos
- 📄 **TROUBLESHOOTING.md** - Guía de solución de problemas
- 📄 **API_KEY_GUIDE.md** - Guía de API Keys

### Diagramas:
- 📊 **diagrams/backend-architecture-likes.puml** - Arquitectura del backend
- 📊 **diagrams/likes-data-flow.puml** - Flujo de datos del sistema de likes

### Postman:
- 📁 **postman/Movie-BFF-Likes.postman_collection.json** - Colección de endpoints

---

## 🎯 Checklist de Integración

- [ ] Docker Desktop instalado y corriendo
- [ ] Repositorio clonado en rama `movies-api-integration`
- [ ] Contenedores levantados con `docker-compose up -d`
- [ ] Health check respondiendo en http://localhost:3000/health
- [ ] Endpoint `/api/movies` retorna lista de películas
- [ ] Endpoint `/api/movies/:imdbId/likes` retorna likes
- [ ] Endpoint POST `/api/movies/:imdbId/like` incrementa likes
- [ ] Endpoint `/api/likes/total` retorna total global
- [ ] Frontend configurado con URL del backend
- [ ] CORS funcionando correctamente
- [ ] Servicio de API creado en frontend
- [ ] Componentes consumiendo endpoints

---

## 💡 Tips para Desarrollo

### 1. Ver logs en tiempo real:
```bash
docker-compose logs -f
```

### 2. Ejecutar comandos en contenedor:
```bash
# Entrar al contenedor del backend
docker exec -it movie-bff sh

# Entrar a PostgreSQL
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff
```

### 3. Resetear base de datos:
```bash
docker-compose down -v  # Elimina volúmenes
docker-compose up -d     # Recrea con datos frescos
```

### 4. Hot reload (desarrollo sin Docker):
```bash
npm install
npm run dev  # Ejecuta con nodemon en puerto 3000
```

---

## 📞 Contacto y Soporte

**Si tienes problemas:**
1. Revisa la sección [Troubleshooting](#troubleshooting)
2. Consulta `TROUBLESHOOTING.md`
3. Verifica logs: `docker logs movie-bff`
4. Contacta al equipo backend

**Desarrolladores Backend:**
- Manuel Martinez
- Wílmer E. León

---

**Última actualización:** Octubre 30, 2025  
**Versión:** 1.0.0 (Issue #2 - Sistema de Likes)
