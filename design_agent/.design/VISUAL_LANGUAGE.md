# VISUAL LANGUAGE
> The aesthetic vocabulary of the product. Derived from BRAND_TONE.md + UX_PRINCIPLES.md.
> Every visual decision justified by purpose, not trend.

---

## DERIVATION CHAIN

```
Emotional Register:  Intelligent / Quiet
  (from PRODUCT_ESSENCE: Dev Tool + high trust + expert-dense)

Trust Level:         High — code output will be committed to CI

Voice Attributes:    Precise, Direct, Minimal
  (from BRAND_TONE)

────────────────────────────────────────
→ Color Temperature:     Cool (blue-shifted neutrals)
→ Typography Weight:     Light-to-Medium (precision, not aggression)
→ Border Radius:         6px (moderate — structured but not clinical)
→ Iconography Style:     Outline, geometric (technical precision)
→ Surface Treatment:     Tonal separation (4 dark levels — IDE-like depth)
→ Shadow Philosophy:     Minimal — overlays only, not decoration
```

---

## COLOR PHILOSOPHY

### Guiding Principle

Color carries function. Every color in the system maps to exactly one:

| Function | Usage in Visual Test Builder |
|----------|-----|
| **Identity** | `#4f8cff` — accent blue (interactive elements, selection state) |
| **Hierarchy** | Surface levels (`--bg` → `--surface` → `--surface-2` → `--surface-3`) guide depth |
| **State** | Green = pass/active, Amber = warning/afterHook, Red = error/fail |
| **Separation** | Borders (`--border`, `--border-2`) separate panels and components |

### Anti-Pattern Flags for This Product
- Using the blue accent for anything that is not interactive or selected
- Adding decorative gradients to the header or sidebar (destroys the clean dark aesthetic)
- Using green for any purpose other than test pass / success state
- Random opacity values that create colors not in the token system

---

## COLOR SYSTEM STRUCTURE

### Actual Token Values (from styles.css — current implementation)

```
Dark Surface Stack:
  --bg:        #0f1115    ← Page background (near-black, blue-gray tinted)
  --surface:   #181b22    ← Panel background
  --surface-2: #1f242e    ← Card/input/step-row background
  --surface-3: #252b38    ← Hover/elevated element background

Border Stack:
  --border:    #2a303c    ← Standard border (subtle)
  --border-2:  #353d4f    ← Stronger border (focused, hover)

Text Stack:
  --text:      #e6e8ee    ← Primary text (cool white)
  --muted:     #8a93a6    ← Secondary text (labels, helper, captions)

Accent:
  --accent:    #4f8cff    ← Blue — interactive, selected state

Semantic States:
  --green:     #4ade80    ← Test PASSED, active, success
  --yellow:    #facc15    ← Warning, afterHook indicators
  --danger:    #ef4444    ← Test FAILED, validation error, destructive action

Code Background:
  #0b0d12                 ← Deeper dark for code/log blocks (not tokenized — should be)
```

### Accent Color Ramp (derived from --accent: #4f8cff)

```
accent.50:   #eef4ff    ← Subtle background tints
accent.100:  #dce8ff
accent.200:  #b8d0ff
accent.300:  #93bbff    ← Used for beforeAll/beforeEach hook label color
accent.400:  #6fa5ff
accent.500:  #4f8cff    ← BASE — matches --accent
accent.600:  #3a7de8    ← Hover state (currently hardcoded in run-btn)
accent.700:  #2b6fd0
accent.800:  #1e5cb5
accent.900:  #144a99
```

### Color Temperature

**Cool** — The blue-gray dark palette with a blue accent creates a precise, technical
emotional register. This is intentional for a developer tool. It communicates:
"This tool is built with engineering discipline."

Dark-mode-native. No light mode planned for MVP.

```yaml
color_signal:
  temperature:       cool
  accent_count:      1
  dark_mode:         native-only (dark mode IS the product, not an option)
  surface_style:     tonal-layered (4-level dark surface stack)
```

---

## TYPOGRAPHY PHILOSOPHY

### Typeface Decisions

**UI Font:** System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- Zero load cost, zero font flash
- System fonts at 13px are optimized for dense data on each platform
- Matches IDE aesthetic (VS Code, terminal, DevTools — all use system fonts)
- Consistency with the user's existing tooling environment

**Code Font:** `'Fira Code', 'Menlo', monospace`
- Used exclusively for: command names, selector values, generated code, execution logs
- Ligature support in Fira Code improves readability of `=>`, `===`, `!==`
- Clear visual separation between "UI text" (sans) and "code content" (mono)

**Pairing rule:** Exactly 2 typefaces. System sans for UI, monospace for code. Never more.

### Type Scale (Current — 13px base, dense tool sizing)

```
10px  — Counter badges, step index, hook step counts, palette group labels
11px  — Fine labels, field labels, inline errors, action buttons, timestamps
12px  — Standard component text (steps, palette items, config values, history rows)
13px  — Base body size, canvas inputs, analytics stats
15px  — App header (product name)
16px  — Stat values in analytics
20px  — Large analytics numbers (stat-val)
```

**Scale note:** 13px base (not 16px) is correct for this product category. IDEs, terminal
emulators, and developer dashboards use 12-14px as their working density. This is not
a consumer product — do not inflate to 16px base.

### Typography Rules for This Product

```
Dense UI text (steps, config, palette):   12px sans, weight 500, line-height 1.3
UI labels (field-label, panel-title):     11px sans, weight 600, uppercase + 0.6px tracking
Code / command labels:                    12px monospace, --accent color
Muted metadata:                           11-12px sans, --muted color
Section headers:                          11px, weight 700, uppercase, 0.6-0.8px tracking
Stats/numbers:                            16-20px sans, weight 700
```

---

## BORDER RADIUS

```
Current: 6px (--radius: 6px) — applied uniformly across components
```

**Character:** 6px is the "balanced professional" choice. Not sharp (which would read
as cold/clinical), not rounded (which would read as consumer/friendly). Correct for
a dev tool that has approachability but is fundamentally a precision instrument.

**Special cases:**
- `3px` — Very small inline elements: `.suite-icon`, `.test-icon`, `.chain-badge`
- `4px` — Small interactive elements: `.step-row`, `.suite-action-btn`
- `6px` — Standard: inputs, buttons, cards, panels (= `--radius`)
- `8px` — Larger containers: `.canvas-drop`, `.suite-block`, code blocks
- `10px` — Pill-like: step count badges (`.border-radius: 10px`)

**Consistency rule:** Inputs and buttons share `--radius` (6px). ✓ Currently correct.

```yaml
radius_signal:
  base_radius:    6px
  character:      balanced professional
  pill_allowed:   yes — for count badges/chips only, not buttons
```

---

## SHADOW SYSTEM

**Philosophy:** Minimal. Surfaces are separated by color value, not shadow. Shadow only
appears for floating elements (overlays, dropdowns) that must communicate elevation above content.

**Current usage:**
- `.hook-menu`: `0 4px 16px rgba(0,0,0,0.4)` — correct, this is a floating dropdown
- Everything else: no shadow — surfaces separated by tonal value

**Rule:** In dark mode, elevation should be communicated through lightness (lighter = higher),
not shadow. The current 4-level surface stack (`--bg` → `--surface-3`) handles this.

---

## ICONOGRAPHY

**Current state:** Text-based icons (emoji: ✓, ✗, ⋮) and monospace abbreviations (IT, S,
BEA, AA labels). No icon library.

**Assessment:** The text-based approach creates a consistent aesthetic: everything on screen
is text. This reinforces the "code as UI" concept. However:
- Icon-only buttons (`×` remove buttons) lack `aria-label`
- Drag handles use text `⋮⋮` which is fragile at different zoom levels

**Recommended direction:** Lucide Icons (outline, 2px stroke, geometric)
- Matches the precise character of the product
- Available as React components (`lucide-react`)
- One family → no mixing risk
- Sizes: 14px inline, 16px in buttons, 20px in empty states

**If sticking with text-based approach:** Add `aria-label` to all icon-only buttons.

```yaml
visual_signal:
  color_temperature:      cool
  typeface_category:      system (UI) + mono (code)
  type_scale_ratio:       1.2 (Minor Third — correct for dense data tool)
  border_radius_base:     6px
  surface_approach:       tonal (4-level dark stack)
  icon_style:             outline (target: Lucide) / currently text-based
  icon_family:            lucide-react (recommended) / text-based (current)
  shadow_depth:           minimal (overlay-only)
  animation_presence:     micro-only (150ms transitions on hover/state changes)
```

---

## SURFACE TREATMENT

**Approach: Tonal Separation** — the correct approach for dark-mode-native tools.

The 4-level dark stack creates spatial hierarchy through value alone:

```
Level 0:  --bg (#0f1115)        ← Page itself — the "floor"
Level 1:  --surface (#181b22)   ← Panels (palette, canvas, config, tabs)
Level 2:  --surface-2 (#1f242e) ← Cards, step rows, history rows, inputs
Level 3:  --surface-3 (#252b38) ← Suite headers, hover states, elevated controls
```

This is correct. Each level reads as "one step closer to the user."

**Special case:** Code/log blocks use `#0b0d12` — actually *below* `--bg` in value.
This communicates "this is a terminal/output area, separate from the UI."
This value should be tokenized as `--surface-code` or `--surface-terminal`.
