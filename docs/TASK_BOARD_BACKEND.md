# Backend + Data Task Board (PushkarManvar & Bella)

Pair board for the backend/data track. Every task is tied to an authoritative doc section. Use this loop:

1. Implement the task.
2. Run the listed verification.
3. Tick `[x]` and push.
4. Partner **cross-checks** against the cited doc section and ticks the cross-check box.

Owner tags: `P` = PushkarManvar, `B` = Bella. Primary owner implements; the other cross-checks. Cross-check = re-read the cited doc section and confirm the code/tests match it, not a rubber stamp.

Cross-check rule (from `docs/TEAM_WORKFLOW.md`): any contract or model change updates the relevant docs in the **same pull request**, and CI must be green before merge. Never bypass a failing check.

---

## Phase 0 — Contract alignment (no code)

- [ ] **T0.1** Read and agree on target docs — `OPTIMIZATION_MODEL.md`, `DATA_CONTRACT.md`, `API_CONTRACT.md`, `DECISIONS.md`, `TEST_PLAN.md`.
  - Done when: both P and B can quote the penalty order and the response field list without the docs open.
  - Cross-check: `[ ]` list the 3 things you agree on: penalty order, status enums, response top-level fields.

---

## Phase 1 — Mock API (unblocks frontend)

- [x] **T1.1** Create mock API response file (`backend/app/data/mock_response.json`) matching `DATA_CONTRACT.md` §5 exactly.
  - Done when: JSON parses against the planned response schema; frontend can render every field.
  - Cross-check: `[ ]` compare field-by-field against `DATA_CONTRACT.md` §5.1–§5.5 (run_id, status, dispatch_hours, summary, baseline_summary, explanations, warnings, persistence).

---

## Phase 2 — Schemas and demo data

- [x] **T2.1** Rewrite Pydantic request schemas per `DATA_CONTRACT.md` §4 (`scenario_id`, `scenario_name`, `scenario_type`, `site`, `assets`, `operating_policy`, `hours` with `p1..p4_demand_kwh`).
  - Done when: schemas validate the prepared demo payload; scenario-type enum per §3.2; `interval_hours == 1` enforced.
  - Cross-check: `[ ]` confirm `operating_policy` exposes **only** `carbon_price_per_kg_co2` (§4.7 — no safety penalties).

- [x] **T2.2** Rewrite `data/demo_scenario.json` to the new contract with realistic P1–P4 values (flexible tiers scale P2 < P3 < P4; P1 magnitude is independent — §4.9 example has P1 largest).
  - Done when: 24 records, hours 0–23 unique, all values ≥ 0, validates against T2.1 schemas.
  - Cross-check: `[ ]` spot-check 3 rows for load-priority realism and unit suffixes (`_kwh`, `_kw`).

- [x] **T2.3** Rewrite response schemas per `DATA_CONTRACT.md` §5: `dispatch_hours`, `summary` (§5.2 all fields), `warnings`, `persistence`, and the status enum `optimal | emergency_plan | failed` (§3.1).
  - Done when: a response cannot be constructed with a status outside the enum.
  - Cross-check: `[ ]` verify summary includes `p1_unserved_kwh`..`p4_unserved_kwh`, `renewable_curtailment_kwh`, `p1_reliability_percent` (§5.2).

---

## Phase 3 — Optimizer migration (P: PushkarManvar)

- [x] **T3.1** Add P1–P4 variables and per-priority `unserved[p,t]` with bounds `0 ≤ unserved ≤ load` (`OPTIMIZATION_MODEL.md` §5, §7.6).
  - Done when: energy-balance uses `total_served_load = Σ(load_p − unserved_p)` (§7.1).
  - Cross-check: `[ ]` confirm unserved exists per priority, not one aggregate.

- [x] **T3.2** Flip penalty order to **P1 > reserve shortfall > P2 > P3 > P4 > normal costs** (`DECISIONS.md` D003, `OPTIMIZATION_MODEL.md` §6.1).
  - Done when: `models.py` validator enforces the order; root `AGENTS.md` penalty text updated to match.
  - Cross-check: `[ ]` both docs (`AGENTS.md` + `OPTIMIZATION_MODEL.md` §6.1) now agree — this resolves the known conflict.

- [x] **T3.3** Verify energy-balance equality (not ≥) and renewable limits (`OPTIMIZATION_MODEL.md` §7.1, §7.2). Add derived `renewable_curtailment[t]` output.
  - Done when: equality holds within `EPSILON = 1e-6`; curtailment = available − used (§7.2).
  - Cross-check: `[ ]` TEST_PLAN §3 tolerance used in all assertions.

- [x] **T3.4** Verify battery transition, hard bounds, binary charge/discharge mode, and soft reserve with bound `0 ≤ reserve_shortfall ≤ reserve_target` (`OPTIMIZATION_MODEL.md` §7.3, §7.4).
  - Done when: no hour charges and discharges together; shortfall reported, never infeasible.
  - Cross-check: `[ ]` confirm reserve is **soft** (penalized), not a hard feasibility condition.

- [x] **T3.5** Check solver status **before** reading decision-variable values (`OPTIMIZATION_MODEL.md` §9).
  - Done when: non-optimal status → structured `failed`/`emergency_plan`, never a dispatch from invalid values.
  - Cross-check: `[ ]` TEST_PLAN §8 "Solver failure does not return dispatch values as valid".

- [x] **T3.6** Unit tests O01–O12 from `TEST_PLAN.md` §4.
  - Done when: `pytest` green in container; includes O06 (P4 before P3 before P2 before P1) and O07 (P1 before reserve).
  - Cross-check: `[ ]` run `docker compose exec backend pytest -q` and confirm all pass.

---

## Phase 4 — Baseline, metrics, explanations (P: PushkarManvar)

- [x] **T4.1** Reactive no-lookahead baseline (`OPTIMIZATION_MODEL.md` §8, `DECISIONS.md` D007, `TEST_PLAN.md` §5).
  - Done when: renewables first, battery charges surplus, discharge to hard min, diesel for deficit, P4→P1 reduction; deterministic; **identical inputs** to optimized model.
  - Cross-check: `[ ]` baseline must NOT plan around future demand (§8 item 6).

- [x] **T4.2** Metrics per `OPTIMIZATION_MODEL.md` §10 (`diesel_fuel_l`, `fuel_cost`, `co2_kg`, `renewable_share_percent`, `p1_reliability_percent`, curtailment) + explicit zero-denominator rule.
  - Done when: TEST_PLAN §6 metric tests pass, including zero-demand test.
  - Cross-check: `[ ]` every metric has a unit suffix and matches §10 formulas.

- [x] **T4.3** Explanation rules with `code`, `severity`, `hour_index`, `message`, `evidence` (`DATA_CONTRACT.md` §5.4, warning codes §5.5).
  - Done when: P1_UNSERVED and RESERVE_SHORTFALL always emitted when non-zero; evidence carries numbers.
  - Cross-check: `[ ]` no LLM — explanations are rule-generated from result values.

---

## Phase 5 — API endpoints and CSV (B: Bella)

- [x] **T5.1** Health endpoint returns separate `api`, `solver`, `database` (`API_CONTRACT.md`; `TEST_PLAN.md` §8).
  - Done when: DB down still shows `api: ok`. (Implemented in PR #9.)
  - Cross-check: `[ ]` TEST_PLAN §8 first bullet.

- [x] **T5.2** Wire `/optimize` and `/scenarios/demo` to new schemas + status mapping (§9 of MODEL).
  - Done when: prepared scenario → `optimal`; stress → `emergency_plan`; solver failure → `failed`/500. (Implemented in PR #9.)
  - Cross-check: `[ ]` response matches DATA_CONTRACT §5 exactly (no `hours` field, use `dispatch_hours`).

- [x] **T5.3** CSV export endpoint (required — `DECISIONS.md` D008).
  - Done when: CSV contains all 24 hourly rows + summary; works from the in-memory result even if DB save fails. (Implemented as `POST /api/v1/optimize/export`.)
  - Cross-check: `[x]` TEST_PLAN E04 — export survives persistence failure (unit test + real-DB outage check).

- [x] **T5.4** Consistent 422 error object per `DATA_CONTRACT.md` §6 (`error.code`, `error.message`, `error.fields[]` with stable paths).
  - Done when: TEST_PLAN §7 validation tests pass with field paths.
  - Cross-check: `[x]` validate rejects all §7 cases (24 records, negatives, bounds, enums, interval).

---

## Phase 6 — Persistence (B: Bella)

- [x] **T6.1** Database migration per `DATABASE.md` §3 tables + §7 rules (ordered migrations, explicit constraints, enum checks).
  - Done when: schema applies fresh in Docker; constraints reject invalid rows. (Migrations under `db/migrations/`, tracked in `gridmitra.schema_migrations`.)
  - Cross-check: `[x]` `gridmitra` schema stays private; no grants for browser access (§1).

- [x] **T6.2** Persistence workflow per `DATABASE.md` §6: save site, scenario, run, dispatch_hours, explanations in one transaction; on failure return result with `persistence.saved=false` + `DATABASE_SAVE_FAILED`.
  - Done when: TEST_PLAN E04 passes; calculated plan never lost.
  - Cross-check: `[x]` a DB outage still returns the full optimization response.

---

## Phase 7 — Integration and release prep

- [ ] **T7.1** End-to-end prepared + combined-stress scenario (`TEST_PLAN.md` §10 E01, E02).
  - Done when: both paths complete through CSV export with visible warnings where calculated.
  - Cross-check: `[ ]` no hard-coded KPI values anywhere.

- [ ] **T7.2** Contract sync — update frontend `src/types.ts` to the new contract (`DATA_CONTRACT.md` §7 change rule), update `API_CONTRACT.md`/`DATA_CONTRACT.md` in the same PRs as code.
  - Done when: TS types and Pydantic schemas match field-for-field.
  - Cross-check: `[ ]` `grep` for old field names (`critical_load_kwh`, `flexible_load_kwh`, `hours`, `unserved_critical_kwh`) returns nothing in active code/types.

- [ ] **T7.3** Release-gate checklist (`TEST_PLAN.md` §12): all unit + contract tests green in Docker and CI, prepared + stress scenarios pass, second-laptop fresh clone works.
  - Done when: `v0.1.0-hackout-demo` can be tagged.
  - Cross-check: `[ ]` demo runbook rehearsal recorded (`DEMO_RUNBOOK.md` §9).

---

## Conflict log (as of PR #11 — T2.1–T6.2 migrated)

| Item | Current code | Target docs | Action |
|---|---|---|---|
| Load tiers | critical + flexible (2) | P1–P4 (4) | Resolved by T3.1 (PR #9) |
| Penalty order | reserve > P1 | P1 > reserve > P2 > P3 > P4 | Resolved by T3.2 (PR #9) |
| Status values | `optimal`, `feasible` | `optimal`, `emergency_plan`, `failed` | Resolved by T2.3 (PR #9) |
| Response field | `hours` | `dispatch_hours` | Resolved by T2.3 (PR #9) |
| Health | `api`, `database` | `api`, `solver`, `database` | Resolved in PR #9 |
| Persistence | schema exists, not wired | full workflow + save-failure resilience | Resolved by T5.3/T5.4/T6.1/T6.2 (PR #10) |