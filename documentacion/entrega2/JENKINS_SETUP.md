Jenkins - Configuración del Entorno Unificado

Este documento describe la configuración recomendada para levantar una instancia de Jenkins que sirva como entorno unificado para el frontend y el backend, y cómo mapear los jobs para los cuatro integrantes y sus ramas.

## Resumen rápido
- Jenkins en contenedor Docker (servicio `jenkins` en `docker-compose.yml`)
- Volumen persistente: `jenkins_home`
- Montar `/var/run/docker.sock` para permitir builds Docker
- NodeJS 20 configurado en Global Tool Configuration
- Plugins requeridos: Git, GitHub, Pipeline, Docker Pipeline, NodeJS, HTML Publisher, JUnit

## Ramas a soportar (4 integrantes)
- `feature/integrante3-test-b1`  → Responsable: @wilmereleon  (Job: `movie-bff-B1`)
- `feature/integrante5-test-b3`  → Responsable: @PaolaRoa      (Job: `movie-bff-B3`)
- `feature/integrante2-test-f2`  → Responsable: @whosfeliperojas (Job: `movie-webapp-F2`)
- `feature/integrante4-test-b2`  → Responsable: @araujonatalia (Job: `movie-bff-B2`)

## Recomendación de Jobs (2 opciones)

Opción A — Multibranch Pipeline por repositorio (recomendada):
- Crear un Multibranch Pipeline para `movie-bff` y otro para `movie-webapp`.
- Jenkins detecta automáticamente las ramas y crea pipelines por rama.
- Configurar branch sources → GitHub repository + credentials.

Opción B — Pipeline jobs por rama (más explícito):
- Crear jobs tipo Pipeline individuales con nombre indicado en la tabla arriba y Script Path `Jenkinsfile`.

## Pasos para levantar el entorno (Manuel-bitcode)

1. Levantar Jenkins con Docker Compose (desde la raíz del repo):

```bash
docker-compose up -d jenkins
```

2. Obtener contraseña inicial (si aplica):

```bash
docker exec jenkins-unified cat /var/jenkins_home/secrets/initialAdminPassword
```

3. Acceder a Jenkins: `http://<JENKINS_HOST>:8080`.

4. Instalar plugins recomendados (Manage Jenkins → Manage Plugins):
- Git Plugin
- GitHub Plugin
- Pipeline
- Docker Pipeline
- NodeJS Plugin
- HTML Publisher
- JUnit

5. Configurar Global Tool Configuration:
- NodeJS: añadir una instalación llamada `NodeJS-20` que apunte a Node 20 (o dejar que Jenkins instale automáticamente si hay plugin).

6. Credenciales (Manage Jenkins → Credentials):
- `github-credentials` — GitHub Personal Access Token (repo + admin:repo_hook)
- `docker-hub-credentials` — Docker Hub username/password

7. Crear los jobs recomendados (multibranch o pipeline):
- Si usas Multibranch: configurar GitHub repository y Branch sources.
- Si usas Pipeline jobs: configurar SCM → Git → repo URL → Script Path `Jenkinsfile`.

8. Configurar Webhooks en GitHub (para repos `movie-bff` y `movie-webapp`):
- URL: `http://<JENKINS_HOST>:8080/github-webhook/`
- Content type: `application/json`
- Events: push (recomendado), pull_request (opcional)

## Mapeo y flujo recomendado

- Cada push a `feature/*` dispara el Multibranch o el Pipeline de la rama correspondiente.
- El stage `Lint` (ESLint) debe bloquear el pipeline si hay errores.
- El stage `Test` debe ejecutar Jest (backend) o Vitest (frontend) y publicar `junit.xml`.
- Publicar coverage HTML con `publishHTML` apuntando a `coverage/lcov-report/index.html`.

## Notas para los integrantes

- Mientras Manuel valida y consolida la instancia Jenkins, mantener las ramas en Stand By.
- Si el trabajo no está avanzado: resetear la rama después de que Manuel suba la configuración.
- Si ya hay tests creados: crear una rama nueva a partir de la rama validada o usar Multibranch para que Jenkins los detecte.

## Validación del `Jenkinsfile`

- El `Jenkinsfile` incluido en la raíz del repo está preparado para:
  - Ejecutar `npm ci` (instalación reproducible).
  - Ejecutar `npm run lint` (ESLint).
  - Ejecutar `npm run build` (TypeScript compile).
  - Ejecutar `npm test` (Jest) y publicar `junit.xml` y coverage HTML.
  - Construir y publicar imagen Docker en `main`.

### Prueba local rápida
- Ejecutar localmente los comandos del Jenkinsfile para validar que no fallan:

```bash
npm ci
npm run lint
npm run build
npm test -- --coverage
```

Si estos pasos funcionan localmente, la transición a Jenkins será más predecible.

---

Si quieres, puedo (1) crear los Multibranch Pipelines vía Job DSL / Jenkins configuration as code (si provees acceso), o (2) preparar los jobs manualmente paso a paso y dejar la documentación lista para que Manuel la aplique.

**Última actualización:** 14/11/2025
