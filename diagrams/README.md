# 📊 Diagramas - Movie BFF

Esta carpeta contiene los diagramas de arquitectura y base de datos del proyecto Movie BFF.

## 📁 Archivos

### 1. Diagrama Entidad-Relación (ER)
- **Archivo:** `database-er-diagram.puml` / `database-er-diagram.png`
- **Descripción:** Muestra la estructura de la tabla `movie_likes` en PostgreSQL
- **Incluye:**
  - Campos de la tabla
  - Primary Keys, Unique constraints
  - Índices y triggers
  - Relación con API externa (OMDB)

### 2. Diagrama de Relaciones de Datos
- **Archivo:** `database-relations-diagram.puml` / `database-relations-diagram.png`
- **Descripción:** Muestra el flujo de datos entre componentes
- **Incluye:**
  - Flujo de búsqueda de películas
  - Flujo de likes
  - Flujo de contador global
  - Interacción Frontend → Backend → DB → API Externa

### 3. Diagrama de Arquitectura
- **Archivo:** `architecture-diagram.puml` / `architecture-diagram.png`
- **Descripción:** Arquitectura completa del sistema
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
# Generar todos los diagramas
java -jar ../plantuml.jar *.puml

# Generar diagrama específico
java -jar ../plantuml.jar database-er-diagram.puml
```

### Editar Diagramas

1. Modificar el archivo `.puml` correspondiente
2. Ejecutar el comando de generación
3. Verificar el PNG generado

## 🎨 Convenciones

### Colores
- **#E1F5FE** - Entidades/Componentes principales
- **#FFD54F** - Primary Keys
- **#AED581** - Unique/Foreign Keys
- **#E8F5E9** - Backend layer
- **#FFF9C4** - Database layer
- **#FFECB3** - External APIs

### Iconos
- 🔑 Primary Key
- 🔗 Foreign Key / Unique
- 📊 Índice
- ⚡ Trigger
- 🔄 Flujo de datos

## 📚 Referencias

- **PlantUML:** https://plantuml.com/
- **PlantUML Entity Relationship:** https://plantuml.com/ie-diagram
- **PlantUML Deployment:** https://plantuml.com/deployment-diagram

---

**Última actualización:** Octubre 24, 2025
