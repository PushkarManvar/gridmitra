# Project Context

## Problem statement

Rural and off-grid communities often combine unreliable diesel generation with small renewable installations. GridMitra recommends the best hourly combination of solar, wind, battery storage, and diesel backup to reduce cost and emissions while maintaining reliable service.

## Product position

GridMitra is an explainable decision-support simulator for an operator. It is not a SCADA system, hardware controller, or field-validated autonomous control product.

## MVP journey

1. Operator opens a prepared site scenario.
2. Operator reviews demand, weather-derived renewable availability, fuel price, and battery limits.
3. Operator changes a what-if control if desired.
4. FastAPI validates and sends the scenario to PuLP/CBC.
5. The optimizer returns a 24-hour dispatch plan and KPIs.
6. The dashboard shows dispatch, battery SOC, savings/emissions, reliability, and explanations.
7. Operator compares the optimized plan with a reactive no-lookahead baseline.

The baseline is: renewables first, battery used without future planning, diesel used for the remaining deficit, then P4-to-P1 load reduction if supply remains insufficient.

## Must-have features

- Site/scenario inputs
- 24-hour dispatch optimization
- Critical-load protection
- Battery guardrails and visible reserve shortfall
- Cost, CO2, diesel, renewable-share, and unmet-energy KPIs
- Dispatch and SOC charts
- Prepared passing and stress scenarios
- Plain-language result explanations
- Baseline-versus-optimized comparison
- CSV result export

## Nice-to-have features

- Live weather fetch with a prepared-data fallback
- Saved scenario history
- PDF export and saved-run history
- Comparison of multiple saved scenarios
- Sensitivity analysis

## Acceptance criteria

- The prepared scenario solves and renders without internet access after dependencies/images are installed.
- An extreme scenario returns a result with unmet load and/or reserve shortfall instead of an infeasible blank screen.
- Every hourly energy balance is satisfied within floating-point tolerance.
- SOC never violates configured hard min/max bounds.
- The response clearly distinguishes simulated estimates from measured results.
- The frontend displays calculated backend results and contains no hard-coded KPI values.
