# DESIGN SYSTEM (archived reference)
> **Archived** from the retired `design_agent/.design/` framework. Kept because these token
> values are reflected in `frontend/src/styles.css`. The live source of truth is the CSS
> custom properties in `frontend/src/styles.css`; this file is reference/rationale only.
> Tokens, scales, and semantic mappings.

---

## HOW TO USE THIS FILE

1. These values live as CSS custom properties in `frontend/src/styles.css` (no Tailwind — raw CSS)
2. Semantic tokens map to primitive tokens
3. Never use primitive tokens in components — always use semantic tokens
4. When adding a token: add primitive first, then semantic layer, then update `frontend/src/styles.css`

---

## COLOR TOKENS

### Primitive Palette

```
Neutral (Dark-Mode Native):
  neutral.0:     #ffffff
  neutral.50:    #f8f9fb
  neutral.100:   #f0f2f5
  neutral.200:   #e6e8ee    ← = --text (primary text color)
  neutral.300:   #c8cdd8
  neutral.400:   #8a93a6    ← = --muted (secondary text color)
  neutral.500:   #5c6478
  neutral.600:   #3d4455
  neutral.700:   #353d4f    ← = --border-2
  neutral.800:   #2a303c    ← = --border
  neutral.850:   #252b38    ← = --surface-3
  neutral.900:   #1f242e    ← = --surface-2
  neutral.925:   #181b22    ← = --surface
  neutral.950:   #0f1115    ← = --bg (page background)
  neutral.975:   #0b0d12    ← = surface-code (code blocks, terminal output)
  neutral.1000:  #000000

Accent (Blue):
  accent.50:    #eef4ff
  accent.100:   #dce8ff
  accent.200:   #b8d0ff
  accent.300:   #93bbff    ← Used for beforeAll/beforeEach hook labels
  accent.400:   #6fa5ff
  accent.500:   #4f8cff    ← BASE — = --accent
  accent.600:   #3a7de8    ← Hover state
  accent.700:   #2b6fd0
  accent.800:   #1e5cb5
  accent.900:   #144a99

Success (Green):
  success.50:   #f0fdf4
  success.100:  #dcfce7
  success.500:  #4ade80    ← = --green (test PASSED, active state)
  success.600:  #22c55e
  success.700:  #15803d

Warning (Amber):
  warning.50:   #fffbeb
  warning.100:  #fef3c7
  warning.500:  #facc15    ← = --yellow (warning, afterHook color)
  warning.600:  #d97706
  warning.700:  #b45309

Danger (Red):
  danger.50:    #fef2f2
  danger.100:   #fee2e2
  danger.500:   #ef4444    ← = --danger (test FAILED, validation error)
  danger.600:   #dc2626
  danger.700:   #b91c1c
```

### Semantic Color Tokens

```css
:root {
  /* ─── Surfaces ─────────────────────────────────────────── */
  --color-surface-floor:     neutral.975;  /* Code/log blocks — below page */
  --color-surface-page:      neutral.950;  /* Page background */
  --color-surface-panel:     neutral.925;  /* Main panels */
  --color-surface-card:      neutral.900;  /* Step rows, cards, inputs */
  --color-surface-raised:    neutral.850;  /* Suite headers, hover states */

  /* ─── Content / Text ────────────────────────────────────── */
  --color-text-primary:      neutral.200;  /* Primary text */
  --color-text-secondary:    neutral.400;  /* Labels, helper text, muted */
  --color-text-inverted:     neutral.950;  /* Text on light surfaces */
  --color-text-link:         accent.500;   /* Interactive text */
  --color-text-code:         accent.500;   /* Command names, selectors in UI */

  /* ─── Interactive ───────────────────────────────────────── */
  --color-accent:            accent.500;   /* Primary interactive color */
  --color-accent-hover:      accent.600;   /* Hover */
  --color-accent-active:     accent.700;   /* Pressed */
  --color-accent-subtle:     rgba(79,140,255,0.06);  /* Selection tint */
  --color-accent-border:     rgba(79,140,255,0.4);   /* Selected border */

  /* ─── Borders ───────────────────────────────────────────── */
  --color-border:            neutral.800;  /* Standard border */
  --color-border-strong:     neutral.700;  /* Focused/hover border */
  --color-border-subtle:     rgba(42,48,60,0.5); /* Very subtle */

  /* ─── Hook Type Colors ──────────────────────────────────── */
  --color-hook-before:       accent.300;   /* beforeAll / beforeEach label */
  --color-hook-after:        warning.500;  /* afterEach / afterAll label */

  /* ─── State ─────────────────────────────────────────────── */
  --color-state-success:     success.500;  /* = --green */
  --color-state-warning:     warning.500;  /* = --yellow */
  --color-state-danger:      danger.500;   /* = --danger */
  --color-state-success-bg:  rgba(74,222,128,0.1);
  --color-state-warning-bg:  rgba(250,204,21,0.08);
  --color-state-danger-bg:   rgba(239,68,68,0.08);
  --color-state-danger-border: rgba(239,68,68,0.35);
}
```

---

## TYPOGRAPHY TOKENS

### Font Families

```yaml
font:
  sans:  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  mono:  "'Fira Code', 'Menlo', monospace"
  serif: not used
```

### Font Size Scale (13px base — dense dev tool)

```yaml
text:
  9px:   0.5625rem   # Collapse arrows, drag handle fine detail
  10px:  0.625rem    # Counters, palette group labels, badge counts
  11px:  0.6875rem   # Field labels, inline errors, timestamps, action buttons
  12px:  0.75rem     # Primary component text (steps, config, history)
  13px:  0.8125rem   # Base body, canvas inputs
  14px:  0.875rem    # Remove buttons (×), remove icons
  15px:  0.9375rem   # App header product name
  16px:  1rem        # Analytics stat values
  20px:  1.25rem     # Large analytics numbers
```

### Font Weight Scale

```yaml
weight:
  regular:   400   # Not used — min weight is medium for dense UI
  medium:    500   # Body text, step labels, names
  semibold:  600   # Headings, panel titles, button labels
  bold:      700   # Stat numbers, suite/test names, status badges
```

### Line Height Scale

```yaml
leading:
  none:    1.0    # Single-line badges, labels, step rows
  tight:   1.2    # Section headers
  snug:    1.3    # Dense data rows
  normal:  1.5    # Helper text, multi-line descriptions
```

### Letter Spacing

```yaml
tracking:
  normal:  0em       # Body text, step labels
  label:   +0.06em   # Uppercase panel titles / section headers
  badge:   +0.05em   # Badge text
```

### Semantic Type Roles (current product vocabulary)

```yaml
typography:
  app-title:
    size:     15px
    weight:   semibold
    leading:  none

  panel-title:
    size:     11px
    weight:   bold
    leading:  none
    tracking: label
    case:     uppercase
    color:    --color-text-secondary

  section-title:
    size:     10px
    weight:   bold
    leading:  none
    tracking: label
    case:     uppercase
    color:    --color-text-secondary

  body:
    size:     12px
    weight:   medium
    leading:  snug

  body-sm:
    size:     11px
    weight:   medium
    leading:  snug

  label:
    size:     11px
    weight:   medium
    leading:  none
    color:    --color-text-secondary

  code-label:
    size:     12px
    weight:   medium
    font:     mono
    color:    --color-accent

  stat-value:
    size:     20px
    weight:   bold
    leading:  none

  stat-label:
    size:     11px
    weight:   regular
    color:    --color-text-secondary
```

---

## SPACING TOKENS

```yaml
spacing:
  0:    0px
  px:   1px
  0.5:  2px
  1:    4px
  1.5:  6px
  2:    8px
  2.5:  10px
  3:    12px
  3.5:  14px
  4:    16px
  5:    20px
  6:    24px
  8:    32px
  10:   40px
  12:   48px
  16:   64px
```

**Usage in this product:**
- Within step rows (icon-to-text gap): 6px
- Within panel headers: 10px vertical, 16px horizontal
- Between step rows: 2-4px
- Between suite blocks: 6px
- Panel internal padding: 14px
- Canvas internal padding: 14px
- Config/tab content padding: 14px

---

## BORDER RADIUS TOKENS

```yaml
radius:
  none:   0px
  xs:     3px    # Inline badges (suite-icon, test-icon, chain-badge)
  sm:     4px    # Small elements (step-row, suite-action-btn)
  md:     6px    # Standard: inputs, buttons, panels (= --radius)
  lg:     8px    # Larger containers (canvas-drop, suite-block, code blocks)
  xl:     10px   # Pill-like counters (step-count badges)
  full:   9999px # True pills (not currently in use)
```

---

## SHADOW TOKENS

```yaml
shadow:
  none:    none
  overlay: 0 4px 16px rgba(0,0,0,0.4)   # Hook menu, dropdowns (only usage in product)
```

**Dark mode note:** In dark mode, use near-black shadows at higher opacity (0.4 vs 0.1).
The current single `shadow.overlay` is correct.

---

## ANIMATION TOKENS

```yaml
duration:
  instant:     0ms
  micro:       100ms   # Hover glow, scale
  fast:        150ms   # Hover color transitions (current default)
  default:     200ms   # State changes
  slow:        300ms   # Rate bar fill animation

easing:
  out:         cubic-bezier(0.0, 0.0, 0.2, 1.0)   # Entrances
  in:          cubic-bezier(0.4, 0.0, 1.0, 1.0)   # Exits
  in-out:      cubic-bezier(0.4, 0.0, 0.2, 1.0)   # Transforms
  linear:      linear                               # Progress bars, rate bars
```

**Current implementation:** Most transitions use `0.15s` (=150ms). This is correct.

---

## Z-INDEX SCALE

```yaml
z:
  base:      0
  step-row:  1     # Step rows in DnD context
  dropdown:  10    # Hook menu dropdown (current: z-index: 10) ✓
  modal:     100   # (not used in MVP)
  toast:     200   # (not used in MVP)
```

---

## LAYOUT TOKENS

```yaml
layout:
  palette-width:       180px    # Left panel
  right-panel-width:   360px    # Right panel
  header-height:       44px     # App header (10px padding × 2 + content)
  panel-padding:       14px     # Standard panel padding
  input-height-sm:     28px     # Compact inputs (canvas header inputs)
  input-height-md:     32px     # Standard inputs
  tab-height:          36px     # Tab bar height (8px padding × 2 + 12px font)
```

---

## CSS CUSTOM PROPERTIES (Implementation)

Complete `:root` definition for `styles.css`:

```css
:root {
  /* Surfaces */
  --bg:          #0f1115;
  --surface:     #181b22;
  --surface-2:   #1f242e;
  --surface-3:   #252b38;
  --surface-code:#0b0d12;

  /* Borders */
  --border:      #2a303c;
  --border-2:    #353d4f;

  /* Text */
  --text:        #e6e8ee;
  --muted:       #8a93a6;

  /* Interactive */
  --accent:      #4f8cff;
  --accent-hover:#3a7de8;

  /* Hook colors */
  --hook-before: #93bbff;
  --hook-after:  #facc15;

  /* State */
  --green:       #4ade80;
  --yellow:      #facc15;
  --danger:      #ef4444;

  /* Structure */
  --radius:      6px;
  --radius-xs:   3px;
  --radius-sm:   4px;
  --radius-lg:   8px;
}
```
