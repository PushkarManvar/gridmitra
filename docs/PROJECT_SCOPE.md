# Project Scope

Authoritative statement of what GridMitra is, who it serves, and what is in and out of scope for the HackOut'26 MVP. This file is the first document in the source-of-truth hierarchy. `docs/PROJECT_CONTEXT.md` is a lightweight summary and must not contradict this file.

## Problem

Rural and off-grid communities often rely on diesel generation, which is expensive and carbon-intensive, while small solar, wind, and battery installations go underused. GridMitra recommends the best hourly combination of solar, wind, battery, and diesel to cut cost and emissions while protecting critical loads.

## Target users

- Microgrid operators and technicians
- Rural electrification agencies and NGOs
- Off-grid community project planners

## Product position

GridMitra is an explainable decision-support simulator for a 24-hour operating horizon. It recommends a dispatch plan; it does **not** control physical equipment, switch generators, or send commands to hardware. All outputs are estimates and recommendations, never field-validated control results.

## MVP scope (built)

The starter repository implements a working, tested, offline-capable MVP:

- 24-hour dispatch optimization using a transparent PuLP mixed-integer linear program (MILP) solved with CBC.
- Energy sources: solar, wind, battery discharge, and diesel.
- Battery state-of-charge model with charge and discharge efficiency, hard min/max SOC bounds, and charge/discharge power limits enforced by a binary operating-mode variable (no simultaneous charge and discharge).
- Load tiers: **critical** (priority P1) and **flexible** (aggregated P2/P3/P4). Critical load carries a much higher unserved-energy penalty, so flexible load is shed first. The MVP **curtails** flexible load; it does not shift load across hours.
- Unserved-energy variables for critical and flexible load keep extreme scenarios solvable instead of infeasible.
- Soft terminal reserve constraint with an explicit `reserve_shortfall_kwh` output; a reserve miss is reported and explained, never a solver failure.
- Objective: diesel fuel cost + carbon cost + battery throughput wear + unserved-load penalties + reserve-shortfall penalty.
- KPIs: operating cost, CO₂, diesel energy, renewable use and share, unserved critical/flexible energy, reserve shortfall, final SOC.
- Rule-generated plain-language explanations for every run.
- Prepared 24-hour demo scenario (`data/demo_scenario.json`) served offline by `GET /api/v1/scenarios/demo`.
- API endpoints: health, demo scenario, optimize.
- Frontend: React + TypeScript + Tailwind dashboard with dispatch, SOC, and KPI charts.
- Local PostgreSQL 17 schema (`gridmitra`) with scenario and run tables.
- CI (GitHub Actions) plus a passing backend test suite and a passing frontend lint, typecheck, and build.

## Planned enhancements (next iterations)

1. **Load-priority granularity** — split flexible load into P2/P3/P4 tiers with monotonically decreasing penalties, so P4 is curtailed first, then P3, then P2, and P1 only under physical shortage. Load shifting is a future enhancement and is never calculated in the MVP optimizer.
2. **Reactive baseline** — greedy no-lookahead dispatch of the same inputs (use available renewable, then battery, then diesel, shed P4→P1) to demonstrate baseline-versus-GridMitra improvement without hard-coded numbers.
3. **Scenario lab** — solar/demand/diesel-price/battery multipliers with a re-optimize action and side-by-side comparison.
4. **CSV export and optional run history** — CSV export of a result is **required**. PDF export and saved-run history in PostgreSQL/Supabase are optional if time permits.
5. **Live weather fetch** — optional, cached, always with prepared-data fallback so the demo never depends on the internet.

## Phase B direction (post-demo, decisions 011–014)

The demo (`jury-demo-v2`) is frozen. Phase B turns GridMitra into a multi-user product:

- **Multi-user ownership** — users own their sites and scenarios (Decision 011).
- **Session-cookie authentication** — FastAPI/PostgreSQL accounts, Argon2, httpOnly session cookie; a prepared demo account keeps the jury demo offline and one-click (Decision 012).
- **Immutable run snapshots** — results are never rewritten by scenario edits (Decision 013).
- **Editable inputs, immutable outputs** — full scenario editor for inputs; optimizer results stay read-only (Decision 014).
- **Scenario CRUD + versions** — draft → validate → save version → run.
- **New UX** — 4-block hour explanations, weather preview/apply flow, `/app/*` routes, responsive bottom nav, landing + about pages.

The frozen demo remains the offline judging path throughout.

## Non-goals for the MVP

- Direct hardware control, SCADA integration, or automatic generator switching.
- Real-time IoT telemetry or autonomous operation.
- Multi-day or probabilistic forecasting.
- Machine-learning dispatch models; the MILP is the dispatch engine.
- Production-grade authentication (SSO, 2FA, large-scale tenant isolation). Basic multi-user auth and ownership are Phase B scope (Decision 011–012).
- Coordination across multiple microgrids.
- Complex diesel modeling (startup cost, minimum run time, non-linear fuel curves).
- Pretending simulated savings are field-validated results.

## Assumptions

- One-hour time steps over a fixed 24-hour horizon.
- Solar and wind availability are known inputs (prepared data or forecast).
- Loads are known and described by tier.
- No transmission or distribution losses; no grid import/export in the MVP.
- Diesel output is variable between zero and rated capacity at constant per-kWh cost and emissions.
- Battery operates as a single aggregated storage unit.

## Success criteria

- The prepared demo scenario solves and renders offline after dependencies and images are installed.
- An extreme scenario returns a plan with unmet load and/or reserve shortfall, plus warnings — never an infeasible blank screen.
- Every hourly energy balance holds within floating-point tolerance.
- SOC never violates configured hard bounds.
- The response clearly distinguishes simulated estimates from measured results.
- Core demo flow works end to end: load preset → run optimizer → show dispatch → explain decisions → change scenario → re-optimize → compare baseline → export.

## MVP priority

> Load preset → run real optimizer → show dispatch → explain decisions → change scenario → re-optimize → compare baseline → export the recommendation as CSV.

Approval, saved history, and PDF export may be added only after the core workflow is stable. Anything outside this flow is secondary and must not jeopardize it.

## Definition of done

A change is done when it is scoped, typed, tested, documented when behavior changes, and works through Docker Compose, and it does not break the prepared demo scenario. For the run workflow, done means the plan can be exported as CSV; saving or approving the plan is required only when persistence is implemented.