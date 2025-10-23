# Movie BFF (Backend For Frontend)

API REST para gestión de películas construida con Express.js y TypeScript

## 📁 Estructura del Proyecto

```
movie-bff/
├── src/
│   ├── app.ts              # Configuración de Express
│   ├── server.ts           # Punto de entrada del servidor
│   ├── config/
│   │   └── config.ts       # Configuración de la aplicación
│   ├── controllers/
│   │   └── movieController.ts  # Lógica de negocio
│   ├── routes/
│   │   ├── movieRoutes.ts  # Rutas de películas
│   │   └── healthRoutes.ts # Ruta de health check
│   ├── middlewares/
│   │   └── logger.ts       # Middleware de logging
│   └── types/
│       └── movie.types.ts  # Tipos e interfaces
├── dist/                   # Código compilado (generado)
├── .env.example            # Variables de entorno ejemplo
├── .gitignore
├── tsconfig.json           # Configuración de TypeScript
├── package.json
└── README.md
```

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar variables de entorno en `.env`

## 💻 Uso

### Desarrollo (con auto-reload y ts-node-dev)
```bash
npm run dev
```

### Desarrollo alternativo (con nodemon)
```bash
npm run dev:watch
```

### Compilar TypeScript
```bash
npm run build
```

### Producción (después de compilar)
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📍 Endpoints

### Health Check
- `GET /health` - Verificar estado del servicio

### Películas
- `GET /api/movies` - Obtener todas las películas
- `GET /api/movies/:id` - Obtener película por ID
- `POST /api/movies` - Crear nueva película
- `PUT /api/movies/:id` - Actualizar película
- `DELETE /api/movies/:id` - Eliminar película

### Ejemplo de uso

**Obtener todas las películas:**
```bash
curl http://localhost:3000/api/movies
```

**Crear una película:**
```bash
curl -X POST http://localhost:3000/api/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "year": 2010,
    "genre": "Sci-Fi",
    "director": "Christopher Nolan"
  }'
```

## 🛠️ Tecnologías

- Node.js
- TypeScript
- Express.js
- ts-node-dev / nodemon (desarrollo)

## 📝 Notas

- Los datos actualmente se almacenan en memoria (mock data)
- Para producción, integrar con una base de datos real

