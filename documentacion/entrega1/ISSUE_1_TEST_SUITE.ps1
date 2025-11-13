# ISSUE_1_TEST_SUITE.ps1
# Suite completa de pruebas para Issue #1: Endpoint para obtener películas

Write-Host "===============================================================" -ForegroundColor Cyan
# ==============================================================
# SUITE DE PRUEBAS - ISSUE #1: Endpoint para obtener peliculas
# ==============================================================

# Forzar codificacion UTF-8 para caracteres especiales
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "===============================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000/api/movies"
$passed = 0
$failed = 0
$tests = @()

# Helper para registrar resultados
function Add-TestResult {
    param($Name, $Pass, $Message)
    $script:tests += @{Name=$Name; Pass=$Pass; Message=$Message}
    if ($Pass) { $script:passed++ } else { $script:failed++ }
}

# Test 1: Endpoint responde
Write-Host "Test 1: Endpoint responde correctamente" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Status 200 OK" -ForegroundColor Green
        Add-TestResult -Name "Endpoint responde" -Pass $true -Message "Status 200"
    }
} catch {
    Write-Host "  ❌ Endpoint no responde: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult -Name "Endpoint responde" -Pass $false -Message $_.Exception.Message
    Write-Host "`n⚠️ No se puede continuar sin conexión al endpoint" -ForegroundColor Yellow
    exit 1
}

# Parsear JSON
try {
    $json = $response.Content | ConvertFrom-Json
} catch {
    Write-Host "  ❌ Error parseando JSON: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult -Name "JSON válido" -Pass $false -Message $_.Exception.Message
    exit 1
}

# Test 2: Success flag
Write-Host "`nTest 2: Response success=true" -ForegroundColor Yellow
if ($json.success -eq $true) {
    Write-Host "  ✅ success: true" -ForegroundColor Green
    Add-TestResult -Name "Success flag" -Pass $true -Message "success=true"
} else {
    Write-Host "  ❌ success: $($json.success)" -ForegroundColor Red
    Add-TestResult -Name "Success flag" -Pass $false -Message "success=$($json.success)"
}

# Test 3: Limitar a 10 películas
Write-Host "`nTest 3: Limitar a 10 películas" -ForegroundColor Yellow
$movieCount = $json.data.Count
Write-Host "  Películas obtenidas: $movieCount"
if ($movieCount -eq 10) {
    Write-Host "  ✅ Exactamente 10 películas" -ForegroundColor Green
    Add-TestResult -Name "Límite 10 películas" -Pass $true -Message "10 películas"
} else {
    Write-Host "  ❌ Se esperaban 10, se obtuvieron $movieCount" -ForegroundColor Red
    Add-TestResult -Name "Límite 10 películas" -Pass $false -Message "$movieCount películas"
}

# Test 4: Campo count coincide
Write-Host "`nTest 4: Campo count coincide" -ForegroundColor Yellow
if ($json.count -eq $movieCount) {
    Write-Host "  ✅ count ($($json.count)) coincide con data.length ($movieCount)" -ForegroundColor Green
    Add-TestResult -Name "Count correcto" -Pass $true -Message "count=$($json.count)"
} else {
    Write-Host "  ❌ count ($($json.count)) no coincide con data.length ($movieCount)" -ForegroundColor Red
    Add-TestResult -Name "Count correcto" -Pass $false -Message "count=$($json.count), length=$movieCount"
}

# Test 5: Estructura de película válida
Write-Host "`nTest 5: Estructura de película válida" -ForegroundColor Yellow
if ($json.data.Count -gt 0) {
    $movie = $json.data[0]
    Write-Host "  Validando primera película: $($movie.title)"
    
    $requiredFields = @("imdbId", "title", "year", "genre", "director", "actors", "plot", "poster", "imdbRating", "imdbVotes", "runtime", "likes")
    $missingFields = @()
    
    foreach ($field in $requiredFields) {
        if (-not $movie.$field -and $movie.$field -ne 0) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "  ✅ Todos los campos requeridos presentes ($($requiredFields.Count) campos)" -ForegroundColor Green
        Add-TestResult -Name "Estructura completa" -Pass $true -Message "Todos los campos presentes"
    } else {
        Write-Host "  ❌ Campos faltantes: $($missingFields -join ', ')" -ForegroundColor Red
        Add-TestResult -Name "Estructura completa" -Pass $false -Message "Faltan: $($missingFields -join ', ')"
    }
} else {
    Write-Host "  ⚠️ No hay películas para validar estructura" -ForegroundColor Yellow
    Add-TestResult -Name "Estructura completa" -Pass $false -Message "Sin datos"
}

# Test 6: imdbId formato válido
Write-Host "`nTest 6: imdbId formato válido" -ForegroundColor Yellow
if ($movie.imdbId -match "^tt\d{7,}$") {
    Write-Host "  ✅ imdbId válido: $($movie.imdbId)" -ForegroundColor Green
    Add-TestResult -Name "imdbId formato" -Pass $true -Message $movie.imdbId
} else {
    Write-Host "  ❌ imdbId inválido: $($movie.imdbId)" -ForegroundColor Red
    Add-TestResult -Name "imdbId formato" -Pass $false -Message $movie.imdbId
}

# Test 7: Calificación IMDb presente y válida
Write-Host "`nTest 7: Calificación IMDb presente y válida" -ForegroundColor Yellow
if ($movie.imdbRating) {
    try {
        $rating = [decimal]$movie.imdbRating
        if ($rating -ge 0 -and $rating -le 10) {
            Write-Host "  ✅ imdbRating válido: $($movie.imdbRating)" -ForegroundColor Green
            Add-TestResult -Name "imdbRating válido" -Pass $true -Message $movie.imdbRating
        } else {
            Write-Host "  ❌ imdbRating fuera de rango: $($movie.imdbRating)" -ForegroundColor Red
            Add-TestResult -Name "imdbRating válido" -Pass $false -Message "Fuera de rango: $($movie.imdbRating)"
        }
    } catch {
        Write-Host "  ❌ imdbRating no es número: $($movie.imdbRating)" -ForegroundColor Red
        Add-TestResult -Name "imdbRating válido" -Pass $false -Message "No numérico: $($movie.imdbRating)"
    }
} else {
    Write-Host "  ❌ imdbRating no presente" -ForegroundColor Red
    Add-TestResult -Name "imdbRating válido" -Pass $false -Message "Campo vacío"
}

# Test 8: Likes desde BD
Write-Host "`nTest 8: Likes desde base de datos" -ForegroundColor Yellow
if ($null -ne $movie.likes) {
    if ($movie.likes -is [int] -and $movie.likes -ge 0) {
        Write-Host "  ✅ Likes válido: $($movie.likes)" -ForegroundColor Green
        Add-TestResult -Name "Likes desde BD" -Pass $true -Message "likes=$($movie.likes)"
    } else {
        Write-Host "  ❌ Likes inválido: $($movie.likes) (tipo: $($movie.likes.GetType().Name))" -ForegroundColor Red
        Add-TestResult -Name "Likes desde BD" -Pass $false -Message "Tipo incorrecto"
    }
} else {
    Write-Host "  ❌ Campo likes no presente" -ForegroundColor Red
    Add-TestResult -Name "Likes desde BD" -Pass $false -Message "Campo vacío"
}

# Test 9: Poster URL válida
Write-Host "`nTest 9: Poster URL válida" -ForegroundColor Yellow
if ($movie.poster -match "^https?://") {
    Write-Host "  ✅ Poster URL válida: $($movie.poster.Substring(0, [Math]::Min(60, $movie.poster.Length)))..." -ForegroundColor Green
    Add-TestResult -Name "Poster URL" -Pass $true -Message "URL válida"
} else {
    Write-Host "  ❌ Poster URL inválida: $($movie.poster)" -ForegroundColor Red
    Add-TestResult -Name "Poster URL" -Pass $false -Message $movie.poster
}

# Test 10: Runtime formato válido
Write-Host "`nTest 10: Runtime formato válido" -ForegroundColor Yellow
if ($movie.runtime -match "\d+\s*min") {
    Write-Host "  ✅ Runtime válido: $($movie.runtime)" -ForegroundColor Green
    Add-TestResult -Name "Runtime formato" -Pass $true -Message $movie.runtime
} else {
    Write-Host "  ⚠️ Runtime formato inesperado: $($movie.runtime)" -ForegroundColor Yellow
    Add-TestResult -Name "Runtime formato" -Pass $false -Message $movie.runtime
}

# Test 11: Integración OMDB (verificar datos reales)
Write-Host "`nTest 11: Integración con OMDB API" -ForegroundColor Yellow
$omdbFields = @("title", "year", "rated", "genre", "director", "actors", "plot", "imdbRating")
$populatedFields = 0

foreach ($field in $omdbFields) {
    if ($movie.$field -and $movie.$field.ToString().Length -gt 0 -and $movie.$field -ne "N/A") {
        $populatedFields++
    }
}

$percentage = [math]::Round(($populatedFields / $omdbFields.Count) * 100, 0)
Write-Host "  Campos OMDB poblados: $populatedFields/$($omdbFields.Count) ($percentage%)"

if ($populatedFields -ge ($omdbFields.Count - 1)) { # Permitir 1 campo N/A
    Write-Host "  ✅ Integración OMDB exitosa" -ForegroundColor Green
    Add-TestResult -Name "Integración OMDB" -Pass $true -Message "$populatedFields/$($omdbFields.Count) campos"
} else {
    Write-Host "  ❌ Muchos campos vacíos, posible problema con OMDB API" -ForegroundColor Red
    Add-TestResult -Name "Integración OMDB" -Pass $false -Message "Solo $populatedFields/$($omdbFields.Count) campos"
}

# Test 12: Todas las películas tienen datos
Write-Host "`nTest 12: Todas las películas tienen datos completos" -ForegroundColor Yellow
$incompleteMovies = @()

foreach ($m in $json.data) {
    if (-not $m.title -or -not $m.imdbId -or $null -eq $m.likes) {
        $incompleteMovies += $m.imdbId
    }
}

if ($incompleteMovies.Count -eq 0) {
    Write-Host "  ✅ Todas las $($json.data.Count) películas tienen datos completos" -ForegroundColor Green
    Add-TestResult -Name "Datos completos todas" -Pass $true -Message "$($json.data.Count) películas"
} else {
    Write-Host "  ❌ $($incompleteMovies.Count) películas con datos incompletos" -ForegroundColor Red
    Add-TestResult -Name "Datos completos todas" -Pass $false -Message "$($incompleteMovies.Count) incompletas"
}

# Test 13: Tiempo de respuesta
Write-Host "`nTest 13: Tiempo de respuesta" -ForegroundColor Yellow
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    Invoke-WebRequest -Uri $baseUrl | Out-Null
    $stopwatch.Stop()
    $elapsed = $stopwatch.ElapsedMilliseconds
    $seconds = [math]::Round($elapsed / 1000, 2)
    
    Write-Host "  Tiempo: $elapsed ms ($seconds segundos)"
    
    if ($elapsed -lt 5000) {
        Write-Host "  ✅ Excelente: < 5 segundos" -ForegroundColor Green
        Add-TestResult -Name "Tiempo respuesta" -Pass $true -Message "$seconds segundos"
    } elseif ($elapsed -lt 10000) {
        Write-Host "  ⚠️ Aceptable: < 10 segundos" -ForegroundColor Yellow
        Add-TestResult -Name "Tiempo respuesta" -Pass $true -Message "$seconds segundos"
    } else {
        Write-Host "  ❌ Lento: >= 10 segundos" -ForegroundColor Red
        Add-TestResult -Name "Tiempo respuesta" -Pass $false -Message "$seconds segundos"
    }
} catch {
    Write-Host "  ❌ Error midiendo tiempo: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult -Name "Tiempo respuesta" -Pass $false -Message "Error"
}

# Resumen detallado
Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host " RESUMEN DETALLADO DE PRUEBAS" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

foreach ($test in $tests) {
    $status = if ($test.Pass) { "PASS" } else { "FAIL" }
    $color = if ($test.Pass) { "Green" } else { "Red" }
    Write-Host "$status $($test.Name): $($test.Message)" -ForegroundColor $color
}

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host " ESTADISTICAS FINALES" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "PASS Pasadas: $passed" -ForegroundColor Green
Write-Host "FAIL Fallidas: $failed" -ForegroundColor Red

$total = $passed + $failed
if ($total -gt 0) {
    $percentage = [math]::Round(($passed / $total) * 100, 2)
    Write-Host "Tasa de exito: $percentage%" -ForegroundColor Cyan
    
    if ($failed -eq 0) {
        Write-Host "`nTODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
        Write-Host "Issue #1 COMPLETO Y VALIDADO" -ForegroundColor Green
    } elseif ($percentage -ge 80) {
        Write-Host "`nMayoria de pruebas pasaron, pero hay algunos problemas" -ForegroundColor Yellow
    } else {
        Write-Host "`nMuchas pruebas fallaron. Revisar implementacion." -ForegroundColor Red
    }
}

Write-Host "`n===============================================================" -ForegroundColor Cyan
Write-Host " DATOS DE MUESTRA (Primera pelicula)" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

if ($json.data.Count -gt 0) {
    $sampleMovie = $json.data[0]
    Write-Host "Titulo: $($sampleMovie.title)"
    Write-Host "Anio: $($sampleMovie.year)"
    Write-Host "IMDb ID: $($sampleMovie.imdbId)"
    Write-Host "Rating: $($sampleMovie.imdbRating)"
    Write-Host "Genero: $($sampleMovie.genre)"
    Write-Host "Director: $($sampleMovie.director)"
    Write-Host "Likes: $($sampleMovie.likes)"
    Write-Host "Runtime: $($sampleMovie.runtime)"
}

Write-Host "`n===============================================================" -ForegroundColor Cyan

