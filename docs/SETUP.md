# Team Setup

## Install once

Each teammate needs:

1. Git
2. Docker Desktop with Docker Compose v2
3. VS Code (recommended)

Node and Python are optional on the host because the containers provide Node 20 and Python 3.12.

On Windows, enable WSL 2 integration in Docker Desktop. Keep the repository in the WSL filesystem for faster bind mounts when developing from WSL.

## Clone and start

```bash
git clone <YOUR_REPOSITORY_URL>
cd gridmitra
cp .env.example .env
docker compose up --build
```

PowerShell:

```powershell
git clone <YOUR_REPOSITORY_URL>
Set-Location gridmitra
Copy-Item .env.example .env
docker compose up --build
```

Alternatively run `./scripts/setup.sh` or `./scripts/setup.ps1` from the repository root.

This repository uses `compose.yaml` as the single Docker Compose configuration file; there is no `docker-compose.yml`.

## Verify

```bash
docker compose ps
curl http://localhost:8000/api/v1/health
docker compose exec backend pytest
docker compose exec frontend npm run typecheck
```

Expected service URLs:

- http://localhost:5173
- http://localhost:8000/docs
- http://localhost:8000/api/v1/health

## Environment rules

- `.env.example` contains safe local defaults and documents every variable.
- `.env` is ignored and belongs to one machine only.
- For hosted Supabase, set `DATABASE_URL` only in the backend host.
- Never place a database password, Supabase secret/service-role key, or weather API secret in a `VITE_` variable.

## Common fixes

| Problem | Fix |
| --- | --- |
| Docker command not found | Install/start Docker Desktop and reopen the terminal. |
| Port 5432 already used | Stop another PostgreSQL service or change the host-side port in `compose.yaml`. |
| Old dependency state | `docker compose build --no-cache frontend backend` |
| Database schema did not rerun | For disposable local data only: `docker compose down -v`, then start again. This deletes the local database volume. |
| Frontend cannot call API | Confirm `VITE_API_URL=http://localhost:8000` and backend health. |

## Hosted deployment database

Local development uses PostgreSQL 17. Hosted deployment uses Supabase PostgreSQL with the same migrations.

1. Create one Supabase project owned by the team lead.
2. Put its pooled/direct server connection string in the backend deployment secrets.
3. Apply the reviewed schema through a migration workflow.
4. Keep `gridmitra` private from the Data API, or add explicit grants plus RLS before exposing anything.
5. Do not give service credentials to the frontend.

The application must continue its core optimization workflow if saving a run fails; persistence is never a prerequisite for returning calculated results.
