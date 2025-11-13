# 🎬 Guía de Configuración - OMDB API Key

## 📋 **Tabla de Contenidos**

1. [¿Qué es OMDB API?](#qué-es-omdb-api)
2. [Obtener tu API Key](#obtener-tu-api-key)
3. [Configurar en el Proyecto](#configurar-en-el-proyecto)
4. [Verificar Configuración](#verificar-configuración)
5. [Límites de la API](#límites-de-la-api)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 **¿Qué es OMDB API?**

**OMDB** (Open Movie Database) es una API RESTful gratuita que proporciona información de películas desde IMDb.

### Características:
- ✅ Datos de más de 200,000 películas
- ✅ Información: Título, año, director, actores, plot, rating, poster
- ✅ **1,000 peticiones diarias gratis**
- ✅ Fácil de usar (solo necesitas un ID de IMDb)

**Sitio oficial:** [http://www.omdbapi.com/](http://www.omdbapi.com/)

---

## 🔑 **Obtener tu API Key**

### **Paso 1: Registrarse**

1. Ve a: [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)

2. Elige el plan **FREE** (para desarrollo):
   - ✅ 1,000 peticiones diarias
   - ✅ Sin tarjeta de crédito
   - ✅ Ideal para desarrollo y pruebas

3. Completa el formulario:
   ```
   Email Address: tu_email@ejemplo.com
   First Name: Tu Nombre
   Account Type: FREE! (1,000 daily limit)
   ```

4. **Marca la casilla "I'm not a robot"**

5. Click en **"Submit"**

---

### **Paso 2: Verificar tu Email**

1. Revisa tu bandeja de entrada (y spam)

2. Busca el email de `do-not-reply@omdbapi.com`
   - **Asunto:** "OMDb API Key"

3. **Haz click en el enlace de activación**

4. Verás un mensaje: 
   ```
   API Key Activated!
   
   Your key is: xxxxxxxx
   ```

5. **Copia tu API Key** (ejemplo: `b9a5c44a`)

---

## ⚙️ **Configurar en el Proyecto**

### **Paso 1: Abrir archivo `.env`**

```bash
# En la raíz del proyecto
code .env
```

### **Paso 2: Pegar tu API Key**

```bash
# API External (OMDB)
OMDB_API_KEY=tu_api_key_aqui     # ← REEMPLAZAR
OMDB_BASE_URL=http://www.omdbapi.com
```

**Ejemplo:**
```bash
OMDB_API_KEY=b9a5c44a
OMDB_BASE_URL=http://www.omdbapi.com
```

### **Paso 3: Reiniciar el servidor**

#### **Opción A: Docker (RECOMENDADO)**
```bash
docker-compose restart
```

#### **Opción B: npm**
```bash
# Detener servidor (Ctrl+C)
npm run dev
```

---

## ✅ **Verificar Configuración**

### **1. Probar endpoint de películas**

```bash
# PowerShell
curl http://localhost:3000/api/movies | ConvertFrom-Json | Format-List

# Bash/Linux
curl http://localhost:3000/api/movies | jq
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "imdbId": "tt0111161",
      "title": "The Shawshank Redemption",
      "year": "1994",
      "rated": "R",
      "genre": "Drama",
      "director": "Frank Darabont",
      "actors": "Tim Robbins, Morgan Freeman, Bob Gunton",
      "plot": "Two imprisoned men bond over...",
      "poster": "https://m.media-amazon.com/images/...",
      "imdbRating": "9.3",
      "imdbVotes": "2,800,000",
      "runtime": "142 min",
      "likes": 0
    },
    // ... 9 películas más
  ],
  "count": 10,
  "message": "Películas obtenidas correctamente"
}
```

---

### **2. Verificar en logs**

```bash
docker logs movie-bff --tail 20
```

**Logs exitosos:**
```
🎬 Obteniendo películas populares...
✅ 10 películas obtenidas exitosamente
```

**Logs con error:**
```
❌ Error obteniendo película tt0111161: Invalid API key!
```

---

## 📊 **Límites de la API**

### **Plan FREE (Gratis)**

| Límite | Valor |
|--------|-------|
| Peticiones diarias | **1,000** |
| Peticiones por segundo | **10** |
| Costo | **$0 USD** |
| Tarjeta requerida | ❌ No |

### **Plan Patreon ($1/mes)**

| Límite | Valor |
|--------|-------|
| Peticiones diarias | **100,000** |
| Peticiones por segundo | **100** |
| Costo | **$1 USD/mes** |
| Póster alta resolución | ✅ Sí |

**Upgrade:** [http://www.omdbapi.com/](http://www.omdbapi.com/)

---

## 🔧 **Troubleshooting**

### **Error: "Invalid API key!"**

**Causas posibles:**
1. ❌ API Key no activada (revisa tu email)
2. ❌ Typo en el archivo `.env`
3. ❌ Servidor no reiniciado después de cambiar `.env`
4. ❌ Usaste la key de ejemplo (`your_omdb_api_key_here`)

**Solución:**
```bash
# 1. Verificar .env
cat .env | grep OMDB_API_KEY

# 2. Debe mostrar tu key real (no "your_omdb_api_key_here")
# OMDB_API_KEY=b9a5c44a  ← CORRECTO
# OMDB_API_KEY=your_omdb_api_key_here  ← INCORRECTO

# 3. Reiniciar Docker
docker-compose restart
```

---

### **Error: "Request limit exceeded!"**

**Causa:** Superaste las 1,000 peticiones diarias

**Soluciones:**
1. ⏰ Esperar 24 horas
2. 💰 Upgrade a plan Patreon
3. 🆓 Crear otra cuenta con otro email

---

### **Error: "Movie not found!"**

**Causa:** El IMDb ID no existe o es incorrecto

**Solución:**
```typescript
// Verificar IMDb ID en https://www.imdb.com/
// Formato: tt0111161 (tt + 7 dígitos)

// Ejemplo correcto:
const imdbId = "tt0111161"; // The Shawshank Redemption ✅

// Ejemplo incorrecto:
const imdbId = "0111161"; // ❌ Sin 'tt'
const imdbId = "tt111161"; // ❌ Solo 6 dígitos
```

---

### **Error: "503 Service Unavailable"**

**Causa:** OMDB API está caída

**Solución:**
1. Verificar estado: [https://status.omdbapi.com/](http://www.omdbapi.com/)
2. Reintentar en 5 minutos
3. Implementar caché local (futuro)

---

### **No aparecen películas (array vacío)**

**Debugging:**

```bash
# 1. Ver logs completos
docker logs movie-bff --tail 100

# 2. Buscar errores específicos
docker logs movie-bff 2>&1 | grep -i "error\|omdb"

# 3. Probar OMDB directamente
curl "http://www.omdbapi.com/?apikey=TU_API_KEY&i=tt0111161"

# Respuesta esperada:
# {"Title":"The Shawshank Redemption","Year":"1994",...}
```

---

## 🧪 **Probar OMDB API Manualmente**

### **Comando cURL:**

```bash
# Reemplazar TU_API_KEY con tu key real
curl "http://www.omdbapi.com/?apikey=TU_API_KEY&i=tt0111161"
```

### **Respuesta esperada:**

```json
{
  "Title": "The Shawshank Redemption",
  "Year": "1994",
  "Rated": "R",
  "Released": "14 Oct 1994",
  "Runtime": "142 min",
  "Genre": "Drama",
  "Director": "Frank Darabont",
  "Writer": "Stephen King, Frank Darabont",
  "Actors": "Tim Robbins, Morgan Freeman, Bob Gunton",
  "Plot": "Two imprisoned men bond over...",
  "Language": "English",
  "Country": "United States",
  "Awards": "Nominated for 7 Oscars. 21 wins & 42 nominations total",
  "Poster": "https://m.media-amazon.com/images/M/...",
  "Ratings": [
    {"Source": "Internet Movie Database", "Value": "9.3/10"},
    {"Source": "Rotten Tomatoes", "Value": "91%"},
    {"Source": "Metacritic", "Value": "82/100"}
  ],
  "Metascore": "82",
  "imdbRating": "9.3",
  "imdbVotes": "2,846,205",
  "imdbID": "tt0111161",
  "Type": "movie",
  "DVD": "21 Dec 1999",
  "BoxOffice": "$28,767,189",
  "Production": "N/A",
  "Website": "N/A",
  "Response": "True"
}
```

---

## 📚 **Documentación Adicional**

### **Endpoints OMDB disponibles:**

```bash
# Por IMDb ID (usado en nuestro proyecto)
http://www.omdbapi.com/?apikey=XXXX&i=tt0111161

# Por título
http://www.omdbapi.com/?apikey=XXXX&t=The+Shawshank+Redemption

# Por búsqueda
http://www.omdbapi.com/?apikey=XXXX&s=godfather

# Póster alta resolución (solo Patreon)
http://img.omdbapi.com/?apikey=XXXX&i=tt0111161&h=600
```

### **Parámetros adicionales:**

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `i` | IMDb ID | `i=tt0111161` |
| `t` | Título | `t=The Matrix` |
| `s` | Búsqueda | `s=star wars` |
| `y` | Año | `y=1999` |
| `type` | Tipo | `type=movie` |
| `plot` | Plot completo | `plot=full` |

---

## 🔗 **Enlaces Útiles**

- 🌐 **OMDB Official:** [http://www.omdbapi.com/](http://www.omdbapi.com/)
- 📖 **Documentación:** [http://www.omdbapi.com/#usage](http://www.omdbapi.com/#usage)
- 🔑 **Obtener API Key:** [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
- 💰 **Planes:** [http://www.omdbapi.com/#pricing](http://www.omdbapi.com/)
- 📧 **Soporte:** [bfritz@fadingsignal.com](mailto:bfritz@fadingsignal.com)

---

## ✅ **Checklist de Configuración**

Antes de hacer commit, verifica:

- [ ] API Key obtenida de OMDB
- [ ] Email de activación confirmado
- [ ] Key pegada en `.env` (no en `.env.example`)
- [ ] Servidor reiniciado (Docker o npm)
- [ ] Endpoint `/api/movies` probado
- [ ] Respuesta contiene 10 películas
- [ ] Logs no muestran errores de API Key
- [ ] `.env` NO commiteado a Git

---

**Autores:** Manuel Martinez & Wílmer E. León  
**Fecha:** Noviembre 2025  
**Versión:** 1.0  
**Issue:** #1 - Crear endpoint para obtener películas
