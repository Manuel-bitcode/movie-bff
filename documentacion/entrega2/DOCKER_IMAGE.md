# 🐳 Imagen Docker de PostgreSQL

## 📦 Imagen Publicada en Docker Hub

**Repositorio:** [`wilmerleon/movie-bff-postgres`](https://hub.docker.com/r/wilmerleon/movie-bff-postgres)

### Versiones Disponibles:
- `latest` - Última versión estable
- `v1.0` - Primera versión con datos iniciales

## 📋 Contenido de la Imagen

Esta imagen personalizada de PostgreSQL incluye:

### Base de Datos Pre-configurada:
- **Base de datos:** `movie_bff`
- **Usuario:** `postgres`
- **Puerto:** `5432` (interno), `5433` (externo en docker-compose)

### Tabla `movie_likes`:
```sql
CREATE TABLE movie_likes (
    id VARCHAR(20) PRIMARY KEY,    -- IMDb ID
    likes INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT likes_positive CHECK (likes >= 0)
);
```

### Datos de Prueba Incluidos:
| IMDb ID    | Película                              | Likes |
|------------|---------------------------------------|-------|
| tt0362120  | Scary Movie 4                         | 43    |
| tt3387520  | Scary Stories to Tell in the Dark    | 128   |
| tt0795461  | Scary Movie 5                         | 35    |
| tt9654108  | The Scary House                       | 15    |
| tt1833879  | Scary or Die                          | 8     |
| tt9999999  | Test Movie                            | 1     |

## 🚀 Uso de la Imagen

### Opción 1: Con Docker Compose (Recomendado)
```bash
docker-compose up -d postgres
```

### Opción 2: Directamente con Docker
```bash
docker run -d \
  --name movie-bff-postgres \
  -p 5433:5432 \
  -e POSTGRES_PASSWORD=1234 \
  wilmerleon/movie-bff-postgres:latest
```

### Opción 3: Conectar desde aplicación Node.js
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'movie_bff',
  user: 'postgres',
  password: '1234'
});
```

## 🔄 Actualizar la Imagen

### 1. Hacer cambios en la base de datos local
```bash
# Conectar al contenedor
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff

# Hacer cambios SQL
INSERT INTO movie_likes (id, likes) VALUES ('tt1234567', 100);
```

### 2. Crear nueva imagen
```bash
# Commit de cambios
docker commit movie-bff-postgres wilmerleon/movie-bff-postgres:v1.1

# Tag como latest
docker tag wilmerleon/movie-bff-postgres:v1.1 wilmerleon/movie-bff-postgres:latest
```

### 3. Subir a Docker Hub
```bash
# Login (si no lo has hecho)
docker login

# Push de ambas versiones
docker push wilmerleon/movie-bff-postgres:v1.1
docker push wilmerleon/movie-bff-postgres:latest
```

## 📊 Información Técnica

### Especificaciones:
- **Imagen base:** `postgres:16-alpine`
- **Tamaño:** ~394 MB
- **Arquitectura:** `x86_64`
- **Sistema operativo:** Linux (Alpine)

### Características:
- ✅ Base de datos pre-inicializada
- ✅ Datos de prueba incluidos
- ✅ Índices optimizados
- ✅ Health check configurado
- ✅ Volúmenes persistentes

### Health Check:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

## 🔐 Seguridad

⚠️ **IMPORTANTE:** La contraseña por defecto (`1234`) es solo para desarrollo.

Para producción:
1. Cambia la contraseña en `.env`:
   ```env
   DB_PASSWORD=tu_contraseña_segura_aquí
   ```

2. Usa secrets de Docker:
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

## 📝 Verificación

### Verificar que la imagen funciona:
```bash
# Pull de la imagen
docker pull wilmerleon/movie-bff-postgres:latest

# Correr contenedor
docker run -d -p 5433:5432 -e POSTGRES_PASSWORD=1234 wilmerleon/movie-bff-postgres:latest

# Verificar datos
docker exec -it <container_id> psql -U postgres -d movie_bff -c "SELECT COUNT(*) FROM movie_likes;"
```

## 🔗 Enlaces

- **Docker Hub:** https://hub.docker.com/r/wilmerleon/movie-bff-postgres
- **Repositorio GitHub:** https://github.com/Manuel-bitcode/movie-bff
- **Documentación PostgreSQL:** https://www.postgresql.org/docs/16/

---

**Autor:** Manuel Martinez & Wílmer E. León  
**Fecha de creación:** Octubre 2025  
**Versión actual:** v1.0
