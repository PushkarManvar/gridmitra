#!/usr/bin/env sh
set -eu

if ! command -v git >/dev/null 2>&1; then
  echo "Git is required: https://git-scm.com/downloads"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is required: https://docs.docker.com/desktop/"
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose v2 is required. Update Docker Desktop."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

docker compose config >/dev/null
docker compose up --build -d
docker compose ps

echo "GridMitra is starting at http://localhost:5173"
