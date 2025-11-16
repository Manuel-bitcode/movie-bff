param(
    [switch]$Force
)

# Script seguro para listar y (opcionalmente) eliminar contenedores y volúmenes relacionados con 'movie-bff'.
# Uso: .\cleanup-docker-containers.ps1 [-Force]

Write-Host "== Limpieza de recursos Docker relacionados con 'movie-bff' =="

# Listar contenedores que contienen 'movie-bff' en el nombre
$containers = docker ps -a --filter "name=movie-bff" --format "{{.ID}} {{.Names}} {{.Image}}"
if (-not $containers) {
    Write-Host "No se encontraron contenedores con 'movie-bff' en el nombre."
} else {
    Write-Host "Contenedores encontrados:"
    $containers | ForEach-Object { Write-Host "  $_" }

    if ($Force) {
        Write-Host "Eliminando contenedores (forzado)..."
        $ids = docker ps -a --filter "name=movie-bff" --format "{{.ID}}"
        if ($ids) { docker rm -f $ids } else { Write-Host 'No hay IDs para eliminar.' }
    } else {
        $confirm = Read-Host "¿Deseas eliminar estos contenedores? (y/N)"
        if ($confirm -match '^[yY](es)?$') {
            $ids = docker ps -a --filter "name=movie-bff" --format "{{.ID}}"
            if ($ids) { docker rm -f $ids } else { Write-Host 'No hay IDs para eliminar.' }
        } else {
            Write-Host "No se eliminaron contenedores."
        }
    }
}

# Volúmenes huérfanos que contienen 'moviebff' o 'movie-bff' (opcional)
Write-Host "\n-- Volúmenes potencialmente relacionados --"
$vols = docker volume ls --format "{{.Name}}" | Where-Object { $_ -match 'movie' }
if (-not $vols) {
    Write-Host "No se encontraron volúmenes relacionados."
} else {
    $vols | ForEach-Object { Write-Host "  $_" }
    if ($Force) {
        Write-Host "Eliminando volúmenes listados..."
        $vols | ForEach-Object { docker volume rm -f $_ }
    } else {
        $confirmV = Read-Host "¿Deseas eliminar estos volúmenes? (y/N)"
        if ($confirmV -match '^[yY](es)?$') {
            $vols | ForEach-Object { docker volume rm -f $_ }
        } else {
            Write-Host "No se eliminaron volúmenes."
        }
    }
}

Write-Host "\nLimpieza finalizada."