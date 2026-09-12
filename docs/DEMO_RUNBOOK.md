# GridMitra Demo Runbook

## 1 Purpose

This runbook defines the exact judge demonstration and recovery plan. The team should rehearse this sequence using the tagged release rather than an uncommitted development branch.

## 2 Demo Goal

In one short flow, demonstrate that GridMitra:

- Uses a real 24-hour optimization model
- Protects critical community loads
- Respects battery and generator constraints
- Compares planned dispatch with reactive operation
- Responds to changed conditions
- Explains important decisions
- Continues working with prepared data when external services are unavailable

## 3 Pre-Demo Checklist

- Checkout tag `v0.1.0-hackout-demo`.
- Start all containers.
- Confirm frontend, API documentation and health endpoint.
- Confirm the prepared normal scenario solves.
- Confirm the combined stress scenario solves.
- Confirm CSV export works.
- Close unrelated browser tabs and notifications.
- Keep the prepared-data path selected.
- Keep a backup screenshot set and short recording ready.
- Do not depend on live weather data during judging.

## 4 Suggested Five-Minute Flow

### 0:00 to 0:30 Problem and product

Say:

> Off-grid operators must balance changing renewable supply, battery limits, diesel cost and critical community demand. GridMitra converts those inputs into an explainable 24-hour dispatch recommendation. It supports the operator; it does not directly control equipment.

Action:

- Open GridMitra.
- Point to `Prepared Demo Data` and `Decision Support` indicators.

### 0:30 to 1:00 Load the community

Action:

- Click `Load Demo Community`.
- Show solar, wind, battery, diesel and P1-P4 demand summaries.

Say:

> The demo uses a committed representative dataset, so the core workflow remains reproducible even without a live weather API.

### 1:00 to 2:00 Run the normal plan

Action:

- Click `Run Optimization`.
- Show solver status.
- Open the dispatch chart and battery curve.
- Show cost, CO2, diesel, renewable share and P1 reliability.

Say:

> These values are calculated from the current scenario. They are not hard-coded targets.

### 2:00 to 2:40 Explain a decision

Action:

- Select an hour where diesel or battery behaviour is meaningful.
- Click `Explain` on that row in the hourly table — the explanation panel opens beside the dispatch charts.
- Point at the prepared-data badge on the Overview banner to confirm the run uses committed demo inputs.

Say:

> The explanation is generated from the optimizer result and its numeric evidence. This makes the recommendation understandable to an operator without relying on a black-box model.

### 2:40 to 3:20 Compare with reactive operation

Action:

- Show baseline-versus-GridMitra comparison.

Say:

> The baseline uses the same inputs but makes decisions one hour at a time without future planning. GridMitra sees the complete 24-hour horizon and can preserve energy for important later demand.

### 3:20 to 4:20 Stress scenario

Action:

- Open Scenario Lab.
- Select `Combined Stress` or reduce solar and available battery capacity.
- Rerun optimization.
- Show the changed dispatch and warnings.

Say:

> Under genuine stress, GridMitra returns the least-harm emergency plan. It reports unmet load or reserve shortfall clearly instead of hiding the condition behind a solver error.

### 4:20 to 5:00 Close and export

Action:

- Export the current result as CSV.
- Return to the comparison summary.

Say:

> GridMitra helps an operator use available renewable energy intelligently, protect critical services first and understand the cost, carbon and reliability consequences of every plan.

## 5 Expected Qualitative Results

Do not memorize or claim fixed improvement percentages. Verify the following behaviours from the actual tagged build:

### Normal scenario

- Valid 24-hour plan
- No hard constraint violations
- P1 protected when supply is sufficient
- Calculated KPIs and explanations visible

### Cloudy or combined-stress scenario

- Renewable use decreases with available supply
- Battery and/or diesel dispatch responds within limits
- Lower-priority demand is reduced before P1 when shortage exists
- Reserve shortfall is shown if the terminal target cannot be met

### Measured baseline-vs-GridMitra direction (from the current model)

Do not claim fuel savings. In the current model GridMitra typically uses **equal or more diesel** than the reactive baseline because it:

- Preserves the terminal reserve (final battery meets the target) instead of draining to the hard minimum.
- Avoids unserved demand under stress (baseline sheds P1–P4 when it runs dry).

Correct framing:

> GridMitra keeps the reserve intact and serves demand the baseline would shed, at a modest cost. It trades a little diesel now for reliability later — that is the value of 24-hour lookahead.

Quote measured values from the run, not fixed percentages.

## 6 Judge Questions and Short Answers

### Is this machine learning?

> The core problem is constrained resource allocation, so we use transparent mixed-integer optimization. Forecasts are inputs. A forecasting model can be integrated later without changing the dispatch engine.

### Does it control real equipment?

> No. The MVP is operator decision support. Production integration would require verified telemetry, control interfaces and additional safety engineering.

### Why not simply use solar first and diesel last?

> A fixed rule does not consider future demand, battery reserve, efficiency, diesel cost or service priority across 24 hours. The optimizer evaluates these constraints together.

### Does GridMitra always reduce diesel?

> Not necessarily. Its measured value is reliability and reserve discipline: it protects the terminal reserve and avoids unserved demand that a short-sighted operator would accept, sometimes at a modest diesel cost. Claiming unconditional fuel savings would be misleading; we report the measured comparison for each run.

### What happens when there is not enough energy?

> The optimizer returns a least-harm emergency plan. It reduces P4 before higher priorities, protects P1 as far as physically possible and reports any reserve shortfall.

### Why is the result explainable?

> The mathematical constraints and objective are explicit, and every explanation is generated from calculated values such as renewable deficit, battery limits and demand priority.

### Are the savings verified field results?

> No. The dashboard displays calculated prototype estimates for the selected scenario, not measured deployment results.

## 7 Failure Recovery

### Weather API unavailable

- Use prepared demo data.
- State that live weather is optional in the MVP.

### Database unavailable

- Continue with the calculated in-memory result.
- Show the persistence warning.
- Export CSV from the current response.

### Solver request fails unexpectedly

- Retry the prepared normal scenario once.
- If failure remains, use the backup recording and explain the already-tested workflow.
- Do not present stale values as the current scenario.

### Frontend deployment unavailable

- Start the tested Docker Compose build locally.
- Open `http://localhost:5173`.

### Internet unavailable

- Use the already-installed local Docker images and prepared data.
- Avoid any live API action.

## 8 Team Roles During Demo

| Role | Responsibility |
|---|---|
| Presenter | Problem, workflow, impact and closing |
| Frontend member | Dashboard, charts, scenario interaction and UI questions |
| Backend and optimization member | Model, constraints, API and technical questions |

Assign named members before the final rehearsal.

## 9 Final Rehearsal Record

Record before judging:

- Git tag and commit
- Device used
- Browser used
- Normal scenario status
- Stress scenario status
- Offline fallback result
- Test command results
- Known limitations

