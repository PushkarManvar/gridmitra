# GridMitra Agent Instructions

## Project Goal

Build a reliable, explainable 24-hour microgrid dispatch decision-support prototype for one off-grid community.

## Read Before Editing

Use this authority order:

1. `docs/PROJECT_SCOPE.md`
2. `docs/DECISIONS.md`
3. `docs/OPTIMIZATION_MODEL.md`
4. `docs/DATA_CONTRACT.md`
5. `docs/API_CONTRACT.md`
6. `docs/ARCHITECTURE.md`
7. Feature-specific documentation

If documents conflict, stop and update the higher-authority document before implementing the conflicting behaviour.

## Architecture Boundaries

- React owns presentation and user interaction.
- FastAPI routes translate HTTP requests and responses.
- Services coordinate validation, baseline, optimizer, metrics, explanations and persistence.
- The optimizer is pure Python and has no React, FastAPI or database dependency.
- Repository modules own PostgreSQL and Supabase access.
- Prepared scenario files live only in root `data/`.
- Frontend charts display API results and do not calculate official KPIs.

## Optimization Rules

- Use 24 one-hour intervals.
- Use kWh for interval energy and kW for capacity.
- Use energy-balance equality.
- Respect renewable, battery and diesel limits.
- Prevent simultaneous battery charging and discharging.
- Use explicit unserved variables for P1-P4.
- Use a penalized soft terminal reserve shortfall.
- Preserve the priority order:

```text
P1 unserved load > terminal reserve shortfall > P2 > P3 > P4
```

- Do not expose safety penalties to the frontend.
- Check solver status before reading variables.
- Never replace calculated output with hard-coded results.

## API and Contract Rules

- JSON fields use `snake_case`.
- TypeScript types and Pydantic schemas follow `docs/DATA_CONTRACT.md`.
- Public API behaviour follows `docs/API_CONTRACT.md`.
- A contract change must update documentation, backend schemas, frontend types, fixtures and tests in one pull request.
- Use `optimal`, `emergency_plan` and `failed` as public statuses.
- Database-save failure returns a valid calculated result with a warning.

## Frontend Rules

- Use React, TypeScript, Tailwind CSS and Apache ECharts.
- Display units on fields, KPIs and chart tooltips.
- Support loading, validation, optimal, emergency, solver-failure and persistence-failure states.
- Display P1 unmet energy and reserve shortfall prominently.
- Label simulated results as estimates.
- Do not imply direct equipment control.
- Keep the prepared demo path usable without live weather.

## Database and Security Rules

- Local development uses PostgreSQL 17.
- Hosted persistence may use Supabase PostgreSQL with the same migrations.
- Keep the `gridmitra` schema private from browser access unless grants and RLS are added and tested.
- Never expose a database password or service-role key to the frontend.
- Never commit `.env` files or real credentials.
- Use migrations for schema changes.

## Testing Requirements

Before completing a change:

- Run affected unit tests.
- Run backend contract tests for API or schema changes.
- Run frontend type checking for TypeScript changes.
- Verify prepared demo data remains valid.
- Add a regression test for every bug fix.
- Use the shared numerical tolerance from `OPTIMIZATION_MODEL.md`.

Before merging optimization changes, verify:

- Hourly energy balance
- Battery hard bounds
- No simultaneous charging and discharging
- Diesel capacity
- P1 priority
- Reserve-shortfall behaviour

## Git Rules

- Work on short feature branches.
- Keep commits scoped.
- Do not force-push `main`.
- Do not merge failing required checks.
- Update affected documentation in the same pull request as behavioural changes.

## Scope Protection

Do not add these before the core demo passes:

- Direct hardware control
- A custom trained forecasting model
- Multi-microgrid coordination
- Advanced generator dynamics
- Advanced battery chemistry
- Complex authentication
- PDF generation

CSV export is required. PDF export and saved history are optional.

## Completion Report

When completing a task, report:

1. Files changed
2. Behaviour implemented
3. Tests run and their results
4. Remaining limitations
5. Any contract or documentation changes

