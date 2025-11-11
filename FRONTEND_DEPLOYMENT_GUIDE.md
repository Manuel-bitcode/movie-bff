# 🚀 Guía de Despliegue para Frontend Developer

Esta guía te ayudará a desplegar y probar el backend **Movie BFF** de manera rápida y sencilla.

---

## 📋 Pre-requisitos

### Software Necesario

✅ **Docker Desktop** instalado y ejecutándose
- Windows/Mac: [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)
- Linux: `sudo apt install docker.io docker-compose`

✅ **Git** instalado
- Verificar: `git --version`

✅ **Node.js v20.12.2** (opcional para desarrollo local)
- Verificar: `node --version`

---

## 🎯 Paso 1: Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/Manuel-bitcode/movie-bff.git
cd movie-bff

# Cambiar a la rama principal
git checkout main
```

---

## 🐳 Paso 2: Desplegar con Docker (Opción Recomendada)

### 2.1 Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env (opcional)
# Para desarrollo local, los valores por defecto funcionan
```

**Variables importantes:**
```env
# Puerto del backend
PORT=3000

# Base de datos (ya configurada en docker-compose)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=movie_bff
DB_USER=postgres
DB_PASSWORD=1234

# API Key (opcional para pruebas)
API_KEY=your_api_key_here
```

### 2.2 Levantar los Contenedores

```bash
# Construir y levantar todo (backend + PostgreSQL)
docker-compose up -d --build
```

**Esto hará:**
1. ✅ Descargar imagen PostgreSQL 16 Alpine
2. ✅ Crear base de datos `movie_bff`
3. ✅ Ejecutar script de inicialización (`database/init.sql`)
4. ✅ Construir imagen del backend
5. ✅ Levantar backend en puerto 3000

### 2.3 Verificar que Todo Funciona

```bash
# Ver estado de contenedores
docker-compose ps

# Deberías ver:
# movie-bff           running (healthy)
# movie-bff-postgres  running (healthy)
```

```bash
# Ver logs del backend
docker-compose logs -f app

# Deberías ver:
# ✅ Conectado a PostgreSQL
# 🚀 Server running on port 3000
```

---

## 🧪 Paso 3: Probar los Endpoints

### Opción A: Usando cURL (Terminal)

#### 1️⃣ Health Check
```bash
curl http://localhost:3000/health
```
**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "service": "movie-bff"
}
```

#### 2️⃣ Obtener Lista de Películas
```bash
curl http://localhost:3000/api/movies
```

#### 3️⃣ Obtener Likes de una Película
```bash
curl http://localhost:3000/api/movies/tt0111161/likes
```
**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "imdbId": "tt0111161",
    "likes": 0
  },
  "message": "Likes obtenidos correctamente"
}
```

#### 4️⃣ Dar Like a una Película
```bash
# Windows PowerShell:
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/movies/tt0111161/like" | Select-Object -ExpandProperty Content

# Linux/Mac:
curl -X POST http://localhost:3000/api/movies/tt0111161/like
```

#### 5️⃣ Obtener Total de Likes
```bash
curl http://localhost:3000/api/likes/total
```

### Opción B: Usando Postman

1. **Importar colección:**
   - Abrir Postman
   - Import → File → Seleccionar `postman/Movie-BFF-Likes.postman_collection.json`

2. **Ejecutar requests:**
   - GET Health Check
   - GET All Movies
   - GET Movie Likes
   - POST Movie Like
   - GET Total Likes

3. **Ver documentación completa:**
   - Ver archivo `postman/README.md`

---

## 🔌 Paso 4: Conectar tu Frontend

### URLs del Backend

```javascript
// En tu archivo de configuración del frontend (.env.local o similar)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Ejemplo de Fetch desde Next.js

```javascript
// app/services/movieService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Obtener películas
export async function getMovies() {
  const response = await fetch(`${API_URL}/api/movies`);
  if (!response.ok) throw new Error('Error fetching movies');
  return response.json();
}

// Obtener likes de película
export async function getMovieLikes(imdbId) {
  const response = await fetch(`${API_URL}/api/movies/${imdbId}/likes`);
  if (!response.ok) throw new Error('Error fetching likes');
  const data = await response.json();
  return data.data.likes; // Retorna el número
}

// Incrementar like
export async function incrementLike(imdbId) {
  const response = await fetch(`${API_URL}/api/movies/${imdbId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Error incrementing like');
  return response.json();
}

// Total de likes
export async function getTotalLikes() {
  const response = await fetch(`${API_URL}/api/likes/total`);
  if (!response.ok) throw new Error('Error fetching total likes');
  const data = await response.json();
  return data.data.totalLikes;
}
```

### CORS ya está habilitado

El backend tiene CORS configurado para aceptar requests desde cualquier origen:

```javascript
// Ya configurado en src/app.ts
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📚 Endpoints Disponibles

### 🏥 Health Check
```
GET /health
```

### 🎬 Películas
```
GET  /api/movies              # Lista todas las películas
GET  /api/movies/:id          # Detalle de película
```

### ❤️ Sistema de Likes
```
GET  /api/movies/:id/likes    # Obtener likes de película
POST /api/movies/:id/like     # Incrementar like
GET  /api/likes/total         # Total de likes global
```

**Formato de imdbId:** `tt` + 7 o más dígitos (ej: `tt0111161`)

---

## 🛠️ Comandos Útiles

### Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Reiniciar contenedores
docker-compose restart

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (reset completo)
docker-compose down -v

# Reconstruir imagen (después de cambios)
docker-compose up -d --build
```

### Base de Datos

```bash
# Conectar a PostgreSQL (dentro del contenedor)
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff

# Queries útiles:
# Ver todas las películas con likes
SELECT * FROM movie_likes ORDER BY likes DESC;

# Ver total de likes
SELECT SUM(likes) as total FROM movie_likes;

# Salir
\q
```

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot connect to Docker daemon"

**Solución:**
```bash
# Asegúrate de que Docker Desktop esté corriendo
# Windows/Mac: Abrir Docker Desktop
# Linux:
sudo systemctl start docker
```

### ❌ Error: "Port 3000 already in use"

**Opción 1: Cambiar puerto**
```bash
# Editar docker-compose.yml
ports:
  - "3001:3000"  # Mapear puerto 3001 externamente
```

**Opción 2: Liberar puerto**
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### ❌ Error: "ECONNREFUSED 127.0.0.1:5432"

**Causa:** Backend no puede conectar a PostgreSQL

**Solución:**
```bash
# Verificar que postgres esté running
docker-compose ps

# Si no está healthy, ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### ❌ Error: "Invalid imdbId format"

**Causa:** imdbId no cumple formato `tt + 7 dígitos`

**Solución:** Usar IDs válidos
```
✅ tt0111161  (The Shawshank Redemption)
✅ tt0068646  (The Godfather)
✅ tt0468569  (The Dark Knight)
❌ tt123     (muy corto)
❌ 0111161   (sin 'tt')
```

### ❌ Backend no responde después de build

```bash
# Ver logs completos
docker-compose logs app

# Verificar healthcheck
docker inspect movie-bff | grep -A 10 Health

# Entrar al contenedor
docker exec -it movie-bff sh
# Dentro:
wget -O- http://localhost:3000/health
```

---

## 🔄 Actualizar el Backend

```bash
# 1. Detener contenedores
docker-compose down

# 2. Pull últimos cambios
git pull origin main

# 3. Reconstruir y levantar
docker-compose up -d --build

# 4. Verificar
curl http://localhost:3000/health
```

---

## 📊 Validar el Despliegue

### Checklist

- [ ] Docker Desktop está corriendo
- [ ] `docker-compose ps` muestra ambos contenedores healthy
- [ ] `curl http://localhost:3000/health` retorna 200 OK
- [ ] `curl http://localhost:3000/api/movies` retorna lista
- [ ] POST like funciona correctamente
- [ ] Frontend puede hacer fetch a los endpoints

---

## 📖 Documentación Adicional

- **Sistema de Likes:** `LIKES_SYSTEM.md`
- **Base de Datos:** `CONFIGURACIÓN_DE_BD.md`
- **Pruebas Postman:** `postman/README.md`
- **API Key (opcional):** `API_KEY_GUIDE.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Diagramas:** `diagrams/README.md`

---

## 🎯 Resumen Rápido (TL;DR)

```bash
# 1. Clonar y entrar
git clone https://github.com/Manuel-bitcode/movie-bff.git
cd movie-bff

# 2. Copiar .env
cp .env.example .env

# 3. Levantar todo
docker-compose up -d --build

# 4. Probar
curl http://localhost:3000/health
curl http://localhost:3000/api/movies

# 5. Conectar frontend
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 💡 Tips para Frontend

### 1. **Manejo de Errores**
```javascript
try {
  const likes = await getMovieLikes(imdbId);
} catch (error) {
  console.error('Error fetching likes:', error);
  // Mostrar mensaje al usuario
  return 0; // Valor por defecto
}
```

### 2. **Loading States**
```javascript
const [likes, setLikes] = useState(0);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchLikes() {
    try {
      const count = await getMovieLikes(imdbId);
      setLikes(count);
    } finally {
      setLoading(false);
    }
  }
  fetchLikes();
}, [imdbId]);
```

### 3. **Optimistic Updates**
```javascript
async function handleLike() {
  // Update UI inmediatamente
  setLikes(prev => prev + 1);
  
  try {
    // Confirmar con backend
    await incrementLike(imdbId);
  } catch (error) {
    // Revertir si falla
    setLikes(prev => prev - 1);
    alert('Error al dar like');
  }
}
```

### 4. **Evitar Spam de Likes**
```javascript
const [isLiking, setIsLiking] = useState(false);

async function handleLike() {
  if (isLiking) return; // Prevenir clicks múltiples
  
  setIsLiking(true);
  try {
    await incrementLike(imdbId);
    setLikes(prev => prev + 1);
  } finally {
    setIsLiking(false);
  }
}
```

---

## 👥 Soporte

**Issues:** https://github.com/Manuel-bitcode/movie-bff/issues  
**Desarrolladores:** Manuel Martinez & Wílmer E. León  
**Última actualización:** Noviembre 2025

---

¡Listo! Ahora tu frontend puede consumir el backend sin problemas 🎉
