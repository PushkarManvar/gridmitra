---
name: Grid Energy Mix Decision System
colors:
  surface: '#f3fbf8'
  surface-dim: '#d3dcd8'
  surface-bright: '#f3fbf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf6f2'
  surface-container: '#e7f0ec'
  surface-container-high: '#e1eae6'
  surface-container-highest: '#dce4e1'
  on-surface: '#151d1b'
  on-surface-variant: '#3f4945'
  inverse-surface: '#2a3230'
  inverse-on-surface: '#eaf3ef'
  outline: '#6f7975'
  outline-variant: '#bfc9c4'
  surface-tint: '#266959'
  primary: '#003e32'
  on-primary: '#ffffff'
  primary-container: '#0d5748'
  on-primary-container: '#89cbb7'
  inverse-primary: '#92d3c0'
  secondary: '#5f5e58'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2da'
  on-secondary-container: '#65645e'
  tertiary: '#00395a'
  on-tertiary: '#ffffff'
  tertiary-container: '#00517d'
  on-tertiary-container: '#7ec4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#adf0dc'
  primary-fixed-dim: '#92d3c0'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#015142'
  secondary-fixed: '#e5e2da'
  secondary-fixed-dim: '#c9c6bf'
  on-secondary-fixed: '#1c1c17'
  on-secondary-fixed-variant: '#474741'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f3fbf8'
  on-background: '#151d1b'
  surface-variant: '#dce4e1'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 20px
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-uppercase:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  metric-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  metric-mono-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  code-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers an authoritative, high-precision technical interface designed for municipal electrical engineers, energy consultants, and independent system operators. The tone is clinical, calm, and exacting—minimizing cognitive fatigue during continuous monitoring and high-stakes operational planning.

The design movement synthesizes **Swiss Technical Minimalism** with **Tactile Instrument Precision**:
- **Background Integrity:** Pure white operational workspaces paired with deliberate, warm ivory surface accents to denote active state focus without visual noise.
- **Structural Discipline:** Razor-sharp architectural framing with calibrated warm gray borders, avoiding heavy drop shadows or unnecessary decorative flourishes.
- **Dense Legibility:** Information-dense, scannable data layouts featuring tabular alignment, uppercase micro-labels, and standardized color channels for discrete energy vectors (Solar, Wind, Battery Storage, Diesel, and Grid Exchange).

## Colors

The system uses a targeted, high-readability palette anchored by deep forest teal and muted ivory, paired with deterministic semantic colors mapped strictly to generation types and solver states.

### Core Foundation
- **Primary Brand:** Deep Forest Green `#0D5748` (Hover `#083E34`, Pressed `#052822`, Subtle Tint `#E6F0EE`)
- **Secondary Surface Accent:** Warm Ivory Cream `#F7F4EC` (Muted `#F9F7F1`, Active Nav `#EFECE2`)
- **Primary Canvas:** Absolute White `#FFFFFF`
- **Neutral Text Primary:** Technical Charcoal `#1A2220`
- **Neutral Text Secondary:** Medium Slate `#52605D`
- **Neutral Text Muted:** Warm Gray `#7C8B87`
- **Structural Borders:** Architectural Warm Gray `#E2DDD2` (Subtle hairline `#EDE9E0`)

### Energy Generation & Asset Vectors
- **Solar PV:** Warm Golden Amber `#D97706` (Fill Tint `#FEF3C7`)
- **Wind Generation:** Industrial Cyan/Teal `#0284C7` (Fill Tint `#E0F2FE`)
- **Battery Discharge (BESS Out):** Rich Royal Blue `#2563EB` (Fill Tint `#DBEAFE`)
- **Battery Charge (BESS In):** Calibrated Sky Blue `#60A5FA` (Fill Tint `#EFF6FF`)
- **Diesel GenSet:** Vibrant Industrial Orange `#EA580C` (Fill Tint `#FFEDD5`)
- **Grid Import/Export:** Deep Purple Neutral `#6366F1`

### Solver & Operational States
- **Optimal / System Ready / Valid:** Background `#ECFDF5`, Border `#A7F3D0`, Text `#065F46`, Indicator Dot `#10B981`
- **Emergency / Unmet Load:** Background `#FFF1F2`, Border `#FECDD3`, Text `#9F1239`, Indicator Dot `#E11D48`
- **Validating / Warning:** Background `#FEF3C7`, Border `#FDE68A`, Text `#92400E`, Indicator Dot `#F59E0B`
- **Running / Simulating:** Background `#EFF6FF`, Border `#BFDBFE`, Text `#1E40AF`, Indicator Dot `#3B82F6`
- **Draft / Inactive:** Background `#F1F5F9`, Border `#E2E8F0`, Text `#475569`, Indicator Dot `#94A3B8`
- **Constraint Violation / Error:** Background `#FEF2F2`, Border `#FECACA`, Text `#991B1B`, Indicator Dot `#EF4444`

## Typography

The typographical hierarchy is engineered for data-dense telemetry and real-time linear programming outputs.

- **Primary Typeface:** `Geist` handles interface structures, labels, headings, and qualitative analytical context with geometric clarity and neutral proportions.
- **Monospaced Numerical System:** `JetBrains Mono` governs all telemetry metrics, mathematical parameters, load units (kW, MWh, Hz), timestamps, and solver objective values.
- **Numerical Alignment:** All numerical tabular cells, dispatch values, and currency parameters must use tabular lining figures (`font-variant-numeric: tabular-nums`) and be aligned right.
- **Micro-Metadata:** Sub-headers, category tags, and system hardware attributes utilize `label-uppercase` styled in uppercase with intentional letter spacing (`0.06em`) to preserve legibility at micro dimensions.

## Layout & Spacing

The workspace enforces a fixed-panel, high-density desktop cockpit with fluid inner canvas expansion:

- **Global Viewport Composition:**
  - **Fixed Sidebar:** 240px wide on desktop (collapsible to 64px icon rail), resting on `#FFFFFF` with a structural right border (`1px solid #E2DDD2`).
  - **Top Operational Navbar:** 52px height, anchored to the upper canvas containing site selector, live telemetry sync status, alerting hub, and operator identifier.
  - **Primary Content Viewport:** Fluid multi-column analytical dashboard with responsive auto-reflow.
  - **Simplex Status Rail:** 36px fixed bottom bar anchored to the lower viewport, displaying active linear solver status, convergence iterations, and gap percentages.
- **Grid Architecture:** 12-column dynamic CSS grid with fixed 16px to 20px gutters. Sub-panels utilize nested flex layouts with strict `0.5rem` (`space-sm`) and `0.75rem` (`space-md`) interior padding to maximize above-the-fold telemetry density.

## Elevation & Depth

To sustain a clinical and objective appearance, depth is established through micro-borders and soft ambient surface shifts rather than prominent cast shadows.

- **Surface Layer 0 (Canvas):** `#FFFFFF` pure workspace canvas.
- **Surface Layer 1 (Cards & Modules):** `#FFFFFF` framed by a calibrated `1px solid #E2DDD2` border with a subtle diffuse tint: `0 1px 2px rgba(13, 87, 72, 0.03)`.
- **Surface Layer 2 (Warm Accents & Insets):** `#F7F4EC` or `#F9F7F1` used for chart control headers, active parameter containers, and table summary rows.
- **Surface Layer 3 (Dropdowns & Popovers):** `#FFFFFF` with a crisp border `1px solid #D8D2C5` and light ambient diffusion: `0 8px 16px -4px rgba(26, 34, 32, 0.08)`.
- **Active Selection Focus:** Active rows and card focus states utilize a double ring: `0 0 0 1px #0D5748` with no color wash.

## Shapes

The interface balances sharp technical hardware enclosures with accessible modern software aesthetics:

- **Primary Cards & Containers:** 10px (`0.625rem`) to 12px (`0.75rem`) border radius, creating clean modular framing for graphs, dispatch tables, and metric stacks.
- **Interactive Controls (Buttons, Text Inputs, Segment Selectors):** 6px to 8px radius for crisp mechanical distinction.
- **Status Pills & Generation Tags:** Full pill radius (`9999px`) to immediately signal categorical classification.
- **Chart Series:** Subtle rounded caps on stacked generation bar charts (2px radius on top segment) and smooth curve tension (0.2 monotone cubic spline) on load profiles.

## Components

### Buttons
- **Primary:** Background `#0D5748`, text `#FFFFFF`, radius 8px, padding 8px 14px. Hover `#083E34`. Active `#052822`. Includes 14px monospaced or Geist medium typography.
- **Secondary / Ivory:** Background `#F7F4EC`, border `1px solid #E2DDD2`, text `#1A2220`. Hover `#EFECE2`.
- **Ghost / Tool:** Background transparent, text `#52605D`, hover background `#F9F7F1`, text `#1A2220`.

### Status Indicators & Pills
- Compact height (22px), inline-flex alignment, 6px padding horizontal.
- Structure: 6px circular status dot on the left, followed by 11px uppercase bold status label.
- Color matrix matches defined operational states (e.g., Optimal: `#ECFDF5` container, `#10B981` dot, `#065F46` label).

### Data Input & Parameter Sliders
- **Numeric Fields:** Tabular mono font, background `#FFFFFF`, border `1px solid #E2DDD2`, 8px vertical/horizontal inset padding. Unit affix (e.g., `kW`, `$/kWh`) locked to right edge in `#7C8B87`. Focus border `#0D5748` with 1px outline offset.
- **Micro-Sliders:** 4px track height in `#E2DDD2`, fill progress in `#0D5748`, 14px circular white thumb with `1px solid #0D5748` and subtle drop shadow.

### Analytical Data Cards
- Container white `#FFFFFF`, border `1px solid #E2DDD2`, internal padding 16px.
- **Header:** Uppercase metadata title (`label-uppercase`), right-aligned auxiliary unit or real-time timestamp in `JetBrains Mono`.
- **Metric Readout:** Large monospaced display (`metric-mono-lg`), paired with delta indicators (+/- % change) in appropriate directional semantic colors.

### Dispatch Charts & Sparklines
- Chart canvas resting on white. Gridlines styled with dashed `1px #EDE9E0`.
- Vector fills: Soft linear vertical gradients transitioning from 20% opacity at peak to 2% opacity at base axis.
- Tooltips: Monospaced values with micro color swatches for each generation asset (Solar, Wind, Battery, Diesel).

### Sticky Solver Status Bar
- Fixed 36px bottom rail. Background `#F9F7F1`, top border `1px solid #E2DDD2`.
- Items aligned horizontally with divider ticks: Solver Engine Name (e.g., `HiGHS LP-Simplex`), Status Dot, Iteration Count, Duality Gap (`< 0.01%`), and Computation Time (`42ms`).