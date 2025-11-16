Este comentario resume cómo habilitar la instancia unificada de Jenkins para las ramas del backend y qué debe hacer cada desarrollador para ejecutar sus builds en el CI compartido.

Pasos para responsables del repositorio / integradores:

1. Proporcionar un Token de Acceso Personal (PAT) de GitHub con permisos de lectura del repositorio para que Jenkins pueda indexar ramas privadas.
   - Localmente: ejecutar `scripts/apply-git-token-and-restart.ps1` y pegar el PAT cuando se solicite. Esto generará un archivo `.env` local (no lo comitas) y reiniciará Jenkins para que los scripts de init puedan crear/usar las credenciales.
2. Confirmar que `movie-bff-multibranch` existe y que `credentialsId` está establecido en `jobs/movie-bff-multibranch/config.xml`.
3. Forzar un escaneo del repositorio en la UI de Jenkins (Multibranch -> "Scan repository now") o esperar hasta 5 minutos para el escaneo periódico de fallback.
4. Verificar que todas las ramas del backend (feature/integrante3-test-b1, feature/integrante4-test-b2, feature/integrante5-test-b3) aparecen en el job Multibranch y pueden ejecutar builds.
5. Cuando Multibranch gestione todas las ramas, eliminar los jobs por rama (fallback) (`movie-bff-B1`, `movie-bff-B2`, `movie-bff-B3`) para evitar duplicados.

Checklist para desarrolladores (por integrante):

- Asegúrate de que tu rama contiene un `Jenkinsfile` en la raíz del repositorio (o en la ruta que configure el Multibranch).
- Haz push de tu rama y verifica que aparece bajo `movie-bff-multibranch` en Jenkins en unos minutos.
- Si tu rama no aparece, pide al integrador que ejecute:

```powershell
docker exec jenkins-unified cat /var/jenkins_home/jobs/movie-bff-multibranch/config.xml
```

y compruebe `credentialsId` y las traits de descubrimiento de ramas.

Si quieres que publique este mensaje en un PR o Issue, ejecútalo desde la raíz del repo:

```powershell
.\scripts\publish-jenkins-setup-comment.ps1 -TargetNumber <PR-o-issue-number> -Type pr
```

Cuando subas cambios en tu rama: paso a paso (para desarrolladores)

1) Asegura un `Jenkinsfile` válido en la raíz de tu rama
   - El `Jenkinsfile` debe existir en la ruta que el Multibranch usa (normalmente la raíz del repo).
   - Verifica localmente el `Jenkinsfile` (sintaxis básica) antes de hacer push.

2) Haz push de tu rama al remoto
   - Ejemplo: `git push origin feature/tu-rama`

3) ¿Se debe disparar el build automáticamente?
   - Si el repositorio tiene webhooks configurados, Jenkins recibirá la notificación y la Multibranch lanzará el pipeline para tu rama.
   - Si no hay webhook o la notificación falla, espera hasta 5 minutos para el escaneo periódico (configuración por defecto), o pide al integrador que haga "Scan repository now" en `movie-bff-multibranch`.

4) Verifica que tu rama aparece en Jenkins
   - Abre Jenkins → `movie-bff-multibranch` → pestaña "Branches".
   - Si aparece tu rama, Jenkins mostrará el estado del último build.

5) Si no aparece la rama
   - Pide al integrador que compruebe `credentialsId` y las traits de descubrimiento:

```powershell
docker exec jenkins-unified cat /var/jenkins_home/jobs/movie-bff-multibranch/config.xml
```

   - Comprueba que `credentialsId` no esté vacío (si el repo es privado debe estar con el ID creado por los init scripts) y que `BranchDiscoveryTrait` esté habilitada.
   - Si todo está correcto y aún no aparece, solicita al integrador que ejecute "Scan repository now" manualmente.

6) Visualizar logs y artefactos del build
   - En Jenkins, haz clic en la rama dentro de `movie-bff-multibranch`, luego en el número de build para ver la consola de salida (Console Output).
   - Si tu build falla, revisa la salida y corrige el `Jenkinsfile` o los pasos del build; luego haz push de la corrección.

7) Forzar re-ejecución del pipeline
   - Puedes re-run localmente cambiando algo y haciendo push, o pedir al integrador que ejecute un build manual desde la UI (Run) en la entrada de la rama.

8) Modo fallback (temporal)
   - Si por alguna razón la Multibranch no indexa tu rama y necesitas validar rápidamente, hay jobs fallback creados por el integrador (por ejemplo `movie-bff-B1`, `movie-bff-B2`, `movie-bff-B3` o `movie-webapp-F2`).
   - Úsalos únicamente como medida temporal: cuando Multibranch esté funcionando correctamente, esos jobs se deben eliminar para evitar duplicados.

9) Reportar problemas al integrador
   - Indica: número de rama, commit SHA, error de consola (copiar la sección relevante), y si el `credentialsId` parece vacío en `config.xml`.

Si quieres que publique este mensaje en un PR o Issue, ejecútalo desde la raíz del repo:

```powershell
.\scripts\publish-jenkins-setup-comment.ps1 -TargetNumber <PR-o-issue-number> -Type pr
```

Usa `-DryRun` para previsualizar antes de publicar.
This comment summarizes how to enable the unified Jenkins instance for the backend branches and what each developer must do to run their branch builds locally in the shared CI.

Steps for repository owners / integrators:

1. Provide a GitHub Personal Access Token (PAT) with repo read access to the Jenkins instance.
   - Locally: run `scripts/apply-git-token-and-restart.ps1` and paste the PAT when prompted. This writes a local `.env` (do not commit) and restarts Jenkins.
2. Confirm `movie-bff-multibranch` has been created and that the `credentialsId` is set in `jobs/movie-bff-multibranch/config.xml`.
3. Trigger a repository scan in the Jenkins UI (Multibranch -> Scan repository now) or wait up to 5 minutes for the periodic fallback scan.
4. Verify all backend feature branches (feature/integrante3-test-b1, feature/integrante4-test-b2, feature/integrante5-test-b3) appear as branches in the Multibranch job and can build.
5. When Multibranch covers all branches, remove the per-branch fallback jobs (`movie-bff-B1`, `movie-bff-B2`, `movie-bff-B3`) to avoid duplication.

Developer checklist (for each integrant):

- Ensure your branch contains a `Jenkinsfile` at repository root or the path defined by the Multibranch scan.
- Push your branch and verify it appears under `movie-bff-multibranch` in Jenkins within a few minutes.
- If your branch doesn't show, ask the integrator to run `docker exec jenkins-unified cat /var/jenkins_home/jobs/movie-bff-multibranch/config.xml` and check `GIT_CREDENTIALS` and branch discovery traits.

If you want me to post this message to a PR or Issue, run: `scripts/publish-jenkins-setup-comment.ps1 -TargetNumber <PR-or-issue-number> -Type pr` (or `-Type issue`) from the repo root. Use `-DryRun` to preview.
