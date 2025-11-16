#!/usr/bin/env bash
set -euo pipefail

FORCE=0
while [[ $# -gt 0 ]]; do
  case $1 in
    -f|--force) FORCE=1; shift ;;
    -h|--help) echo "Usage: cleanup-docker-containers.sh [--force]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

echo "== Cleanup Docker resources related to 'movie-bff' =="

containers=$(docker ps -a --filter "name=movie-bff" --format '{{.ID}} {{.Names}} {{.Image}}')
if [ -z "$containers" ]; then
  echo "No containers found with 'movie-bff' in the name."
else
  echo "Found containers:"
  echo "$containers"
  if [ $FORCE -eq 1 ]; then
    echo "Removing containers (forced)..."
    ids=$(docker ps -a --filter "name=movie-bff" --format '{{.ID}}')
    if [ -n "$ids" ]; then
      docker rm -f $ids || true
    fi
  else
    read -p "Do you want to remove these containers? (y/N) " confirm
    if [[ "$confirm" =~ ^[yY] ]]; then
      ids=$(docker ps -a --filter "name=movie-bff" --format '{{.ID}}')
      if [ -n "$ids" ]; then
        docker rm -f $ids || true
      fi
    else
      echo "No containers removed."
    fi
  fi
fi

# Volumes that may be related
echo "\n-- Candidate volumes --"
vols=$(docker volume ls --format '{{.Name}}' | grep -E 'movie|moviebff' || true)
if [ -z "$vols" ]; then
  echo "No related volumes found."
else
  echo "$vols"
  if [ $FORCE -eq 1 ]; then
    echo "Removing volumes..."
    echo "$vols" | xargs -r docker volume rm -f || true
  else
    read -p "Do you want to remove these volumes? (y/N) " confirmv
    if [[ "$confirmv" =~ ^[yY] ]]; then
      echo "$vols" | xargs -r docker volume rm -f || true
    else
      echo "No volumes removed."
    fi
  fi
fi

echo "\nCleanup finished."