# Movie BFF (Backend For Frontend)

API REST para gestión de películas construida con **Express.js** y **TypeScript**

## 📋 Requisitos Previos

- **Node.js** v20.12.2 (ver `.nvmrc`)
- **npm** v8 o superior

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
├── .env.example                  # Variables de entorno ejemplo
├── .nvmrc                        # Versión de Node.js
├── .gitignore
├── tsconfig.json                 # Configuración de TypeScript
├── package.json
└── README.md
```

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd movie-bff
```

2. **Configurar versión de Node.js**
```bash
nvm use
```

3. **Instalar dependencias**
```bash
npm install
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
PORT=3000
NODE_ENV=development
API_KEY=your_api_key_here
```

## 💻 Scripts Disponibles

### Desarrollo (con auto-reload y ts-node-dev)
```bash
npm run dev
```
El servidor estará disponible en `http://localhost:3000`

### Producción
```bash
npm run build
npm start
```

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


## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**Manuel Martinez**

