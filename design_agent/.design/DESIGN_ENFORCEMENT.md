# DESIGN ENFORCEMENT
> Hard rules for all implementation agents and developers.
> No exceptions without a logged entry in DESIGN_DECISIONS.md.
> These rules are non-negotiable. Violations are reverted, not accommodated.

---

## HOW TO USE THIS FILE

Before committing any frontend change:
1. Read the relevant sections below
2. Verify your change does NOT violate any rule
3. If it does, fix the violation — do NOT add an exception
4. If a rule genuinely cannot be followed in a specific case, log the exception in
   DESIGN_DECISIONS.md with full rationale before proceeding

This file is checked during PR review and by the UI_DIFF_CHECKLIST.md validation gate.

---

## RULE SET 1 — COLOR ENFORCEMENT

### R1.1 — No hardcoded color values outside `:root`
```
VIOLATION:   background: #1f242e;
VIOLATION:   color: rgba(79, 140, 255, 0.4);
VIOLATION:   border-color: #3a7de8;

CORRECT:     background: var(--surface-2);
CORRECT:     color: var(--accent-border);
CORRECT:     border-color: var(--accent-hover);
```

**Enforcement:** Run `grep -n '#[0-9a-fA-F]\{3,8\}' frontend/src/styles.css` after any CSS change.
Expected result: matches only inside the `:root { }` block.

### R1.2 — No inline style colors in JSX
```
VIOLATION:   <div style={{ color: '#4f8cff' }}>
VIOLATION:   <div style={{ background: 'rgba(79,140,255,0.1)' }}>

CORRECT:     <div className="text-accent">
CORRECT:     Define a CSS class with the semantic token
```

### R1.3 — No decorative gradients
```
VIOLATION:   background: linear-gradient(135deg, var(--accent), #9b59b6);
VIOLATION:   background: linear-gradient(to right, var(--surface), var(--surface-3));

ALLOWED:     background: linear-gradient(...) on skeleton shimmer animation only
ALLOWED:     background: linear-gradient(to bottom, transparent, var(--bg)) on fade-out overlays
```

### R1.4 — Single accent color
```
VIOLATION:   Adding a second brand/accent color that isn't --accent, --green, --yellow, or --danger
             (those four are the complete semantic state color set)

RULE:        --accent (#4f8cff) = interactive and selected state ONLY
             --green = success / test PASSED
             --yellow = warning / afterHook lifecycle color
             --danger = error / test FAILED / destructive action
             No color may cross semantic boundary (no green for "add", no accent for "active status")
```

### R1.5 — Contrast minimum
```
RULE:        Text on any background must meet WCAG AA minimum:
             Normal text (< 18pt): contrast ratio ≥ 4.5:1
             Large text (≥ 18pt or 14pt bold): contrast ratio ≥ 3:1

VERIFY:      --text (#e6e8ee) on --surface-2 (#1f242e) = 9.3:1 ✓
             --muted (#8a93a6) on --surface-2 (#1f242e) = 4.3:1 ✓ (borderline — do not darken --muted further)
             New text colors must be checked before use.
             Tool: https://webaim.org/resources/contrastchecker/
```

---

## RULE SET 2 — SPACING ENFORCEMENT

### R2.1 — Values from 4px base scale only
```
ALLOWED VALUES: 0, 1px, 2px, 4px, 6px, 8px, 10px, 12px, 14px, 16px, 20px, 24px, 28px,
                32px, 40px, 48px, 56px, 64px, 80px, 96px

VIOLATION:   padding: 5px 8px;
VIOLATION:   margin-top: 7px;
VIOLATION:   gap: 11px;
VIOLATION:   Tailwind arbitrary: p-[17px], mt-[13px]

NEAREST CORRECT:
  5px  → 4px or 6px (choose based on optical preference, document if non-obvious)
  7px  → 6px or 8px
  9px  → 8px or 10px
  11px → 10px or 12px
  13px → 12px or 14px
```

### R2.2 — No spacer divs
```
VIOLATION:   <div style={{ height: 16 }} />
VIOLATION:   <div className="spacer" />

CORRECT:     Add gap/margin/padding to parent using scale values
```

### R2.3 — No negative margin hacks
```
VIOLATION:   margin-top: -4px;
VIOLATION:   margin-left: -1px;  (exception: -1px for overlap-border patterns only)

CORRECT:     Fix the layout that requires negative compensation
```

---

## RULE SET 3 — TYPOGRAPHY ENFORCEMENT

### R3.1 — Font size from defined scale only
```
ALLOWED:     9px, 10px, 11px, 12px, 13px, 14px, 15px, 16px, 20px
             (see DESIGN_SYSTEM.md → Font Size Scale)

VIOLATION:   font-size: 8px;
VIOLATION:   font-size: 17px;
VIOLATION:   font-size: 0.9rem;  (use px values for consistency in this CSS-native project)
```

### R3.2 — No letter-spacing on body text
```
VIOLATION:   .step-label { letter-spacing: 0.3px; }

ALLOWED:     letter-spacing on: uppercase labels, badges, panel titles
             ONLY when text-transform: uppercase is also applied
```

### R3.3 — Monospace font for code elements only
```
RULE:        font-family with 'Fira Code' or monospace must ONLY be used on:
             - Command names / cy.xxx labels
             - Selector values displayed in UI
             - Generated code output
             - Execution log content
             - Import/export textarea

VIOLATION:   Using monospace on navigation, panel titles, or regular UI text
```

### R3.4 — No italic in UI labels
```
VIOLATION:   .field-label { font-style: italic; }

ALLOWED:     font-style: italic on: .field-hint (helper text showing examples)
             italic is semantic emphasis — only for that purpose
```

### R3.5 — Font weight from defined scale
```
ALLOWED:     400 (regular), 500 (medium), 600 (semibold), 700 (bold)

VIOLATION:   font-weight: 300;   (too light for dark theme)
VIOLATION:   font-weight: 800;   (not in scale)
VIOLATION:   font-weight: 900;
```

---

## RULE SET 4 — BORDER RADIUS ENFORCEMENT

### R4.1 — Radius from defined scale
```
ALLOWED VALUES (from DESIGN_SYSTEM.md):
  --radius-xs: 3px   → tiny inline badges
  --radius-sm: 4px   → small interactive elements
  --radius:    6px   → standard (inputs, buttons, panels)
  --radius-lg: 8px   → larger containers
  9999px             → pill (count badges only)

VIOLATION:   border-radius: 5px;
VIOLATION:   border-radius: 10px;   (unless documented as pill-like badge)
VIOLATION:   border-radius: 2px;
VIOLATION:   border-radius: 12px;
```

### R4.2 — Consistent radius within component families
```
RULE:        All inputs use --radius (6px).
             All standard buttons use --radius (6px).
             These two MUST match — they form a visual family.

VIOLATION:   Inputs at 6px, buttons at 4px — breaks visual cohesion.
```

---

## RULE SET 5 — SHADOW ENFORCEMENT

### R5.1 — Shadow only for floating overlays
```
ALLOWED:     Dropdowns, tooltip, context menus that float ABOVE other content
             Current only: .hook-menu { box-shadow: 0 4px 16px rgba(0,0,0,0.4); }

VIOLATION:   Adding box-shadow to cards or step rows for visual depth
             (use tonal surface separation instead — see VISUAL_LANGUAGE.md)

VIOLATION:   Decorative colored shadows (box-shadow: 0 4px 16px var(--accent))
```

### R5.2 — Shadow value form
```
CORRECT:     box-shadow: 0 Xpx Ypx rgba(0,0,0,0.N);
             Keep it neutral black with opacity.

VIOLATION:   box-shadow with colored offset (uses brand color as shadow)
VIOLATION:   inset box-shadow for non-interactive depressed elements
```

---

## RULE SET 6 — ACCESSIBILITY ENFORCEMENT

### R6.1 — No outline:none without replacement
```
VIOLATION:   button:focus { outline: none; }
VIOLATION:   *:focus { outline: none; }

CORRECT:     button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
             (Use :focus-visible not :focus — :focus fires on mouse click too)
```

### R6.2 — Icon-only buttons require aria-label
```
VIOLATION:   <button>×</button>
VIOLATION:   <button>⋮</button>

CORRECT:     <button aria-label="Remove step">×</button>
             <button aria-label="More options">⋮</button>
```

### R6.3 — No color-only state communication
```
VIOLATION:   Red text as the only signal for an error (must also have text or icon)
VIOLATION:   Green color as the only signal for success

CORRECT:     Error border + error message text below field
             Success badge with text label ("PASSED") + color
```

### R6.4 — Dynamic content requires aria-live
```
RULE:        Any content that updates without user action needs aria-live.

EXAMPLES in this project:
  - Execution log (SSE stream) → aria-live="polite"
  - Test status badge (RUNNING/PASSED/FAILED) → aria-live="assertive"
  - Save status text ("Saved ✓") → aria-live="polite"
```

### R6.5 — Minimum touch target 44×44px (not applicable — desktop tool)
```
EXCEPTION LOGGED: This is a desktop-only developer tool (see DESIGN_DECISIONS.md #7).
                  44×44px touch target rule does not apply to the current scope.
                  If mobile support is ever added, this rule becomes active.
```

---

## RULE SET 7 — INTERACTION ENFORCEMENT

### R7.1 — All transitions use defined duration + easing
```
ALLOWED:
  transition: [property] 0.1s ease-out;    (micro — hover glow)
  transition: [property] 0.15s ease-out;   (fast — standard hover)
  transition: [property] 0.2s ease-out;    (default — state change)
  transition: [property] 0.3s ease-in-out; (slow — deliberate)

VIOLATION:   transition: all 0.5s ease;
VIOLATION:   transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); (bounce)
VIOLATION:   Transition duration > 400ms
```

### R7.2 — No animation without purpose
```
RULE:        Every animation must serve one of: spatial, feedback, orientation, continuity
             (see INTERACTION_RULES.md → Motion Serves Four Functions)

VIOLATION:   Entrance animation on page load (logo, header)
VIOLATION:   Hover animation on non-interactive elements
VIOLATION:   Scroll-triggered animation in application panels
```

### R7.3 — Hover effects must have keyboard equivalent
```
RULE:        If clicking hover reveals an action (e.g., step-remove button),
             the action must also be reachable via keyboard.

CURRENT EXCEPTION: .step-remove shows on hover only. Documented as P3 task T024.
                   Acceptable for MVP; must be resolved before production.
```

---

## RULE SET 8 — ARCHITECTURE ENFORCEMENT

### R8.1 — No !important
```
VIOLATION:   .step-remove:hover { color: var(--danger) !important; }  ← fix in T016

CORRECT:     Increase specificity: .step-row .step-remove:hover { color: var(--danger); }

EXCEPTION:   @media (prefers-reduced-motion: reduce) global reset uses !important — this is
             the ONE valid use case (cross-browser animation override).
```

### R8.2 — CSS classes describe role, not appearance
```
VIOLATION:   .blue-border { border-color: var(--accent); }
VIOLATION:   .dark-bg { background: var(--surface-2); }

CORRECT:     .step-row.selected { border-color: var(--accent); }
             .config { background: var(--surface); }
```

### R8.3 — Token values only in CSS, never in JS
```
VIOLATION:   const ACCENT = '#4f8cff';  // in a JS/TS file
VIOLATION:   element.style.color = '#4f8cff';

CORRECT:     element.classList.add('selected');  // apply a class
CORRECT:     getComputedStyle(root).getPropertyValue('--accent')  // read from CSS
             (only if truly needed for canvas rendering — document in DESIGN_DECISIONS.md)
```

---

## PRE-COMMIT ENFORCEMENT CHECKLIST

Run before every commit that touches `styles.css` or any JSX component:

```
Color:
[ ] No hardcoded hex in styles.css outside :root block
[ ] No inline style colors in JSX
[ ] All state colors use defined semantic tokens
[ ] No second accent color introduced

Spacing:
[ ] All spacing values on 4px scale (0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64)
[ ] No spacer divs
[ ] No negative margin compensation

Typography:
[ ] Font sizes from defined scale (9-16, 20px)
[ ] Monospace only for code/command content
[ ] No letter-spacing on body text
[ ] No italic UI labels

Components:
[ ] Border radius from defined scale (3, 4, 6, 8px or 9999px)
[ ] Inputs and buttons share same radius (6px)
[ ] Shadow only on floating overlays

Accessibility:
[ ] Every new button has visible :focus-visible style
[ ] Every icon-only button has aria-label
[ ] New dynamic content has aria-live if needed
[ ] Color is not the only state signal

Interaction:
[ ] Transition durations ≤ 400ms
[ ] No !important added
[ ] Hover reveals have keyboard equivalent or T024 dependency noted
```
