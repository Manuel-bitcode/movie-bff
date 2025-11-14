# 🧪 Pruebas - Issue #1: Endpoint para obtener películas

## 📋 Requisitos del Issue #1

Según el Issue #1, el endpoint debe:

1. ✅ **Limitar a 10 películas** - Retornar máximo 10 películas
2. ✅ **Organizar response para el front** - Formato estructurado con todos los datos necesarios
3. ✅ **Obtener calificación de películas** - Incluir `imdbRating` desde OMDB API
4. ✅ **Consumir endpoint de API externa** - Integrar con OMDB API
5. ✅ **Buscar en BD para obtener likes** - Combinar datos de OMDB + likes de PostgreSQL

---

## 🔧 Pre-requisitos

### 1. Obtener OMDB API Key

```bash
# 1. Ir a: https://www.omdbapi.com/apikey.aspx
# 2. Seleccionar "FREE" plan (1,000 requests/day)
# 3. Ingresar email
# 4. Verificar email y activar la key
# 5. Copiar la API key recibida
```

### 2. Configurar API Key

**Archivo `.env`:**
```properties
OMDB_API_KEY=tu_api_key_aqui  # ← Reemplazar con tu key
```

### 3. Reiniciar contenedores

```bash
docker-compose down
docker-compose up -d --build
```

---

## 📝 Estructura de la Respuesta Esperada

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
      "plot": "Over the course of several years...",
      "poster": "https://m.media-amazon.com/images/...",
      "imdbRating": "9.3",
      "imdbVotes": "2,900,000",
      "runtime": "142 min",
      "likes": 0  // ← Desde nuestra BD
    },
    // ... 9 películas más (total 10)
  ],
  "count": 10,
  "message": "Películas obtenidas correctamente"
}
```

---

## 🧪 Suite de Pruebas

### Test 1: Endpoint responde correctamente

**Comando:**
```bash
curl http://localhost:3000/api/movies
```

**Validaciones:**
- ✅ Status code: `200 OK`
- ✅ Header `Content-Type`: `application/json`
- ✅ Respuesta tiene campo `success: true`
- ✅ Respuesta tiene campo `data` (array)
- ✅ Respuesta tiene campo `count` (número)
- ✅ Respuesta tiene campo `message` (string)

**Comando PowerShell:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/movies"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Content-Type: $($response.Headers['Content-Type'])"
$json = $response.Content | ConvertFrom-Json
Write-Host "Success: $($json.success)"
Write-Host "Count: $($json.count)"
```

---

### Test 2: Limitar a 10 películas

**Comando:**
```bash
curl http://localhost:3000/api/movies | jq '.count'
```

**Validaciones:**
- ✅ `count` debe ser exactamente `10`
- ✅ `data.length` debe ser exactamente `10`

**Comando PowerShell:**
```powershell
$json = (Invoke-WebRequest -Uri "http://localhost:3000/api/movies").Content | ConvertFrom-Json
$count = $json.data.Count
Write-Host "Número de películas: $count"
if ($count -eq 10) {
    Write-Host "✅ PASS: Exactamente 10 películas" -ForegroundColor Green
} else {
    Write-Host "❌ FAIL: Se esperaban 10 películas, se obtuvieron $count" -ForegroundColor Red
}
```

---

### Test 3: Estructura de cada película

**Validaciones para cada película:**
- ✅ Tiene `imdbId` (string, formato "ttXXXXXXX")
- ✅ Tiene `title` (string, no vacío)
- ✅ Tiene `year` (string, 4 dígitos)
- ✅ Tiene `rated` (string, ej: "R", "PG-13")
- ✅ Tiene `genre` (string, no vacío)
- ✅ Tiene `director` (string, no vacío)
- ✅ Tiene `actors` (string, no vacío)
- ✅ Tiene `plot` (string, no vacío)
- ✅ Tiene `poster` (string, URL válida)
- ✅ Tiene `imdbRating` (string, número decimal)
- ✅ Tiene `imdbVotes` (string, con formato de número)
- ✅ Tiene `runtime` (string, formato "XXX min")
- ✅ Tiene `likes` (number, >= 0)

**Comando PowerShell:**
```powershell
$json = (Invoke-WebRequest -Uri "http://localhost:3000/api/movies").Content | ConvertFrom-Json
$movie = $json.data[0]  # Primera película

Write-Host "`n🎬 Validando estructura de película..." -ForegroundColor Cyan
Write-Host "Title: $($movie.title)"
Write-Host "ImdbId: $($movie.imdbId)"
Write-Host "Year: $($movie.year)"
Write-Host "Genre: $($movie.genre)"
Write-Host "Director: $($movie.director)"
Write-Host "ImdbRating: $($movie.imdbRating)"
Write-Host "Likes: $($movie.likes)"

# Validaciones
$tests = @(
    @{Name="imdbId válido"; Pass=$movie.imdbId -match "^tt\d{7,}$"},
    @{Name="title no vacío"; Pass=$movie.title.Length -gt 0},
    @{Name="year 4 dígitos"; Pass=$movie.year -match "^\d{4}$"},
    @{Name="genre no vacío"; Pass=$movie.genre.Length -gt 0},
    @{Name="director no vacío"; Pass=$movie.director.Length -gt 0},
    @{Name="imdbRating válido"; Pass=$movie.imdbRating -match "^\d+\.\d+$"},
    @{Name="likes es número"; Pass=$movie.likes -is [int]},
    @{Name="likes >= 0"; Pass=$movie.likes -ge 0}
)

foreach ($test in $tests) {
    if ($test.Pass) {
        Write-Host "  ✅ $($test.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($test.Name)" -ForegroundColor Red
    }
}
```

---

### Test 4: Calificación incluida (imdbRating)

**Validaciones:**
- ✅ Todas las películas tienen `imdbRating` definido
- ✅ `imdbRating` es un string con formato de decimal (ej: "9.3", "8.8")
- ✅ `imdbRating` está entre 0.0 y 10.0

**Comando PowerShell:**
```powershell
$json = (Invoke-WebRequest -Uri "http://localhost:3000/api/movies").Content | ConvertFrom-Json

Write-Host "`n⭐ Validando calificaciones IMDb..." -ForegroundColor Cyan

$allValid = $true
foreach ($movie in $json.data) {
    $rating = [decimal]$movie.imdbRating
    $valid = ($rating -ge 0.0 -and $rating -le 10.0)
    
    if ($valid) {
        Write-Host "  ✅ $($movie.title): $($movie.imdbRating)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($movie.title): $($movie.imdbRating) (inválido)" -ForegroundColor Red
        $allValid = $false
    }
}

if ($allValid) {
    Write-Host "`n✅ Todas las calificaciones son válidas" -ForegroundColor Green
} else {
    Write-Host "`n❌ Algunas calificaciones son inválidas" -ForegroundColor Red
}
```

---

### Test 5: Integración con OMDB API

**Validaciones:**
- ✅ Los datos provienen de OMDB API (verificar `poster` URL válida de Amazon/IMDb)
- ✅ Múltiples campos coinciden con datos de OMDB (title, year, director, etc.)

**Comando PowerShell:**
```powershell
$json = (Invoke-WebRequest -Uri "http://localhost:3000/api/movies").Content | ConvertFrom-Json
$movie = $json.data[0]

Write-Host "`n🌐 Validando integración OMDB API..." -ForegroundColor Cyan

# Verificar que poster viene de Amazon (OMDB usa AWS)
if ($movie.poster -match "media-amazon\.com") {
    Write-Host "  ✅ Poster URL es de Amazon (OMDB)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Poster URL no es de Amazon: $($movie.poster)" -ForegroundColor Yellow
}

# Verificar que tiene múltiples campos poblados (señal de OMDB)
$fieldsFromOmdb = @("title", "year", "rated", "genre", "director", "actors", "plot", "imdbRating", "imdbVotes", "runtime")
$populatedFields = 0

foreach ($field in $fieldsFromOmdb) {
    if ($movie.$field -and $movie.$field.Length -gt 0) {
        $populatedFields++
    }
}

Write-Host "  Campos poblados desde OMDB: $populatedFields/$($fieldsFromOmdb.Count)"

if ($populatedFields -eq $fieldsFromOmdb.Count) {
    Write-Host "  ✅ Todos los campos OMDB están poblados" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Algunos campos OMDB están vacíos" -ForegroundColor Yellow
}
```

---

### Test 6: Likes desde base de datos

**Validaciones:**
- ✅ Campo `likes` existe en cada película
- ✅ `likes` es un número entero
- ✅ `likes` es >= 0
- ✅ Al incrementar un like, el valor aumenta en el próximo request

**Setup:**
```powershell
# 1. Obtener likes iniciales
$json1 = (Invoke-WebRequest -Uri "http://localhost:3000/api/movies").Content | ConvertFrom-Json
$movie1 = $json1.data[0]
$initialLikes = $movie1.likes

Write-Host "`n❤️ Validando integración con BD (likes)..." -ForegroundColor Cyan
Write-Host "Película: $($movie1.title)"
Write-Host "Likes iniciales: $initialLikes"

# 2. Incrementar like
$imdbId = $movie1.imdbId
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/movies/$imdbId/like" | Out-Null

# 3. Obtener likes actualizados
Start-Sleep -Seconds 1
$json2 = (Invoke-WebRequest -Uri "http://localhost:3000/api/movies").Content | ConvertFrom-Json
$movie2 = $json2.data | Where-Object { $_.imdbId -eq $imdbId }
$newLikes = $movie2.likes

Write-Host "Likes después de POST like: $newLikes"

# Validación
if ($newLikes -eq ($initialLikes + 1)) {
    Write-Host "  ✅ Like se incrementó correctamente (BD integrada)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Like no se incrementó correctamente" -ForegroundColor Red
}
```

---

### Test 7: Tiempo de respuesta

**Validaciones:**
- ✅ Respuesta en menos de 5 segundos (aceptable para 10 llamadas a OMDB)
- ✅ Respuesta en menos de 10 segundos (timeout razonable)

**Comando PowerShell:**
```powershell
Write-Host "`n⏱️ Midiendo tiempo de respuesta..." -ForegroundColor Cyan

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/movies"
$stopwatch.Stop()

$elapsed = $stopwatch.ElapsedMilliseconds
Write-Host "Tiempo de respuesta: $elapsed ms ($([math]::Round($elapsed/1000, 2)) segundos)"

if ($elapsed -lt 5000) {
    Write-Host "  ✅ Excelente: < 5 segundos" -ForegroundColor Green
} elseif ($elapsed -lt 10000) {
    Write-Host "  ⚠️ Aceptable: < 10 segundos" -ForegroundColor Yellow
} else {
    Write-Host "  ❌ Lento: >= 10 segundos" -ForegroundColor Red
}
```

---

### Test 8: Manejo de errores (API Key inválida)

**Setup:** Configurar API key inválida temporalmente

**Validaciones:**
- ✅ Si API key es inválida, retorna array vacío
- ✅ `success: true` pero `count: 0`
- ✅ No genera error 500

**Comando PowerShell:**
```powershell
# Este test requiere cambiar temporalmente OMDB_API_KEY a un valor inválido
# y reiniciar el contenedor

Write-Host "`n❌ Test de API Key inválida..." -ForegroundColor Cyan
Write-Host "⚠️ Este test requiere configurar temporalmente una API key inválida"
Write-Host "Pasos:"
Write-Host "1. Editar .env: OMDB_API_KEY=invalid_key"
Write-Host "2. docker-compose restart app"
Write-Host "3. Ejecutar: curl http://localhost:3000/api/movies"
Write-Host "4. Verificar: success=true, count=0, data=[]"
Write-Host "5. Restaurar .env con API key válida"
Write-Host "6. docker-compose restart app"
```

---

## 📊 Suite Completa de Pruebas

**Script PowerShell completo:**

```powershell
# ISSUE_1_TEST_SUITE.ps1
# Suite completa de pruebas para Issue #1

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 SUITE DE PRUEBAS - ISSUE #1: Endpoint para obtener películas" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/movies"
$passed = 0
$failed = 0

# Test 1: Endpoint responde
Write-Host "Test 1: Endpoint responde correctamente" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Status 200 OK" -ForegroundColor Green
        $passed++
    }
} catch {
    Write-Host "  ❌ Endpoint no responde" -ForegroundColor Red
    $failed++
}

# Test 2: Limitar a 10 películas
Write-Host "`nTest 2: Limitar a 10 películas" -ForegroundColor Yellow
$json = ($response.Content | ConvertFrom-Json)
if ($json.data.Count -eq 10) {
    Write-Host "  ✅ Exactamente 10 películas" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ Se esperaban 10, se obtuvieron $($json.data.Count)" -ForegroundColor Red
    $failed++
}

# Test 3: Estructura válida
Write-Host "`nTest 3: Estructura de película válida" -ForegroundColor Yellow
$movie = $json.data[0]
$requiredFields = @("imdbId", "title", "year", "genre", "director", "imdbRating", "likes")
$validStructure = $true

foreach ($field in $requiredFields) {
    if (-not $movie.$field) {
        Write-Host "  ❌ Falta campo: $field" -ForegroundColor Red
        $validStructure = $false
    }
}

if ($validStructure) {
    Write-Host "  ✅ Estructura completa" -ForegroundColor Green
    $passed++
} else {
    $failed++
}

# Test 4: Calificación IMDb presente
Write-Host "`nTest 4: Calificación IMDb presente" -ForegroundColor Yellow
if ($movie.imdbRating -and [decimal]$movie.imdbRating -ge 0 -and [decimal]$movie.imdbRating -le 10) {
    Write-Host "  ✅ imdbRating válido: $($movie.imdbRating)" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ imdbRating inválido" -ForegroundColor Red
    $failed++
}

# Test 5: Likes desde BD
Write-Host "`nTest 5: Likes desde base de datos" -ForegroundColor Yellow
if ($movie.likes -is [int] -and $movie.likes -ge 0) {
    Write-Host "  ✅ Likes válido: $($movie.likes)" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  ❌ Likes inválido" -ForegroundColor Red
    $failed++
}

# Resumen
Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Pasadas: $passed" -ForegroundColor Green
Write-Host "❌ Fallidas: $failed" -ForegroundColor Red
$total = $passed + $failed
$percentage = [math]::Round(($passed / $total) * 100, 2)
Write-Host "📈 Éxito: $percentage%" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n🎉 ¡TODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Algunas pruebas fallaron. Revisar logs." -ForegroundColor Yellow
}
```

---

## 🚀 Ejecución Rápida

### Opción 1: Prueba Individual

```bash
# 1. GET películas (ver resultado completo)
curl http://localhost:3000/api/movies | jq '.'

# 2. Contar películas
curl http://localhost:3000/api/movies | jq '.count'

# 3. Ver primera película
curl http://localhost:3000/api/movies | jq '.data[0]'

# 4. Ver solo títulos
curl http://localhost:3000/api/movies | jq '.data[].title'

# 5. Ver títulos + ratings
curl http://localhost:3000/api/movies | jq '.data[] | {title, imdbRating, likes}'
```

### Opción 2: PowerShell (Visual)

```powershell
# Ejecutar suite completa
.\ISSUE_1_TEST_SUITE.ps1

# O ejecutar tests individuales del archivo ISSUE_1_TESTS.md
```

---

## 📝 Checklist de Validación Manual

- [ ] Endpoint responde con status 200
- [ ] Retorna exactamente 10 películas
- [ ] Cada película tiene todos los campos requeridos
- [ ] `imdbRating` está presente y es válido (0-10)
- [ ] `likes` proviene de la base de datos PostgreSQL
- [ ] Al incrementar like (POST), el valor se actualiza
- [ ] Poster es URL válida de Amazon/IMDb
- [ ] Tiempo de respuesta < 10 segundos
- [ ] Con API key inválida, no genera error 500
- [ ] Response tiene formato JSON válido

---

## 🐛 Troubleshooting

### Problema: "Invalid API key!"

**Solución:**
```bash
# 1. Obtener API key válida desde https://www.omdbapi.com/apikey.aspx
# 2. Actualizar .env
OMDB_API_KEY=tu_api_key_real_aqui

# 3. Reiniciar
docker-compose restart app
```

### Problema: "data: []" (array vacío)

**Posibles causas:**
1. API key inválida → Revisar `.env`
2. OMDB API caída → Revisar logs: `docker logs movie-bff --tail 50`
3. Red bloqueada → Verificar conectividad: `curl http://www.omdbapi.com`

### Problema: Likes siempre en 0

**Solución:**
```bash
# Verificar conexión a PostgreSQL
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff -c "SELECT * FROM movie_likes;"

# Si tabla vacía, insertar datos de prueba
docker exec -it movie-bff-postgres psql -U postgres -d movie_bff -c "INSERT INTO movie_likes (imdb_id, likes) VALUES ('tt0111161', 100);"
```

---

## ✅ Criterios de Aceptación del Issue #1

| Requisito | Implementado | Probado |
|-----------|-------------|---------|
| Limitar a 10 películas | ✅ | ✅ |
| Organizar response para front | ✅ | ✅ |
| Obtener calificación de películas | ✅ | ✅ |
| Consumir API externa (OMDB) | ✅ | ✅ |
| Buscar likes en BD | ✅ | ✅ |

**Estado del Issue #1:** ✅ **COMPLETO Y VALIDADO**

---

**Fecha de validación:** Noviembre 1, 2025  
**Desarrollador:** Copilot + Manuel Martinez  
**Issue:** #1 - Crear endpoint para obtener películas
