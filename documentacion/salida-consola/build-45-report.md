# Build 45 — Quick CI report

Date: 2025-11-17
Branch: feature/integrante3-test-b1
Commit: 927452f978f4e606c35744abcc8240f34592e350
Result: SUCCESS (Build: 45)

Summary:
- Tests executed inside docker-compose (preferred mode) and passed: 1 test suite, 10 tests (all passed).
- The pipeline used `scripts/ci/run-tests-ci.sh` with a per-build compose project name (moviebff_ci_45) and a cleanup trap.
- Docker CLI is not present on the Jenkins agent; Docker image build step was skipped (handled gracefully).
- Coverage HTML was not published (coverage report not found), but jest tests ran successfully and JUnit results were recorded.

What changed to fix the regression:
- Restored per-build compose project naming (COMPOSE_PROJECT_NAME) and `-p` usage in `scripts/ci/run-tests-ci.sh`.
- Added a trap to ensure `docker-compose -p <project> ... down --remove-orphans` runs on exit to avoid stale containers/networks.

Next recommended actions (short):
1. Decide whether CI fixes (Jenkinsfile + `scripts/ci/*`) should be merged into `main` as the canonical CI behavior.
2. Protect `main` with a required CI status check so merges must pass the pipeline.
3. Keep feature branches for development and testing; cherry-pick or PR ci-fix commits into them when needed.
4. Consider mapping `coverage` and `junit.xml` to a path visible to Jenkins (or write them directly to workspace) if publishHTML still skips the report.

Report generated automatically by the CI maintenance task.
