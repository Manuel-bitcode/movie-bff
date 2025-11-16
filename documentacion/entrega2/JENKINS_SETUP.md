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

## Fallback: escaneo periódico (TimerTrigger)

Si no tienes permisos para crear webhooks en GitHub, Jenkins puede usar un `TimerTrigger` a nivel del job Multibranch para realizar branch-scan periódicos. En este repositorio se incluyó un init script idempotente `jenkins/init.groovy.d/ensure-periodic-scan.groovy` que hace exactamente eso: si el job multibranch existe y no tiene un `TimerTrigger`, lo añade con la expresión por defecto `H/5 * * * *`.

Detalles rápidos:

- Script: `jenkins/init.groovy.d/ensure-periodic-scan.groovy` (idempotente)
- Variable opcional: `PERIODIC_SCAN_SPEC` — expresión cron (por defecto `H/5 * * * *`).
- Variable opcional: `MULTIBRANCH_JOB_NAME` — nombre del job (por defecto `movie-bff-multibranch`).

Cómo verificar que el trigger está aplicado:

```powershell
docker exec jenkins-unified cat /var/jenkins_home/jobs/movie-bff-multibranch/config.xml
```

Busca la sección `<triggers>` y verifica que contenga:

```xml
<triggers>
  <hudson.triggers.TimerTrigger>
    <spec>H/5 * * * *</spec>
  </hudson.triggers.TimerTrigger>
</triggers>
```

## Cómo forzar un escaneo desde API (PowerShell ejemplo)

1) Obtener crumb CSRF:

```powershell
$JENKINS = 'http://localhost:8080'
$user = 'admin'
$pass = 'admin123'
$pair = "${user}:${pass}"
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$crumb = Invoke-RestMethod -Uri "$JENKINS/crumbIssuer/api/json" -Headers @{ Authorization = "Basic $base64" }
```

2) Lanzar el Indexing (scan) del Multibranch:

```powershell
Invoke-RestMethod -Uri "$JENKINS/job/movie-bff-multibranch/indexing" -Method Post -Headers @{ Authorization = "Basic $base64" ; ($crumb.crumbRequestField) = $crumb.crumb }
```

Nota: dependiendo de la versión del plugin, el endpoint puede llamarse `/indexing` o `/scan`. Si obtienes 404/403, usa la UI `Scan Repository Now`.

## Guía rápida para desarrolladores — probar su pipeline (sin webhook, usando periodic scan)

1) Crear y pushear una rama de prueba:

```bash
git checkout -b feature/mi-cambio
git push -u origin feature/mi-cambio
```

2) Esperar el escaneo periódico (por defecto ~5 minutos). Si necesitas forzar ahora mismo, desde la UI de Jenkins:

- Abrir `movie-bff-multibranch` → botón "Scan Repository Now".

O usando la API (PowerShell) con crumb (ver sección anterior).

3) Abrir Jenkins → `movie-bff-multibranch` → buscar la nueva rama en la lista de branches y abrir su pipeline.

4) Revisar stages: Lint → Test → Build. Si `Lint` falla, corregir localmente y pushear de nuevo.

5) Abrir artefactos / reports: `junit.xml` y coverage en `coverage/lcov-report/index.html` si el pipeline los publica.

## Buenas prácticas y notas finales

- Mantén tus tokens en el gestor de credenciales de Jenkins o variables de entorno, nunca en el repo.
- Si quieres builds inmediatos en cada push, coordina con el propietario del repo para añadir webhooks a `http://<JENKINS_HOST>/github-webhook/`.

Si quieres, puedo (1) crear los Multibranch Pipelines vía Job DSL / Jenkins configuration as code (si provees acceso), o (2) preparar los jobs manualmente paso a paso y dejar la documentación lista para que Manuel la aplique.

**Última actualización:** 2025-11-16

## Configuración recomendada para usar Multibranch (pasos aplicables ahora)

1) Crear un fichero de variables de entorno en la raíz del repo llamado `.env` (puedes copiar `.env.template`). Rellenar `GIT_TOKEN` con un Personal Access Token que tenga permisos de lectura del repo y, si quieres, crear webhooks (`repo`, `admin:repo_hook`).

2) Construir y levantar sólo el servicio Jenkins (usa build la primera vez):

```powershell
docker-compose up -d --build jenkins
```

3) Verificar que Jenkins creó/antiañadió las credenciales y que el Multibranch usa `credentialsId`:

```powershell
docker exec jenkins-unified cat /var/jenkins_home/jobs/movie-bff-multibranch/config.xml | Select-String -Pattern "credentialsId|scm"
```

Deberías ver la entrada `credentialsId` con el id definido en `docker-compose.yml` (por defecto `github-token`). Si sigue vacío, revisa que `GIT_TOKEN` esté presente en el `.env` y reinicia el servicio.

4) Una vez el Multibranch indexe correctamente las ramas, elimina los jobs fallback (si existen) para evitar duplicación. Hay un script de conveniencia en `scripts/remove-jenkins-fallback-jobs.ps1` que elimina las carpetas de job y reinicia Jenkins.

5) Opcional: configura webhooks en GitHub para que cada push active el scan inmediato (recomendado). Mantén `ensure-periodic-scan.groovy` como fallback.

---

## Scripts útiles añadidos

- `scripts/remove-jenkins-fallback-jobs.ps1` — elimina los jobs por rama fallback (movie-bff-B1/B2/B3, movie-webapp-F2) del `JENKINS_HOME` y reinicia el contenedor Jenkins. Úsalo sólo después de confirmar que Multibranch funciona.

---
