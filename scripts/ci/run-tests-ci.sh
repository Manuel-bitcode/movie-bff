#!/usr/bin/env bash
set -euo pipefail

# Script para uso en CI: levanta postgres y ejecuta los tests dentro del servicio `app`
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[ci] Iniciando servicios de prueba (postgres)..."
docker-compose up -d postgres

echo "[ci] Esperando a que Postgres esté listo (pg_isready)..."
RETRIES=30
for i in $(seq 1 $RETRIES); do
  if docker-compose exec -T postgres pg_isready -U "${DB_USER:-postgres}" >/dev/null 2>&1; then
    echo "[ci] Postgres listo (attempt $i)"
    break
  fi
  echo "[ci] Postgres no listo aún, esperando 1s (attempt $i/$RETRIES)"
  sleep 1
  if [ "$i" -eq "$RETRIES" ]; then
    echo "[ci] ERROR: Postgres no quedó listo después de $RETRIES intentos"
    docker-compose logs postgres || true
    docker-compose down || true
    exit 1
  fi
done

echo "[ci] Ejecutando tests dentro del servicio 'app'..."
# Ejecutar el contenedor app sin dependencias adicionales (usa la configuración de docker-compose)
docker-compose run --rm --no-deps app sh -c "npm ci && npm test -- --ci"

EXIT_CODE=$?

echo "[ci] Tear down - deteniendo servicios de prueba..."
docker-compose down

exit $EXIT_CODE
