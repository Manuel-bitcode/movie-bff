#!/usr/bin/env bash
set -euo pipefail

# Script para uso en CI: levanta postgres y ejecuta los tests dentro del servicio `app`
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

#!/bin/bash
set -e

echo "[CI] Levantando servicios con docker-compose..."
docker-compose up -d postgres

echo "[CI] Esperando a que Postgres esté listo..."
for i in {1..30}; do
  docker-compose exec -T postgres pg_isready -U postgres && break
  sleep 1
done

echo "[CI] Ejecutando tests en contenedor app..."
docker-compose run --rm app npm test -- --ci
TEST_EXIT_CODE=$?

echo "[CI] Bajando servicios..."
docker-compose down

exit $TEST_EXIT_CODE
