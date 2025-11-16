Cleanup scripts for Docker resources related to this project

Location:
  scripts/ci/cleanup-docker-containers.ps1  -> PowerShell (Windows / admin)
  scripts/ci/cleanup-docker-containers.sh   -> POSIX shell (Linux runners)

Purpose:
  These helper scripts list docker containers and volumes that likely belong
  to the project (they match names containing 'movie-bff' or 'movie'). They
  can remove them interactively or in forced mode. They are intended to be
  run by the admin of the Docker host / Jenkins runner when stale containers
  or ports are blocking new CI runs.

Usage (POSIX):
  # list only
  ./scripts/ci/cleanup-docker-containers.sh

  # force removal (non-interactive)
  ./scripts/ci/cleanup-docker-containers.sh --force

Usage (PowerShell):
  # list only
  .\scripts\ci\cleanup-docker-containers.ps1

  # force removal (non-interactive)
  .\scripts\ci\cleanup-docker-containers.ps1 -Force

Notes:
  - Run these scripts on the Docker host (or a user with permission to manage
    containers/volumes). If your Jenkins agents use a remote Docker daemon,
    run it there.
  - Be careful: removing volumes deletes data. Only remove volumes when you
    are sure they are safe to delete (e.g., CI ephemeral volumes).
  - The scripts intentionally use conservative matching and prompt by default.
