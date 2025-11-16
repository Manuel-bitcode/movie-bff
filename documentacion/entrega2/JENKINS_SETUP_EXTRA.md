# Jenkins: notas adicionales — TimerTrigger y operación

Este archivo complementa `JENKINS_SETUP.md` con información práctica sobre el fallback de escaneo periódico (TimerTrigger), verificación y ejemplos de API para forzar un scan desde PowerShell.

## TimerTrigger (escaneo periódico)

- Script idempotente: `jenkins/init.groovy.d/ensure-periodic-scan.groovy`.
- Propósito: añadir un `TimerTrigger` al job Multibranch si no existe (por defecto `H/5 * * * *`).
- Variables:
  - `MULTIBRANCH_JOB_NAME` (default: `movie-bff-multibranch`)
  - `PERIODIC_SCAN_SPEC` (default: `H/5 * * * *`)

## Verificación rápida

1) Ver logs para ver ejecución del init script:

```powershell
docker-compose logs jenkins --tail 200
```

Busca líneas con `ensure-periodic-scan` o `create-multibranch`.

2) Ver el `config.xml` del job para comprobar triggers:

```powershell
docker exec jenkins-unified cat /var/jenkins_home/jobs/movie-bff-multibranch/config.xml
```

Deberías ver:

```xml
<triggers>
  <hudson.triggers.TimerTrigger>
    <spec>H/5 * * * *</spec>
  </hudson.triggers.TimerTrigger>
</triggers>
```

## Forzar un escaneo (PowerShell ejemplo)

1) Obtener crumb CSRF:

```powershell
$JENKINS = 'http://localhost:8080'
$user = 'admin'
$pass = 'admin123'
$pair = "$user:$pass"
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$crumb = Invoke-RestMethod -Uri "$JENKINS/crumbIssuer/api/json" -Headers @{ Authorization = "Basic $base64" }
```

2) Lanzar indexado (scan) del Multibranch:

```powershell
Invoke-RestMethod -Uri "$JENKINS/job/movie-bff-multibranch/indexing" -Method Post -Headers @{ Authorization = "Basic $base64" ; ($crumb.crumbRequestField) = $crumb.crumb }
```

> Nota: dependiendo de la versión del plugin, el endpoint puede llamarse `/indexing` o `/scan`. Si obtienes 404/403, usa la UI o comprueba la URL exacta desde la interfaz de Jenkins.

## Seguridad



Archivo auxiliar creado: `JENKINS_SETUP_EXTRA.md` — 2025-11-16
## Quick actions added

I added two helper scripts to the `scripts/` folder to make the next steps easier:

- `scripts/apply-git-token-and-restart.ps1`
  - Prompts securely for your GitHub PAT, writes a local `.env` (backups existing `.env`) and restarts the `jenkins` service with `docker-compose` so the init Groovy scripts will create/use credentials.
  - Usage: run from the repo root in PowerShell and paste the token when prompted.

- `scripts/publish-jenkins-setup-comment.ps1`
  - Posts the prepared onboarding comment (stored at `documentacion/entrega2/JENKINS_SETUP_COMMENT.md`) to a target issue or PR using `gh`.
  - Usage example (dry run):
    
    ```powershell
    .\scripts\publish-jenkins-setup-comment.ps1 -TargetNumber 123 -Type pr -DryRun
    ```

Why these are safe:

- `.env` created uses a placeholder for `GIT_TOKEN` and contains a clear warning not to commit it.
- The scripts are simple wrappers around `docker-compose` and `gh` to avoid manual retyping and to keep steps reproducible.

Next steps I recommend you run now (you answered yes to both):

1. From a PowerShell terminal in the repo root, run:

    ```powershell
    .\scripts\apply-git-token-and-restart.ps1
    ```

   Paste your GitHub PAT when prompted.

2. After Jenkins restarts, open Jenkins > `movie-bff-multibranch` and choose "Scan Repository Now". Confirm branches appear.

3. (Optional) Post the onboarding comment to a PR or Issue so the team sees the steps:

    ```powershell
    .\scripts\publish-jenkins-setup-comment.ps1 -TargetNumber <PR-or-Issue-number> -Type pr
    ```

If you want, I can run the publish script for you from here (I need the target PR/issue number and `gh` authentication in this environment). Otherwise run it locally; it uses your local `gh` credentials.
