#!/usr/bin/env bash
set -euo pipefail

# Script para uso en CI: intenta levantar postgres y ejecutar los tests dentro
# del servicio `app` usando docker-compose. Si no hay acceso al socket de
# Docker (permission denied) o docker-compose falla, usa un fallback local
# ejecutando `npm ci` y `npm test` directamente en el contenedor Jenkins.

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[CI] Intentando ejecutar tests con docker-compose (modo preferido)..."
set +e
docker-compose up -d postgres
DC_EXIT=$?
set -e

if [ "$DC_EXIT" -ne 0 ]; then
  echo "[CI] docker-compose no pudo arrancar servicios (exit $DC_EXIT). Usando fallback local." >&2
  echo "[CI] Ejecutando fallback: npm ci && npm test"
  npm ci
  npm test -- --ci
  exit $?
fi

echo "[CI] Esperando a que Postgres esté listo..."
for i in {1..30}; do
  if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[CI] Ejecutando tests en contenedor app..."
docker-compose run --rm app npm test -- --ci
TEST_EXIT_CODE=$?

echo "[CI] Bajando servicios..."
docker-compose down

exit $TEST_EXIT_CODE
