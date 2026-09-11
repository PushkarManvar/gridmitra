# GridMitra Agent Instructions

Read `docs/AGENTS.md` first — it is the authoritative, complete instruction set for this repository and supersedes this file. `docs/TASK_BOARD_BACKEND.md` is the backend/data task list; every task cites its authoritative doc section and has a cross-check.

## Authority order

1. `docs/PROJECT_SCOPE.md`
2. `docs/DECISIONS.md`
3. `docs/OPTIMIZATION_MODEL.md`
4. `docs/DATA_CONTRACT.md`
5. `docs/API_CONTRACT.md`
6. `docs/ARCHITECTURE.md`
7. Feature-specific documentation (`docs/FRONTEND_FLOW.md`, `docs/DATABASE.md`, `docs/TEST_PLAN.md`, `docs/DEMO_RUNBOOK.md`)

If documents conflict, stop and update the higher-authority document before implementing.

## Critical rules (detail in `docs/AGENTS.md`)

- Optimization is a PuLP **mixed-integer** program solved with CBC. This is optimization, not ML.
- Load priorities are **P1–P4**. Penalty order is **P1 > terminal reserve shortfall > P2 > P3 > P4** (Decision 003).
- Terminal reserve is a **soft** constraint with a penalized `reserve_shortfall_kwh >= 0`; always report and explain any shortfall.
- The optimizer is pure Python: no React, FastAPI, or database access.
- Frontend never computes official KPIs; it displays calculated backend results.
- Public statuses are `optimal | emergency_plan | failed`. CSV export is required; PDF/history are optional.
- Prepared `data/demo_scenario.json` is the primary judge path; live weather is optional with fallback.
- Work on feature branches; never merge failing CI; never force-push `main`; never commit `.env`.

## Definition of done

A change is done when it is scoped, typed, tested, documented when behavior changes, and works through Docker Compose. Contract changes update `DATA_CONTRACT.md`, `API_CONTRACT.md`, backend schemas, frontend types, fixtures, and tests in the same pull request. Do not merge code that breaks the prepared demo scenario.

## Current migration state

The codebase is being migrated from the starter 2-tier model to the P1–P4 target contract. The known gaps and their fixes are tracked in the conflict log at the bottom of `docs/TASK_BOARD_BACKEND.md`. Do not implement a behavior that contradicts the target docs to match old code; follow the docs.