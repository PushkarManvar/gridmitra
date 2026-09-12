---
name: Grid Intelligence Interface
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4944'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6f7973'
  outline-variant: '#bec9c2'
  surface-tint: '#1b6b51'
  primary: '#004532'
  on-primary: '#ffffff'
  primary-container: '#065f46'
  on-primary-container: '#8bd6b7'
  inverse-primary: '#8bd6b6'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#5e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#804300'
  on-tertiary-container: '#ffb87e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f2d1'
  primary-fixed-dim: '#8bd6b6'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#00513b'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a high-precision, technical climate-tech interface designed for microgrid operators, energy analysts, and systems engineers. The aesthetic combines algorithmic clarity with rigorous environmental utility. The visual mood is calm, authoritative, and data-dense, rejecting ornamental fluff in favor of high-legibility telemetry and crisp computational balance.

The visual style blends structural minimalism with technical instrumentation:
- **Architectural Scaffolding:** Clean, modular grid compartments built with fine mechanical rules and micro-surfaces.
- **Instrument Precision:** Monospaced data readouts paired with structural, geometric headers and developer-grade body text.
- **Ecological Purpose:** Deep forest emerald anchored against off-white canvas surfaces, using restrained chromatic indicators for real-time power generation flows (solar, wind, storage).

## Colors

The palette leverages high-contrast functional roles rooted in electrical topology and renewable source telemetry:

- **Primary (`#065F46` - Deep Forest Emerald):** Applied to root actions, primary node activations, brand anchoring, and baseline state representations.
- **Secondary (`#0284C7` - Wind Cyan):** Reserved for wind kinetics, power export dynamics, and technical diagnostic linkages.
- **Tertiary (`#D97706` - Solar Amber):** Deployed selectively for solar photovoltaic feeds, peak warnings, and energy throttling indices.
- **Neutral (`#0F172A` - Slate Charcoal):** Primary text and dense telemetry outputs, calibrated for crisp readability on high-resolution displays.
- **Canvas & Containers:** Base canvas rests on off-white (`#F8F9FA`), elevating layered panels to pure white (`#FFFFFF`) with subtle boundary strokes (`#E2E8F0`). Soft mint tints (`#ECFDF5`) indicate nominal loop performance and efficiency metrics.

## Typography

The type hierarchy balances algorithmic structure and operational legibility.

- **Headlines (Space Grotesk):** Provides architectural authority and geometric precision. Tight negative letter-spacing on display scales gives analytical dashboards an authoritative technical punch.
- **Body & Telemetry (Geist):** Handles tabular telemetry, operational logs, microgrid switchboard metrics, and narrative documentation with zero visual fatigue and consistent vertical metrics.
- **Numbers & Readouts:** Metric labels and live data streams leverage `label-md` and `label-sm` with tabular character alignment (`font-variant-numeric: tabular-nums`) to prevent jitter across continuous real-time feeds.

## Layout & Spacing

The layout operates on a strict 8-point base grid, aligning high-frequency telemetry into structural modules:

- **Desktop Layout:** A 12-column fluid grid system with `1.5rem` gutters and `2rem` margins. Side panels for microgrid topology and controls dock into rigid 4-column blocks, while dynamic optimization charts occupy 8-column segments.
- **Tablet Layout:** Converts to an 8-column configuration with dynamic reflow of peripheral instrumentation beneath primary optimization curves.
- **Mobile Layout:** Collapses to a 4-column stack with `1rem` margins and `1rem` gutters. Critical operational switches and immediate dispatch alerts pin to the persistent top and bottom zones.

## Elevation & Depth

Visual hierarchy is maintained via fine structural outlines and tactile tonal layering rather than intense drop shadows:

- **Base Layer:** The canvas surface sits at `#F8F9FA`.
- **Card and Module Surfaces:** Instruments and cards sit on `#FFFFFF` bordered by a 1px crisp outline of `#E2E8F0`.
- **Micro Shadows:** Surface elevation utilizes ultra-diffused, ambient micro-shadows:
  - *Level 1 (Cards, metric panels):* `0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.02)`
  - *Level 2 (Active popovers, control drawers):* `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`
  - *Level 3 (Modal configuration layers):* `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`
- **Divider Treatment:** Internal module sections separate via clean 1px borders (`#F1F5F9`) without shadow displacement.

## Shapes

The geometric language emphasizes engineered precision with controlled soft radii. With a roundedness index of `1`, structural elements remain architectural and disciplined:

- **Base Components (Buttons, Chips, Inputs):** Set to `0.25rem` (4px) to retain technical sharpness.
- **Modules & Structural Cards:** Scale to `rounded-lg` (`0.5rem` / 8px) or `rounded-xl` (`0.75rem` / 12px) for larger viewport canvases, establishing a contained perimeter for complex datasets.
- **Interactive Toggles & Nodes:** Subtle rounding reinforces tangible hardware switches without drifting into playful or consumer-grade pill styling.

## Components

### Buttons & Action Controls
- **Primary Dispatch:** Solid `#065F46` fill, `#FFFFFF` text, `0.25rem` radius. Subtle hover shift to `#044E3A` with a micro shadow transition. Focus state reveals a 2px ring offset in `#A7F3D0`.
- **Secondary / Secondary Source Action:** Translucent `#F0FDF4` background with `#065F46` border and text.
- **Tertiary Utility:** Borderless slate `#475569` text with `#F1F5F9` background on hover.

### Chips & Telemetry Badges
- **Status Indicators:** Tight vertical padding (`space-xs`), `0.25rem` border radius, uppercase `label-sm` font.
- **Solar Node Badge:** `#FEF3C7` background with `#D97706` text and border.
- **Wind Node Badge:** `#E0F2FE` background with `#0284C7` text and border.
- **Grid Stability Badge:** `#ECFDF5` background with `#065F46` text and border.

### Form Inputs & Selectors
- **Input Fields:** Crisp `#FFFFFF` background encased in a 1px `#E2E8F0` stroke, transitioning to a `#065F46` boundary with an emerald-tinted outer glow (`0 0 0 1px #065F46`) on active focus. Typographic entries utilize `Geist` at `14px` (`body-md`).

### Checkboxes & Toggle Switches
- **Checkboxes:** Square profile with `2px` corner radius. Unchecked: 1px `#CBD5E1` border. Checked: `#065F46` fill with sharp white check vector.
- **Switch Controls:** Compact mechanical sliders with a 14px indicator track, transitioning from neutral muted slate to active forest teal.

### Data Cards & Modules
- **Metric Tiles:** Crisp pure-white card with a 1px `#E2E8F0` border, micro shadow elevation, containing a subdued label (`label-md` in `#64748B`), bold numeric telemetry (`Space Grotesk` at `28px`), and a contextual real-time sparkline or differential delta badge.