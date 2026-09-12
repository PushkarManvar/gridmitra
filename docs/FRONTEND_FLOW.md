# GridMitra Frontend Flow

## 1 Purpose

This document defines the MVP navigation, page responsibilities, data dependencies, states and demo journey for the React frontend.

## 2 Primary User Journey

```text
Load demo community
→ review dashboard
→ inspect configuration and forecast
→ run optimization
→ inspect dispatch and explanations
→ apply a stress scenario
→ re-optimize
→ compare results
→ export CSV
```

## 3 Routes

| Route | Page | MVP priority |
|---|---|---|
| `/` | Site selection (auto demo sign-in, no login page) | Required |
| `/overview` | Overview dashboard | Required |
| `/configuration` | Microgrid configuration | Required |
| `/forecast` | Forecast and demand | Required |
| `/dispatch` | Dispatch results | Required |
| `/scenarios` | Saved scenario drafts (owner-scoped versions) | Required (Phase B) |
| `/scenarios/edit` | Scenario editor — editable inputs only | Required (Phase B) |
| `/scenario-lab` | Scenario lab | Required |
| `/impact` | Impact comparison | Required |
| `/history` | Saved runs | Required |
| `/about` | About page | Public |

Standalone landing, login, documentation, settings and support pages were removed after review; the app signs into the prepared demo account automatically and the sidebar links stay on the core workflow.

## 4 Shared Layout

The application shell contains:

- GridMitra name and demo-environment indicator
- Current site and scenario
- Left navigation on desktop
- Compact navigation on smaller screens
- API and data-source status
- Persistent `Run Optimization` action when inputs are valid

The interface must state that GridMitra provides recommendations and does not directly control equipment.

## 5 Page Specifications

### 5.1 Demo and Site Selection

Purpose: allow a judge to enter the working product immediately.

Required elements:

- One-sentence product explanation
- `Load Demo Community` primary button
- `Create Custom Configuration` secondary button
- Short scope notice
- Prepared-data availability indicator

Primary action:

```text
Load Demo Community → GET /api/v1/scenarios/demo → Dashboard
```

### 5.2 Overview Dashboard

Required cards:

- Forecast demand
- Forecast renewable availability
- Current battery energy and percentage
- Diesel price
- Terminal reserve target
- Current scenario

Required chart preview:

- Demand and renewable availability for 24 hours

Required actions:

- Review inputs
- Run optimization
- Open scenario lab

No improvement percentage should appear before a real optimization response exists.

### 5.3 Microgrid Configuration

Group inputs into:

1. Solar and wind
2. Battery
3. Diesel generator
4. Operating preference

Show units inside labels. Validate locally for immediate feedback, while treating backend validation as authoritative.

The frontend must not expose P1-P4 penalty constants.

### 5.4 Forecast and Demand

Required elements:

- Renewable-availability chart
- Stacked P1-P4 demand chart
- Editable 24-row hourly table
- Input-validation summary
- `Reset to Demo Data`

CSV import and live-weather refresh are optional. Prepared data remains the primary judge path.

Live weather flow (optional, Open-Meteo via `GET /api/v1/weather/forecast`):

- Show location inputs (latitude, longitude, panel tilt, panel azimuth) prefilled from the site.
- `Fetch Live Weather` calls the backend; a provider failure falls back to prepared data with a `PREPARED FALLBACK` badge and `FALLBACK_DATA_USED` warning.
- Source badge shows `LIVE WEATHER`, `CACHED FORECAST` or `PREPARED FALLBACK`; show last-updated time.
- Fetched values replace only solar/wind availability — P1–P4 demand stays unchanged.
- `Run Optimization with Live Weather` is a separate operator action from fetching; fetching never auto-runs the optimizer.

### 5.5 Dispatch Results

Required KPI cards:

- Total operating cost
- Diesel energy
- Estimated CO2
- Renewable share
- P1 reliability
- Reserve shortfall

Required charts:

- Stacked hourly energy dispatch
- Battery energy or SOC line
- Baseline-versus-GridMitra comparison

Required table:

- Twenty-four hourly dispatch rows
- Expandable explanation for each important hour

Required actions:

- Explain this hour
- Open scenario lab
- Export CSV

### 5.6 Scenario Lab

Required scenarios:

- Normal day
- Cloudy day
- Evening demand spike
- High diesel price
- Battery degradation
- Combined stress

Required controls:

- Solar availability multiplier
- Demand multiplier or evening-spike control
- Diesel-price multiplier
- Available battery-capacity multiplier
- Terminal reserve target
- Cost-carbon preference

Scenario changes create a new request object and never overwrite the original prepared input silently.

Required comparison:

- Original optimized summary
- Modified optimized summary
- Absolute and percentage difference where the denominator is non-zero

### 5.7 History

This page is optional until persistence is stable.

If implemented, show:

- Run ID
- Scenario name and type
- Creation time
- Status
- Cost
- CO2
- Renewable share
- P1 reliability
- View result

## 6 Result States

### 6.1 Loading

- Disable repeated optimization submissions.
- Display `Calculating the 24-hour plan`.
- Preserve the previous result but label it as previous until the new run finishes.

### 6.2 Optimal

- Use a normal success treatment.
- Show `Optimal recommendation generated`.
- Render all KPIs and 24 hourly records.

### 6.3 Emergency plan

- Render the valid plan.
- Display a persistent critical warning.
- Identify P1 unserved energy and reserve shortfall separately.
- Avoid describing the result as a failure when the optimizer successfully found the least-harm plan.

### 6.4 Validation error

- Keep the operator on the input page.
- Map returned field paths to relevant controls.
- Provide a summary at the top of the form.

### 6.5 Solver failure

- Do not replace the last valid result with empty charts.
- Show a retry action.
- Do not read or display partial solver values.

### 6.6 Database-save failure

- Continue displaying the calculated plan.
- Show `Plan calculated but history could not be saved`.
- Keep CSV export available.

### 6.7 Forecast API failure

- Load prepared data.
- Display `Prepared fallback data is being used`.

## 7 Explainability Behaviour

Explanations come from the backend. The frontend only formats them.

Example explanation types:

- Diesel activated after renewable and safe battery supply were insufficient
- Battery energy preserved for later critical demand
- P4 demand reduced to protect higher-priority services
- Renewable energy curtailed because demand and charging capacity were already satisfied
- Terminal reserve target missed under stress

Every explanation view should display the numeric evidence returned by the API.

## 8 Chart Rules

| Series | Suggested colour |
|---|---|
| Solar used | Yellow |
| Wind used | Cyan |
| Battery discharge | Blue |
| Battery charge | Light blue below the axis or patterned |
| Diesel | Orange |
| Unserved P1 | Dark red |
| P2-P4 unserved | Progressively lighter red or orange |
| Battery energy | Deep blue line |

Charts must:

- Include units
- Use consistent colours across pages
- Provide tooltips with exact values
- Remain readable without relying only on colour
- Avoid three-dimensional effects
- Use API values without independently recalculating official metrics

## 9 Suggested Frontend Structure

```text
src/
├── app/
├── pages/
├── features/
│   ├── configuration/
│   ├── forecast/
│   ├── optimization/
│   ├── scenarios/
│   └── history/
├── components/
│   ├── ui/
│   └── layout/
├── charts/
├── services/
├── types/
└── utils/
```

## 10 Frontend Acceptance Criteria

- The prepared scenario can be loaded in one click.
- All required pages remain usable on a typical laptop display.
- Input units and validation messages are visible.
- A mocked API response can drive every required result component.
- A real API response can replace the mock without changing component structure.
- Emergency plans display warnings and valid dispatch data together.
- Changing a scenario visibly changes relevant inputs before re-optimization.
- No official KPI or dispatch result is hard-coded.
- CSV export works from the current valid result.

