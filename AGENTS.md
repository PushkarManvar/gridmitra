# GridMitra Shared Context

This file is the canonical context for teammates and AI coding tools. Read it before changing the project.

## Product

GridMitra addresses HackOut'26 Problem Statement 4: **Microgrid Energy Mix Optimizer for Off-Grid Communities**. The team is Error 404, with three members and a 30-hour hackathon target.

The MVP is a web-based, operator-approved decision-support simulator. It produces a 24-hour dispatch recommendation; it never claims to control real equipment.

Primary users are microgrid operators, rural electrification agencies, NGOs, and off-grid communities.

## Demo outcome

Given hourly demand, renewable availability, battery state, diesel limits, fuel price, and emissions factors, show:

1. Hourly solar, wind, battery, diesel, and unmet-load dispatch.
2. Battery state-of-charge trajectory and reserve status.
3. Total operating cost, diesel use, emissions, renewable share, and reliability.
4. A plain-language explanation of why the optimizer made important choices.
5. What-if comparison for fuel-price, weather, outage, and demand scenarios.

## Fixed technical decisions

- React + TypeScript + Tailwind CSS.
- Apache ECharts for dispatch and SOC charts.
- Python + FastAPI backend.
- PuLP with CBC for a transparent linear/mixed-integer optimization model. This is optimization, not ML.
- Pandas + NumPy for hourly data preparation.
- PostgreSQL 17 locally through Docker Compose; hosted Supabase may be used for deployment.
- Prepared realistic 24-hour data is mandatory. A live weather API is optional and must never be required for the demo.
- Deploy target: Vercel frontend and Render/Railway backend, with Supabase PostgreSQL when needed.

## Optimization rules

For each hour, supply from solar, wind, diesel, and battery discharge plus permitted unserved energy balances critical and flexible demand plus battery charging.

Required constraints:

- Renewable use cannot exceed availability.
- Diesel output cannot exceed generator capacity.
- Battery SOC remains between configured minimum and maximum bounds.
- Charge and discharge power are limited.
- The battery cannot charge and discharge simultaneously.
- Unserved critical and flexible demand variables keep extreme scenarios solvable.
- Critical (P1) demand has a much larger penalty than flexible demand.
- Terminal reserve is a **soft constraint**, never a hard feasibility condition:

  `final_soc_kwh + reserve_shortfall_kwh >= reserve_target_kwh`

  `reserve_shortfall_kwh >= 0`

- `reserve_shortfall_kwh` receives a penalty slightly higher than the P1 unserved-energy penalty. Always return and explain any shortfall.

## Non-goals for the MVP

- No physical IoT control or automatic generator switching.
- No blockchain.
- No custom ML model unless the baseline is fully working first.
- No dependency on live APIs during judging.
- No pretending simulated savings are field-validated results.

## Architecture boundaries

- `frontend/` renders inputs and results. It does not implement dispatch math.
- `backend/app/services/optimizer.py` owns mathematical decisions and derived KPIs.
- `backend/app/api/` owns HTTP validation and response mapping.
- `db/` owns durable schema. Database changes must be migration-oriented and reviewed.
- `data/` contains small, attributable, versioned demo inputs only.
- Use integer IDs/UUIDs and UTC timestamps for stored records.

## Security

- Browser-safe variables use the `VITE_` prefix. Never put service-role or database credentials there.
- The browser calls FastAPI; only the server connects directly to PostgreSQL/Supabase.
- Keep private operational tables outside the Supabase exposed API schema, or enable RLS and explicit grants before exposure.
- Never commit `.env`.

## Definition of done

A change is done when it is scoped, typed, tested, documented when behavior changes, and works through Docker Compose. Do not merge code that breaks the prepared demo scenario.
