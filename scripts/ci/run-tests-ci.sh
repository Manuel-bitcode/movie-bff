#!/usr/bin/env bash
set -euo pipefail

# Script para uso en CI: intenta levantar postgres y ejecutar los tests dentro
# del servicio `app` usando docker-compose. Si no hay acceso al socket de
# Docker (permission denied) o docker-compose falla, usa un fallback local
# ejecutando `npm ci` y `npm test` directamente en el contenedor Jenkins.

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

echo "[CI] Intentando ejecutar tests con docker-compose (modo preferido)..."
# Use a CI-specific compose override which builds a Postgres image that includes
# the init SQL. This avoids bind-mount issues when docker-compose runs inside
# the Jenkins container. The fallback to plain docker-compose (no override)
# is preserved for local runs.
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.ci.yml"

# Use a per-build compose project name to avoid container name collisions in
# shared Docker daemon environments (Jenkins). Prefer BUILD_NUMBER (Jenkins)
# when available; otherwise fall back to COMPOSE_PROJECT_NAME or a timestamp.
if [ -n "${BUILD_NUMBER:-}" ]; then
  PROJECT_NAME="moviebff_ci_${BUILD_NUMBER}"
else
  PROJECT_NAME="${COMPOSE_PROJECT_NAME:-moviebff_ci_$(date +%s)}"
fi
export COMPOSE_PROJECT_NAME="$PROJECT_NAME"

# Ensure we always try to bring down the services created by this script.
trap 'set +e; docker-compose -p "$COMPOSE_PROJECT_NAME" $COMPOSE_FILES down --remove-orphans; set -e' EXIT

set +e
docker-compose -p "$COMPOSE_PROJECT_NAME" $COMPOSE_FILES up -d postgres
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
  if docker-compose -p "$COMPOSE_PROJECT_NAME" $COMPOSE_FILES exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[CI] Ejecutando tests en contenedor app (arrancando servicio para preservar artifacts)..."
# Start the app service in background so we can copy artifacts out afterwards
docker-compose -p "$COMPOSE_PROJECT_NAME" $COMPOSE_FILES up -d app
APP_CID=$(docker-compose -p "$COMPOSE_PROJECT_NAME" $COMPOSE_FILES ps -q app)

if [ -z "$APP_CID" ]; then
  echo "[CI] No pude obtener el container id del servicio app. Ejecutando fallback local." >&2
  npm ci
  npm test -- --ci
  TEST_EXIT_CODE=$?
  echo "[CI] Bajando servicios..."
  docker-compose -p "$COMPOSE_PROJECT_NAME" $COMPOSE_FILES down --remove-orphans
  exit $TEST_EXIT_CODE
fi

echo "[CI] Container ID del app: $APP_CID"

# Execute tests inside the running app container
docker exec -u root "$APP_CID" sh -c "npm ci && npm test -- --coverage --ci"
TEST_EXIT_CODE=$?

echo "[CI] Copiando artifacts desde el contenedor al workspace..."
# Try to copy junit.xml and coverage; ignore errors if they don't exist
docker cp "$APP_CID":/app/junit.xml ./junit.xml || true
docker cp "$APP_CID":/app/coverage ./coverage || true

echo "[CI] Bajando servicios..."
docker-compose -p "$COMPOSE_PROJECT_NAME" $COMPOSE_FILES down --remove-orphans

exit $TEST_EXIT_CODE
