# GridMitra Frontend Design System

Hand this to any frontend contributor. Everything below is already wired in
`frontend/tailwind.config.js` — **use the named tokens, never hard-code hex**.
Matching screens: `frontend/ui screen/grid_energy_mix_decision_system/`.

## 1. Color tokens (Material 3 dark-on-light)

| Token | Hex | Use for |
|---|---|---|
| `primary` | `#003e32` | Page titles, buttons, active nav |
| `primary-container` | `#0d5748` | Primary buttons/hover, key accents |
| `on-primary` | `#ffffff` | Text/icon on primary |
| `surface-container-lowest` | `#ffffff` | Page background, cards |
| `surface-container-low` | `#edf6f2` | Inputs, chips, subtle panels |
| `surface` | `#f3fbf8` | Secondary backgrounds |
| `on-surface` | `#151d1b` | Headings, body text |
| `on-surface-variant` | `#3f4945` | Secondary text, inactive nav |
| `secondary` | `#5f5e58` | Muted labels, metadata |
| `outline` / `outline-variant` | `#6f7975` / `#bfc9c4` | Borders, dividers |
| `error` | `#ba1a1a` | Errors, P1 unserved, danger |
| `tertiary` | `#00395a` | Info accents (sparingly) |

Rules: dark text on light surfaces, green `#003e32` is the brand. Never use
random grays — always `on-surface-variant`/`secondary`/`outline`.

## 2. Typography hierarchy

Fonts: **Geist** (UI text) + **JetBrains Mono** (numbers, labels, codes).

| Class | Size | Weight | Use for |
|---|---|---|---|
| `font-display-lg` | 32px/40px | 600, -0.02em | Page hero titles |
| `font-headline-md` | 22px/28px | 600 | Page H1 (Overview, Dispatch…) |
| `font-headline-sm` | 18px/24px | 600 | Card titles, section H2 |
| `font-title-md` | 15px/20px | 500 | Card subheads |
| `font-body-md` | 13px/18px | 400 | Default body |
| `font-body-sm` | 12px/16px | 400 | Secondary text |
| `font-label-uppercase` | 11px | 600, +0.06em | KPI/card labels (uppercase mono) |
| `font-metric-mono-lg` | 24px | 600 | Big KPI numbers |
| `font-metric-mono-md` | 14px | 500 | Table numbers |
| `font-code-mono-sm` | 11px | 400 | IDs, run codes |

Rules: one H1 per page, mono for **all** numbers/labels/IDs, uppercase mono
labels above values (the current cards do this — copy them).

## 3. Spacing & radius

Radius: `rounded-lg` (8px) inputs/chips, `rounded-xl` (12px) cards, `rounded-full` pills.
Spacing: use `gap-*`/`p-*` (4px scale); cards `p-4`/`p-5`, page gutter `p-8`, page stack `gap-5`/`gap-6`.

## 4. Chart palette (ECharts)

| Series | Color |
|---|---|
| Solar | `#D97706` (amber) |
| Wind | `#0284C7` / `#5B8C87` (cyan/teal) |
| Battery discharge | `#2563EB` (blue) |
| Battery charge | `#60A5FA` (light blue) |
| Diesel | `#EA580C` (orange) |
| Demand / served line | `#1A2220` (near-black) |
| P1 unserved | `#BA1A1A` (error red) |
| P4/P3/P2 unserved | progressively lighter red/orange |
| Baseline (comparison) | `#9CA3AF` (gray) |
| GridMitra (comparison) | `#0D5748` (primary-container green) |

Tooltips: white bg, `#E2DDD2` border, JetBrains Mono. Always label units (kWh, %).

## 5. Icons & components

- Icons: **Material Symbols Outlined** (e.g. `bolt`, `history`, `science`, `folder_open`).
- KPI card pattern (copy from `pages/Dispatch.tsx`): white card, `border-outline-variant`,
  `rounded-xl`, `p-3/p-4`, uppercase mono label → mono value → tiny detail line.
- Status: `components/ui/StatusBadge.tsx` — green `optimal`, amber `emergency_plan`, red `failed`.
- Warnings: `components/ui/WarningPanel.tsx` (severity-styled, deduped).
- Charts live in `src/charts/` — reuse existing components, don't hand-roll new ECharts.

## 6. Non-negotiables

- Display **calculated backend values only** — no hard-coded KPIs, no `Math.random()`.
- Every number has a unit suffix (`kWh`, `kW`, `%`, `kg`).
- Simulated results are labelled as estimates.
- No fonts/colors outside this system; nothing says "hardware control".
- TypeScript types come from `src/types/` — never invent new field names.