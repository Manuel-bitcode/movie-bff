# Movie BFF (Backend For Frontend)

API REST para gestión de películas construida con **Express.js** y **TypeScript**

## 📋 Requisitos Previos

- **Node.js** v20.12.2 (ver `.nvmrc`) - Solo si no usas Docker
- **Docker** (opcional) - Para ejecutar en contenedor

```bash
# Si usas nvm
nvm use
```

## 📁 Estructura del Proyecto

```
movie-bff/
├── database/
│   └── init.sql                  # Script de inicialización de PostgreSQL
├── src/
│   ├── app.ts                    # Configuración de Express
│   ├── server.ts                 # Punto de entrada del servidor
│   ├── config/
│   │   ├── config.ts             # Configuración centralizada
│   │   └── database.ts           # Pool de conexiones PostgreSQL
│   ├── controllers/
│   │   └── movieController.ts    # Lógica de negocio
│   ├── models/
│   │   └── likeModel.ts          # Modelo de datos para likes
│   ├── routes/
│   │   ├── movieRoutes.ts        # Rutas de películas
│   │   └── healthRoutes.ts       # Ruta de health check
│   ├── middlewares/
│   │   └── logger.ts             # Middleware de logging
│   └── types/
│       └── movie.types.ts        # Tipos e interfaces TypeScript
├── dist/                         # Código compilado (generado)
├── Dockerfile                    # Configuración Docker (comentado)
├── docker-compose.yml            # Orquestación Docker (PostgreSQL)
├── .dockerignore                 # Exclusiones Docker
├── .eslintrc.json                # Configuración de ESLint
├── .eslintignore                 # Exclusiones de ESLint
├── .env.example                  # Variables de entorno ejemplo
├── .nvmrc                        # Versión de Node.js
├── .gitignore
├── tsconfig.json                 # Configuración de TypeScript
├── package.json
├── README.md
└── DATABASE-SETUP.md             # Guía de configuración de PostgreSQL
```

## 🚀 Instalación y Uso

### Opción 1: Desarrollo Local (Node.js)

```bash
# 1. Clonar e instalar
git clone <repository-url>
cd movie-bff
npm install

# 2. Iniciar en desarrollo
npm run dev
```

El servidor estará en `http://localhost:3000`

---

### Opción 2: Con Docker

```bash
# IMPORTANTE: Validar código antes de construir Docker
npm run validate

# Si no hay errores, levantar con Docker
npm run docker:up

# O usar el comando combinado (valida + construye)
npm run docker:build

# Detener
npm run docker:down
```

El servidor estará en `http://localhost:3000`

### ⚠️ Validar antes de Docker

**Siempre ejecuta antes:**
```bash
npm run validate
```

Esto ejecuta:
1. **ESLint** - Detecta errores de código y estilo
2. **TypeScript** - Verifica tipos y compilación

Todo **sin** construir la imagen Docker (mucho más rápido ⚡)

## 💻 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo local con hot-reload |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm run build:check` | Verificar errores de TypeScript |
| `npm run lint` | ✅ Analizar código con ESLint |
| `npm run lint:fix` | ✅ Arreglar errores automáticamente |
| `npm run validate` | ✅ Lint + TypeCheck (antes de Docker) |
| `npm start` | Ejecutar versión compilada |
| `npm run docker:build` | Validar + construir imagen Docker |
| `npm run docker:up` | Levantar con Docker (background) |
| `npm run docker:down` | Detener Docker |
| `npm run docker:logs` | Ver logs en tiempo real |
| `npm run docker:ps` | Ver estado del contenedor |

## 📍 API Endpoints

### Ruta Principal (Redirección)
```http
GET /
```
**Comportamiento:**
- Redirige automáticamente a `/api/movies`
- Código de estado: `302 Found`

---

### Health Check
```http
GET /health
```
**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-23T12:00:00.000Z",
  "service": "movie-bff"
}
```

---

### Películas

#### Obtener todas las películas
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
    }
  ],
  "count": 1
}
```

---

## � Docker

### Archivos incluidos:
- `Dockerfile` - Define cómo construir la imagen (con comentarios explicativos)
- `docker-compose.yml` - Orquestación con mejoras (comentado línea por línea)
- `.dockerignore` - Archivos a excluir

### Características:
✅ **Restart automático** - Si el contenedor falla, se reinicia  
✅ **Health check** - Verifica que la API responda cada 30s  
✅ **Variables de entorno** - Usa archivo `.env` si existe  
✅ **Logs rotados** - Máximo 10MB por archivo, 3 archivos  

### Uso básico:

```bash
# Levantar (en background)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver estado y health
docker-compose ps

# Detener
docker-compose down

# Reconstruir después de cambios
docker-compose up --build -d
```

### Variables de entorno (opcional):

Crea un archivo `.env` en la raíz:
```env
PORT=3000
NODE_ENV=production
API_KEY=tu_api_key_aqui
```

---

## 🔍 Detectar Errores Antes de Docker

### ✅ Método 1: Validación Completa (Recomendado)
```bash
npm run validate
```
**Qué hace:**
- ✅ Ejecuta ESLint (detecta errores de código)
- ✅ Ejecuta TypeScript check (verifica tipos)
- ⚡ Rápido (no compila, solo verifica)

### 🔧 Método 2: Solo ESLint
```bash
# Ver errores
npm run lint

# Arreglar automáticamente
npm run lint:fix
```
**Detecta:**
- Variables no usadas (como `req`, `next`)
- Uso de `any`
- Errores de sintaxis
- Problemas de estilo

### 📝 Método 3: Solo TypeScript
```bash
npm run build:check
```
**Detecta:**
- Errores de tipos
- Imports incorrectos
- Problemas de compilación

### 💻 Método 4: Desarrollo en tiempo real
```bash
npm run dev
```
- TypeScript verifica mientras editas
- Errores aparecen en consola inmediatamente

### 📋 Checklist Antes de Docker

```bash
# 1. Validar código
npm run validate

# 2. Si hay errores de estilo, arreglarlos
npm run lint:fix

# 3. Si todo está OK, construir Docker
npm run docker:build
# O directamente:
npm run docker:up
```

---

## 🛠️ Stack Tecnológico

### Runtime & Lenguaje
- **Node.js** v20.12.2
- **TypeScript** v5.3.3

### Framework & Librerías
- **Express.js** v5.1.0 - Framework web
- **@types/express** - Tipos TypeScript para Express
- **@types/node** - Tipos TypeScript para Node.js

### Herramientas de Desarrollo
- **ts-node-dev** - Auto-reload para desarrollo
- **TypeScript Compiler** - Compilación a JavaScript
- **ESLint** - Análisis de código y detección de errores
- **Docker** (opcional) - Contenerización

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Manuel Martinez** - Desarrollo inicial y arquitectura
- **Wílmer E. León** - Patrones de diseño Back-end y base de datos

