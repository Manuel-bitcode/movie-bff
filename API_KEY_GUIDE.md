# 🔑 Guía de API Key - movie-bff

## ❓ ¿Qué es la API_KEY?

La `API_KEY` es un **token de autenticación opcional** que se usa para proteger los endpoints de tu API REST. 

> **Estado actual:** Esta funcionalidad está **preparada pero no implementada aún**. La variable está disponible en `config.ts` pero no se valida en ningún endpoint.

---

## 🔒 Generar una API Key Segura

### Opción 1: PowerShell (Windows) ⭐ Recomendado

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Ejemplo de salida:**
```
2Mwgzjtut/qHOntFWJ6K9Vyv2qvAG+2MNsscHQsqjEY=
```

---

### Opción 2: Node.js (Cross-platform)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Ejemplo de salida:**
```
nqa6/xz9nNBku45PaEAnMMP08DgPNHpRNVvqp07TPLw=
```

---

### Opción 3: Bash/Linux

```bash
openssl rand -base64 32
```

---

## 📝 Configurar la API Key

### 1. Generar tu propia key
```powershell
# Ejecutar en PowerShell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 2. Copiar al archivo `.env`
```bash
# En tu archivo .env (NO en .env.example)
API_KEY=tu_key_generada_aqui
```

### 3. Verificar configuración
```typescript
// En src/config/config.ts
console.log('API Key configurada:', process.env.API_KEY ? '✅ Sí' : '❌ No');
```

---

## 🚀 ¿Cómo se usa? (Implementación futura)

### Middleware de autenticación (ejemplo)

```typescript
// src/middlewares/auth.ts (por crear)
import { Request, Response, NextFunction } from 'express';
import config from '../config/config';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;

  if (!config.apiKey) {
    // Si no hay API_KEY configurada, permitir acceso (modo desarrollo)
    return next();
  }

  if (apiKey !== config.apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API Key inválida o no proporcionada'
    });
  }

  next();
};
```

### Uso en rutas

```typescript
// src/routes/movieRoutes.ts
import { apiKeyAuth } from '../middlewares/auth';

// Proteger endpoint con API Key
router.get('/api/movies', apiKeyAuth, getMovies);
router.post('/api/movies/:id/like', apiKeyAuth, incrementLike);
```

### Cliente (Frontend) - Ejemplo de uso

```typescript
// Enviar API Key en header
fetch('http://localhost:3001/api/movies', {
  headers: {
    'X-API-Key': 'tu_api_key_aqui'
  }
});

// O en query parameter
fetch('http://localhost:3001/api/movies?apikey=tu_api_key_aqui');
```

---

## ⚠️ Buenas Prácticas

### ✅ SÍ hacer:
- ✅ Generar una key diferente para cada ambiente (dev, staging, prod)
- ✅ Guardar la key en `.env` (nunca en el código)
- ✅ Usar HTTPS en producción
- ✅ Rotar la key periódicamente (cada 3-6 meses)
- ✅ Compartir la key de forma segura (no por email o chat público)

### ❌ NO hacer:
- ❌ Commitear el archivo `.env` al repositorio
- ❌ Compartir la key en GitHub Issues o PRs
- ❌ Usar la misma key en desarrollo y producción
- ❌ Hardcodear la key en el código
- ❌ Enviar la key sin cifrar (usar HTTPS)

---

## 🔄 Rotar la API Key

Si necesitas cambiar la API Key:

```bash
# 1. Generar nueva key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 2. Actualizar .env
API_KEY=nueva_key_generada

# 3. Reiniciar el servidor
npm run dev
# O con Docker:
docker-compose restart
```

---

## 📊 Estado de Implementación

| Feature | Estado | Notas |
|---------|--------|-------|
| Variable en `.env` | ✅ Listo | Configurada en `.env.example` |
| Lectura en `config.ts` | ✅ Listo | Disponible como `config.apiKey` |
| Middleware de auth | ❌ Pendiente | Por implementar en Issue futuro |
| Validación en endpoints | ❌ Pendiente | Por implementar en Issue futuro |
| Documentación API | ❌ Pendiente | Agregar a README cuando se implemente |

---

## 🤔 ¿Es Obligatoria la API Key?

**No, es opcional.** 

- **En desarrollo:** Puedes dejarla como está (`your_api_key_here`) o no configurarla
- **En producción:** Es **altamente recomendada** para proteger tu API

El código actual lee la variable pero **no valida nada** todavía. La implementación de autenticación será en un Issue futuro.

---

## 📞 Preguntas Frecuentes

### ¿Por qué mi API Key no funciona?
**R:** Actualmente la API Key **no está siendo validada**. Es una variable preparada para futuras implementaciones.

### ¿Puedo usar cualquier string como API Key?
**R:** Técnicamente sí, pero **no es recomendado**. Usa siempre los métodos criptográficos mencionados arriba para máxima seguridad.

### ¿Dónde está el middleware de autenticación?
**R:** Aún **no está implementado**. Esta será parte de un Issue futuro sobre seguridad.

### ¿Necesito una API Key para desarrollo local?
**R:** **No**, es opcional. Solo configúrala si vas a probar autenticación o en producción.

---

## 🔗 Referencias

- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [Express.js Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

**Autores:** Manuel Martinez & Wílmer E. León  
**Fecha:** Octubre 2025  
**Versión:** 1.0
