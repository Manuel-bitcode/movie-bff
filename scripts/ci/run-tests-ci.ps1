Write-Host "[CI] Levantando servicios con docker-compose..."
docker-compose up -d postgres

Write-Host "[CI] Esperando a que Postgres esté listo..."
$maxAttempts = 30
for ($i = 0; $i -lt $maxAttempts; $i++) {
    $ready = docker-compose exec -T postgres pg_isready -U postgres
    if ($ready -and $ready -like '*accepting connections*') { break }
    Start-Sleep -Seconds 1
}

Write-Host "[CI] Ejecutando tests en contenedor app..."
docker-compose run --rm app npm test -- --ci
$testExitCode = $LASTEXITCODE

Write-Host "[CI] Bajando servicios..."
docker-compose down

exit $testExitCode
