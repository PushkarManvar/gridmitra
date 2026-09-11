# 30-Hour MVP Board

Owners:
- **M2 (backend/optimizer/data)**: PushkarManvar, Bella-M07 → detailed task list with doc cross-checks in `docs/TASK_BOARD_BACKEND.md`
- **M1 (frontend)**: Nishant3634, Mit-Prajapati
- **M3 (integration/QA)**: whoever is free first

Every task has exactly one accountable owner; teammates may assist. "All" means every member.

## Block 1 — foundation (hours 0–4)

Correct order:

```text
Docker works on every laptop
→ Optimization model frozen
→ Data contract frozen
→ Mock API response frozen
→ CI runs successfully
→ Branch protection enabled
→ Parallel development begins
```

- [ ] Docker works on every laptop — All
- [ ] Optimization model frozen — M2
- [ ] Data contract frozen — M2, M1 sign-off
- [ ] Mock API response frozen — M2
- [ ] Dashboard wireframe agreed — M1
- [ ] Demo scenario frozen — M3
- [ ] CI runs successfully (GitHub Actions backend + frontend checks) — All
- [ ] GitHub branch protection enabled (after the first successful CI run) — Team lead
- [ ] Parallel development begins — All

## Block 2 — parallel build (hours 4–16)

- [ ] Frontend input panel and KPI cards — M1
- [ ] Dispatch and SOC charts — M1
- [ ] Frontend works with a mocked API response — M1
- [ ] Optimizer equations and tests — M2
- [ ] Reactive no-lookahead baseline (renewables first, battery without planning, diesel for the deficit, then P4-to-P1 reduction) — M2
- [ ] Unit tests for energy balance, SOC bounds, and P1 priority — M2
- [ ] Demo/stress scenarios — M3
- [ ] Scenario API wiring — M2

## Block 3 — integration (hours 16–24)

- [ ] End-to-end prepared scenario — All
- [ ] Loading, validation, solver, and API error states — M1
- [ ] Reserve-shortfall and unmet-critical-load warnings — M1
- [ ] Baseline-versus-optimized comparison and explanations — M2
- [ ] Database-save failure does not remove calculated results — M2
- [ ] CSV export — M2 (endpoint), M1 (download button)
- [ ] Frontend values verified against API response — M3

## Block 4 — demo hardening (hours 24–30)

- [ ] Fresh-clone test on a second laptop — All
- [ ] Offline/prepared-data rehearsal — M3
- [ ] Backup screenshots/video — M3
- [ ] Solver output manually checked for prepared and stress scenarios — M2
- [ ] Production deployment verified — Team lead
- [ ] KPI wording checked as simulated estimates — M1
- [ ] Final documentation and API examples updated — All
- [ ] Final tag: `v0.1.0-hackout-demo` — Team lead