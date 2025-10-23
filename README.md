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
├── src/
│   ├── app.ts                    # Configuración de Express
│   ├── server.ts                 # Punto de entrada del servidor
│   ├── config/
│   │   └── config.ts             # Configuración centralizada
│   ├── controllers/
│   │   └── movieController.ts    # Lógica de negocio
│   ├── routes/
│   │   ├── movieRoutes.ts        # Rutas de películas
│   │   └── healthRoutes.ts       # Ruta de health check
│   ├── middlewares/
│   │   └── logger.ts             # Middleware de logging
│   └── types/
│       └── movie.types.ts        # Tipos e interfaces TypeScript
├── dist/                         # Código compilado (generado)
├── Dockerfile                    # Configuración Docker
├── docker-compose.yml            # Orquestación Docker
├── .dockerignore                 # Exclusiones Docker
├── .env.example                  # Variables de entorno ejemplo
├── .nvmrc                        # Versión de Node.js
├── .gitignore
├── tsconfig.json                 # Configuración de TypeScript
├── package.json
└── README.md
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
# Levantar con Docker Compose
npm run docker:up

# Detener
npm run docker:down
```

El servidor estará en `http://localhost:3000`

## 💻 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo local con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Ejecutar versión compilada |
| `npm run docker:up` | Levantar con Docker |
| `npm run docker:down` | Detener Docker |

## 📍 API Endpoints

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

## 🐳 Docker (Básico)

### Archivos incluidos:
- `Dockerfile` - Define cómo construir la imagen
- `docker-compose.yml` - Orquestación simple
- `.dockerignore` - Archivos a excluir

### Uso básico:

```bash
# Levantar
docker-compose up

# Detener (Ctrl+C o en otra terminal)
docker-compose down

# Reconstruir después de cambios
docker-compose up --build
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
- **Docker** (opcional) - Contenerización

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Manuel Martinez**

