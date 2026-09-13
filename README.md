# GridMitra

GridMitra is a reliability-first microgrid energy mix optimizer for off-grid communities. It recommends a transparent 24-hour dispatch plan across solar, optional wind, battery storage and diesel backup while protecting critical community services.

GridMitra is an operator decision-support prototype. It does not directly control physical equipment.

> **Note:** the app requires sign-in with Firebase Authentication (Google or email/password). See [Firebase setup](#firebase-setup) below.

## Core Demo

```text
Sign in
→ load prepared community
→ review demand and renewable availability
→ run 24-hour optimization
→ inspect dispatch and battery behaviour
→ explain an important decision
→ apply a stress scenario
→ re-optimize and compare
→ export CSV
```

## Technology

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Charts | Apache ECharts |
| Backend | Python 3.12, FastAPI |
| Optimization | PuLP, CBC |
| Processing | Pandas, NumPy |
| Local database | PostgreSQL 17 |
| Hosted persistence | Supabase PostgreSQL |
| Development environment | Docker Compose |

## Architecture

```text
React frontend
→ FastAPI routes
→ validation and services
→ PuLP/CBC optimizer
→ metrics and explanations
→ optional PostgreSQL persistence
```

Prepared JSON is the primary demo input. Live weather integration is optional and must have a prepared-data fallback.

## Repository Structure

```text
gridmitra/
├── frontend/
├── backend/
├── data/
│   └── demo_scenario.json
├── db/
├── firebase/
│   └── serviceAccountKey.json   (gitignored — drop your Firebase key here)
├── docs/
├── scripts/
├── .github/
├── compose.yaml
└── .env.example
```

## Quick Start

Requirements:

- Git
- Docker Desktop with Docker Compose v2

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

Open:

- Frontend: `http://localhost:5173`
- API documentation: `http://localhost:8000/docs`
- Health endpoint: `http://localhost:8000/api/v1/health`

## Firebase Setup

The app authenticates with Firebase (Google or email/password). Two pieces:

1. **Frontend config** — already baked into `frontend/src/lib/firebase.ts` for the
   `gridmitra` project. To use a different project, set the `VITE_FIREBASE_*`
   variables in `.env`.
2. **Backend verification** — drop your Firebase service-account private key at
   `firebase/serviceAccountKey.json`. The backend auto-detects it (mounted at
   `/firebase/serviceAccountKey.json`) and verifies ID tokens on every request.
   Without the key, requests fall back to the shared demo owner. See
   `firebase/README.md` for the full steps.

Before first sign-in, enable **Google** and **Email/Password** providers and add
`localhost` to the **Authorized domains** in the Firebase console
(Authentication → Settings).

## Verification

```bash
docker compose ps
docker compose exec backend pytest
docker compose exec frontend npm run typecheck
```

## Documentation

Read in this order:

1. `docs/PROJECT_SCOPE.md`
2. `docs/DECISIONS.md`
3. `docs/OPTIMIZATION_MODEL.md`
4. `docs/DATA_CONTRACT.md`
5. `docs/API_CONTRACT.md`
6. `docs/ARCHITECTURE.md`
7. `docs/FRONTEND_FLOW.md`
8. `docs/DATABASE.md`
9. `docs/TEST_PLAN.md`
10. `docs/DEMO_RUNBOOK.md`
11. `docs/TEAM_WORKFLOW.md`
12. `docs/TASK_BOARD.md`

## Non-Negotiable Rules

- Frontend code never implements official optimization or KPI calculations.
- Optimizer code never accesses React, FastAPI or the database.
- P1 load is more important than terminal reserve.
- Prepared inputs are allowed; prepared optimization results are not.
- Emergency plans display unmet load and reserve shortfall honestly.
- Simulated values are labelled as estimates.
- Database failure cannot erase a successfully calculated plan.
- No secret may be committed or placed in a `VITE_` environment variable.

## MVP Scope

Required:

- Prepared 24-hour scenario
- Reactive no-lookahead baseline
- GridMitra MILP result
- P1-P4 prioritization
- Battery safety limits
- Soft terminal reserve
- Cost, diesel, CO2, renewable and reliability metrics
- Dispatch and battery charts
- Scenario re-optimization
- Plain-language explanations
- CSV export

Optional after the core workflow passes:

- Live weather data
- Saved run history
- PDF export
- Comparison of several saved scenarios

## Create the GitHub remote

After cloning or initializing the repository:

```bash
git init
git add .
git commit -m "chore: initialize GridMitra monorepo"
git branch -M main
git remote add origin https://github.com/<OWNER>/gridmitra.git
git push -u origin main
```

Create the empty private GitHub repository first and do not add a GitHub-generated README or `.gitignore`, because both are already included here. See `docs/GITHUB_SETUP.md` for the full setup order.

## Release

The demonstrated builds are tagged:

```text
jury-demo-v1
jury-demo-v2
```

Only create a new tag after the release gate in `docs/TEST_PLAN.md` passes.