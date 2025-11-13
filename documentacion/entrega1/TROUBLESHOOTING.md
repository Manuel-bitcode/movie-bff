# 🔧 Troubleshooting - PostgreSQL Docker

## ❌ Error: "role 'movieuser' does not exist"

### 🔍 Causa del Problema:

Este error ocurre cuando hay **volúmenes de Docker antiguos** con configuraciones previas que entran en conflicto con la configuración actual.

**Mensaje de error típico:**
```
FATAL: role "movieuser" does not exist
connection to client lost
database system is shut down
```

---

## ✅ Solución Rápida (3 Pasos)

### **Paso 1: Detener y eliminar volúmenes**

```powershell
# Detener contenedores y eliminar volúmenes
docker-compose down -v
```

**Qué hace:**
- ✅ Detiene todos los contenedores
- ✅ Elimina redes
- ✅ **Elimina volúmenes** (esto limpia la configuración antigua)

---

### **Paso 2: Limpiar volúmenes huérfanos (opcional pero recomendado)**

```powershell
# Eliminar todos los volúmenes no usados
docker volume prune -f
```

**Qué hace:**
- ✅ Limpia volúmenes que quedaron de configuraciones anteriores
- ✅ Libera espacio en disco

---

### **Paso 3: Levantar PostgreSQL nuevamente**

```powershell
# Levantar solo PostgreSQL
docker-compose up -d postgres
```

**Qué hace:**
- ✅ Crea volumen nuevo limpio
- ✅ Ejecuta `init.sql` automáticamente
- ✅ Configura usuario: `postgres` (no `movieuser`)
- ✅ Crea base de datos: `movie_bff`
- ✅ Inserta 5 películas de prueba

---

## 🧪 Verificar que Funciona

### Verificar logs (debe decir "ready to accept connections"):

```powershell
docker logs movie-bff-postgres --tail 20
```

**Salida esperada (última línea):**
```
database system is ready to accept connections
```

---

### Verificar datos en la tabla:

```powershell
docker exec movie-bff-postgres psql -U postgres -d movie_bff -c "SELECT * FROM movie_likes;"
```

**Salida esperada:**
```
    id     | likes 
-----------+-------
 tt0362120 |    42
 tt3387520 |   128
 tt0795461 |    35
 tt9654108 |    15
 tt1833879 |     8
(5 rows)
```

---

### Verificar conexión desde el backend:

```bash
# Si tienes el backend en Node.js corriendo
npm run dev
```

Debe conectar correctamente sin errores de autenticación.

---

## 🔍 Otros Errores Comunes

### Error: "port 5433 is already in use"

**Causa:** Ya hay un PostgreSQL local corriendo en ese puerto.

**Solución:**
```powershell
# Opción 1: Detener PostgreSQL local
net stop postgresql-x64-16

# Opción 2: Cambiar puerto en docker-compose.yml
ports:
  - "5434:5432"  # Usar otro puerto
```

---

### Error: "permission denied" en volúmenes

**Causa:** Docker no tiene permisos para montar directorios.

**Solución Windows:**
1. Abrir **Docker Desktop**
2. Settings → Resources → File Sharing
3. Agregar la ruta del proyecto
4. Apply & Restart

---

### Error: "Bind for 0.0.0.0:5433 failed: port is already allocated"

**Causa:** El puerto ya está en uso por otro contenedor.

**Solución:**
```powershell
# Ver qué contenedor usa el puerto
docker ps -a | Select-String "5433"

# Detener todos los contenedores
docker stop $(docker ps -aq)

# Eliminar contenedores huérfanos
docker container prune -f
```

---

## 📋 Configuración Correcta del `.env`

Asegúrate que tu archivo `.env` tenga:

```bash
# Database Configuration (PostgreSQL)
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=movie_bff
DB_USER=postgres
DB_PASSWORD=1234
```

**❌ NO uses:**
- `DB_USER=movieuser` (usuario incorrecto)
- `DB_HOST=localhost` (usar `127.0.0.1` en Windows)
- `DB_PORT=5432` (conflicto con PostgreSQL local)

---

## 🗑️ Limpiar Todo (Reset Completo)

Si nada funciona, puedes hacer un reset completo:

```powershell
# 1. Detener todo Docker
docker-compose down -v

# 2. Eliminar contenedores
docker container prune -f

# 3. Eliminar volúmenes
docker volume prune -f

# 4. Eliminar imágenes (opcional)
docker image prune -a -f

# 5. Volver a descargar imagen limpia
docker pull wilmerleon/movie-bff-postgres:latest

# 6. Levantar de nuevo
docker-compose up -d postgres
```

---

## 🔄 Comandos Útiles de Debug

### Ver estado de contenedores:
```powershell
docker-compose ps
```

### Ver logs en tiempo real:
```powershell
docker logs -f movie-bff-postgres
```

### Entrar al contenedor:
```powershell
docker exec -it movie-bff-postgres bash
```

### Conectar a PostgreSQL desde el contenedor:
```powershell
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff
```

### Ver variables de entorno del contenedor:
```powershell
docker exec movie-bff-postgres env | Select-String "POSTGRES"
```

---

## 📞 Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] Docker Desktop está corriendo
- [ ] El archivo `.env` existe y tiene las variables correctas
- [ ] No hay otro PostgreSQL usando el puerto 5433
- [ ] Los volúmenes antiguos fueron eliminados (`docker-compose down -v`)
- [ ] La imagen se descargó correctamente (`docker images | grep postgres`)
- [ ] Los logs no muestran errores fatales (`docker logs movie-bff-postgres`)

---

## 🆘 Si Nada Funciona

Proporciona esta información:

```powershell
# 1. Versión de Docker
docker --version

# 2. Estado de contenedores
docker-compose ps

# 3. Últimos 50 logs
docker logs movie-bff-postgres --tail 50

# 4. Variables de entorno
Get-Content .env

# 5. Volúmenes
docker volume ls

# 6. Puertos en uso
netstat -ano | Select-String "5433"
```

---

**Autores:** Manuel Martinez & Wílmer E. León  
**Fecha:** Octubre 2025  
**Última actualización:** 28 de octubre de 2025
