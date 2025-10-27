# 📊 Diagramas - Movie BFF

Esta carpeta contiene los diagramas de arquitectura, base de datos y deployment del proyecto Movie BFF.

## 📁 Archivos

### 1. Arquitectura Completa del Sistema
- **Archivo:** `full-system-architecture.puml` / `full-system-architecture.png`
- **Descripción:** Arquitectura completa mostrando interacción entre Frontend (Next.js) y Backend (Express.js)
- **Incluye:**
  - **Frontend (movie-webapp:3000):** Next.js, React, Context API, Components
  - **Backend (movie-bff:3001):** Express.js, Routes, Controllers, Models
  - **Database (postgres:5432):** PostgreSQL con tabla movie_likes
  - Flujo de datos completo entre capas
  - Servicios externos (OMDB API)
  - Docker Network configuration

### 2. Diagrama de Secuencia - Interacción Usuario
- **Archivo:** `sequence-user-interaction.puml` / `sequence-user-interaction.png`
- **Descripción:** Flujo completo de interacción del usuario desde el navegador
- **Incluye:**
  - Carga inicial de películas (GET /api/movies)
  - Usuario da Like (POST /api/movies/:id/like)
  - GlobalCounter obtiene total (GET /api/likes/total)
  - Usuario quita Like (DELETE /api/movies/:id/like)
  - Interacción Frontend → Backend → Database

### 3. Diagrama de Deployment Docker
- **Archivo:** `docker-deployment.puml` / `docker-deployment.png`
- **Descripción:** Configuración completa de Docker Compose
- **Incluye:**
  - Contenedor movie-webapp (Next.js en puerto 3000)
  - Contenedor movie-bff (Express.js en puerto 3001)
  - Contenedor movie-bff-postgres (PostgreSQL en puerto 5433)
  - Docker Network (movie-network)
  - Volúmenes persistentes
  - Health checks y restart policies
  - Variables de entorno

### 4. Diagrama Entidad-Relación (ER)
- **Archivo:** `database-er-diagram.puml` / `database-er-diagram.png`
- **Descripción:** Muestra la estructura de la tabla `movie_likes` en PostgreSQL
- **Incluye:**
  - Campos de la tabla
  - Primary Keys, Unique constraints
  - Índices y triggers
  - Relación con API externa (OMDB)

### 5. Diagrama de Relaciones de Datos
- **Archivo:** `database-relations-diagram.puml` / `database-relations-diagram.png`
- **Descripción:** Muestra el flujo de datos entre componentes
- **Incluye:**
  - Flujo de búsqueda de películas
  - Flujo de likes
  - Flujo de contador global
  - Interacción Frontend → Backend → DB → API Externa

### 6. Diagrama de Arquitectura (Backend)
- **Archivo:** `architecture-diagram.puml` / `architecture-diagram.png`
- **Descripción:** Arquitectura del backend (BFF)
- **Incluye:**
  - Capas del backend (Routes, Controllers, Services, Models)
  - Frontend components
  - Base de datos PostgreSQL
  - API externa
  - Middlewares

## 🔄 Cómo Actualizar los Diagramas

### Requisitos
- Java instalado
- PlantUML JAR en la raíz del proyecto

### Generar PNG desde PUML

```bash
# Desde la raíz del proyecto
# Generar todos los diagramas
java -jar plantuml.jar diagrams/*.puml

# Generar diagrama específico
java -jar plantuml.jar diagrams/full-system-architecture.puml
java -jar plantuml.jar diagrams/sequence-user-interaction.puml
java -jar plantuml.jar diagrams/docker-deployment.puml
```

### Editar Diagramas

1. Modificar el archivo `.puml` correspondiente
2. Ejecutar el comando de generación
3. Verificar el PNG generado

## 🎨 Convenciones

### Colores
- **LightYellow (#FFFFCC)** - Frontend (Next.js, React)
- **LightGreen (#CCFFCC)** - Backend (Express.js, BFF)
- **LightCoral (#FFCCCC)** - Database (PostgreSQL)
- **LightBlue (#CCCCFF)** - External Services (OMDB API)
- **LightGray (#EEEEEE)** - Infrastructure (Docker, Network)

### Iconos y Símbolos
- 🔑 Primary Key
- 🔗 Foreign Key / Unique
- 📊 Índice
- ⚡ Trigger
- 🔄 Flujo de datos
- 🐳 Docker Container
- 🌐 Network
- 💾 Volume

## 📚 Referencias

- **PlantUML:** https://plantuml.com/
- **PlantUML Entity Relationship:** https://plantuml.com/ie-diagram
- **PlantUML Deployment:** https://plantuml.com/deployment-diagram
- **PlantUML Sequence:** https://plantuml.com/sequence-diagram
- **PlantUML Component:** https://plantuml.com/component-diagram

---

**Última actualización:** Octubre 27, 2025  
**Desarrolladores:** Manuel Martinez & Wílmer E. León
