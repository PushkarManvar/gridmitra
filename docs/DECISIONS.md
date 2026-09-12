# GridMitra Technical Decisions

## Decision 001 Modular Monolith

### Decision

Use one React frontend, one FastAPI backend, one pure Python optimizer module and one PostgreSQL database.

### Reason

A three-member team can develop and integrate this architecture within a 30-hour hackathon without the operational overhead of microservices.

### Consequence

Internal module boundaries must remain clear even though the backend is deployed as one service.

## Decision 002 Mixed-Integer Optimization

### Decision

Use PuLP with CBC to implement a mixed-integer linear program.

### Reason

The problem is constrained energy allocation. A binary variable is used to prevent simultaneous battery charging and discharging.

### Consequence

The project describes the engine as optimization-based intelligence rather than a trained machine-learning model.

## Decision 003 Reliability Priority

### Decision

Use the priority order:

```text
P1 unserved load > terminal reserve shortfall > P2 > P3 > P4
```

### Reason

Current critical services must not be interrupted only to preserve an end-of-horizon battery target.

### Consequence

Safety penalties remain backend-controlled and are not editable through the frontend.

## Decision 004 Soft Terminal Reserve

### Decision

Represent terminal reserve miss with a non-negative penalized shortfall variable.

### Reason

Stress scenarios should return an explainable emergency plan instead of becoming infeasible only because the reserve target cannot be reached.

### Consequence

The API and UI must report reserve shortfall explicitly.

## Decision 005 Prepared Data First

### Decision

Use committed representative 24-hour data as the primary judge-demo path. Treat live weather as optional.

### Reason

The core optimization demonstration must remain reproducible without internet or API availability.

### Consequence

All prepared data is labelled as simulated unless it comes from a cited source.

## Decision 006 Database Environments

### Decision

Use PostgreSQL 17 in local Docker development and Supabase PostgreSQL for hosted persistence when enabled.

### Reason

This provides fast local setup and a practical hosted path while preserving standard PostgreSQL migrations.

### Consequence

FastAPI owns database access and the optimizer remains database-independent.

## Decision 007 Reactive Baseline

### Decision

Use a renewable-first, battery-next, diesel-next reactive baseline that makes decisions without future planning.

### Reason

The baseline is reproducible, uses the same equipment limits and isolates the value of 24-hour planning.

### Consequence

The baseline must not be described as diesel-first.

## Decision 008 Result Export

### Decision

Require CSV export. Keep PDF export and saved history optional until the core workflow is stable.

### Reason

CSV is fast to implement and preserves all hourly evidence. PDF generation is useful but not necessary to prove the optimizer.

### Consequence

CSV can be generated from the current API response even when database persistence is unavailable.

## Decision 009 Frontend Visualization

### Decision

Use Apache ECharts as the single charting library.

### Reason

One library prevents duplicated patterns and supports dispatch, SOC and comparison charts.

### Consequence

Recharts is not included unless this decision is intentionally revised.

## Decision 010 Local-Only Database for the Hackathon

### Decision

Use local PostgreSQL 17 (Docker Compose) as the only database through the hackathon. Do not provision hosted Supabase before the demo.

### Reason

The demo must run offline from prepared data. A hosted database adds credentials, provisioning time and an internet failure point for no judging benefit. The migrations already run unchanged on either environment, so hosting can be adopted later without rework.

### Consequence

- No Supabase project is required for the MVP.
- `db/migrations/` stays the single source of truth for both local and any future hosted environment.
- If hosted Supabase is used later, `gridmitra` stays private from the Data API unless grants and RLS are added and tested.

## Decision 011 Multi-User Ownership

### Decision

GridMitra is genuinely multi-user: each user owns their own sites and scenarios. Ownership is part of the database schema from the start.

### Reason

Operators need to keep their own communities and scenario drafts separate. Adding ownership later would force a data migration and re-architecting of every query.

### Consequence

`users`, `sites.owner_id` and `scenarios.owner_id` are created in migration 002. Every write is authorized against the owning user.

## Decision 012 Session-Cookie Authentication

### Decision

Use FastAPI/PostgreSQL-owned accounts with passwords hashed by Argon2, and a session identifier in an `httpOnly`, `Secure`, `SameSite=Lax` cookie. No tokens in `localStorage`.

### Reason

The demo must work offline, so a hosted-only auth provider is unsuitable. Cookie sessions are simple, secure against XSS, and work with the existing local stack.

### Consequence

Sessions are stored server-side (`gridmitra.sessions`). Authorization is enforced by FastAPI on every write. A prepared local demo account lets the jury demo work offline with one click.

## Decision 013 Immutable Run Snapshots

### Decision

Every optimization result is stored as an immutable snapshot (`input_snapshot`, `summary`, `dispatch_hours`, `explanations`) that is never rewritten when its source scenario is edited.

### Reason

Editing a scenario must not silently change a historical run; past results stay reproducible.

### Consequence

Runs keep a self-contained snapshot. Historical viewers render from `input_snapshot`, never from current inputs.

## Decision 014 Editable Inputs, Immutable Outputs

### Decision

Users may edit scenario inputs (site metadata, assets, operating policy, all 24 hourly renewable/demand values, weather source). Optimizer outputs (dispatch, KPIs, reliability, explanations, warnings) are never user-editable.

### Reason

The optimizer is the source of truth for results; allowing manual edits would break the calculated-result guarantee and the demo's honesty rule.

### Consequence

The scenario editor writes inputs only. Validation happens before every optimization. Safety penalty values stay backend-controlled.

## Decision 015 Firebase Auth (replaces 012)

### Decision

Use **Firebase Auth** instead of the FastAPI/PostgreSQL session-cookie accounts described in Decision 012. The manual auth implementation (Argon2, users/sessions, cookie) has been removed.

### Reason

Firebase Auth provides a fast, maintained identity layer (Google sign-in, email/password) with hosted UI, which the team prefers over hand-rolled sessions. The core demo remains offline until a Firebase project is configured.

### Consequence

- Until Firebase is wired, the API is open (no auth gate) and all runs/scenarios are owned by the seeded demo operator.
- A Firebase ID token will be verified per request once integrated; ownership maps to the Firebase user id.
- Decision 011 (multi-user ownership) stays — the `owner_id` columns remain and will be populated from Firebase.

## Decision Change Format

When changing a decision, append a new section containing:

- Date
- Previous decision
- New decision
- Reason
- Files and contracts affected

Do not silently rewrite a decision after implementation depends on it.

