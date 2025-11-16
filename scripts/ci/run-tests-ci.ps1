<#
.SYNOPSIS
  Script PowerShell para ejecutar tests en CI en entornos Windows: levanta Postgres y ejecuta tests dentro del servicio `app` usando docker-compose.
#>
param()

Set-StrictMode -Version Latest
$Root = Split-Path -Path $PSScriptRoot -Parent | Split-Path -Parent
Set-Location $Root

Write-Output "[ci] Iniciando servicios de prueba (postgres)..."
docker-compose up -d postgres

Write-Output "[ci] Esperando a que Postgres esté listo..."
$retries = 30
for ($i = 1; $i -le $retries; $i++) {
    docker-compose exec -T postgres pg_isready -U ${env:DB_USER -or 'postgres'} 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Output "[ci] Postgres listo (attempt $i)"
        break
    }
    Write-Output "[ci] Postgres no listo, esperando 1s (attempt $i/$retries)"
    Start-Sleep -Seconds 1
    if ($i -eq $retries) {
        Write-Error "[ci] ERROR: Postgres no quedó listo después de $retries intentos"
        docker-compose logs postgres
        docker-compose down
        exit 1
    }
}

Write-Output "[ci] Ejecutando tests dentro del servicio 'app'..."
docker-compose run --rm --no-deps app sh -c "npm ci && npm test -- --ci"
$exit = $LASTEXITCODE

Write-Output "[ci] Tear down - deteniendo servicios de prueba..."
docker-compose down

exit $exit
