# COMPONENT MIGRATION PLAN
> How to incrementally improve the frontend without breaking working logic.
> Strategy: token-first → accessibility → states → polish

---

## MIGRATION PHILOSOPHY

```
Rule 1:  PRESERVE FIRST — working code is more valuable than clean code
Rule 2:  TOKEN-FIRST — normalize values before changing appearance
Rule 3:  LAYER CHANGES — one concern per commit (color ≠ layout ≠ logic)
Rule 4:  VERIFY VISUALLY — every change gets eyeball check before next task
Rule 5:  NO REWRITES — migrate incrementally; full component rewrites forbidden
         unless a component is broken and unmaintainable
```

---

## MIGRATION LAYERS

Migration proceeds through 4 layers. Each layer must be complete before the next starts.

```
LAYER 1 — Token Normalization     (no visual change, pure value extraction)
LAYER 2 — Accessibility Baseline  (no visual change, ARIA + focus states)
LAYER 3 — State Completion        (additive UI, new states for existing components)
LAYER 4 — Component Consolidation (refactor, no visual change)
```

---

## LAYER 1 — TOKEN NORMALIZATION

**Scope:** `frontend/src/styles.css` only
**Visual change:** None
**Logic change:** None
**Rollback risk:** Zero — pure CSS variable substitution

### Step 1.1 — Establish new tokens in `:root`
Add all missing tokens to the `:root` block in `styles.css` before replacing any usage.
This prevents "use before definition" issues.

```css
:root {
  /* === EXISTING (keep) ===================================== */
  --bg:        #0f1115;
  --surface:   #181b22;
  --surface-2: #1f242e;
  --surface-3: #252b38;
  --border:    #2a303c;
  --border-2:  #353d4f;
  --text:      #e6e8ee;
  --muted:     #8a93a6;
  --accent:    #4f8cff;
  --green:     #4ade80;
  --yellow:    #facc15;
  --danger:    #ef4444;
  --radius:    6px;

  /* === NEW (add) =========================================== */
  --surface-code:  #0b0d12;   /* code/log/terminal blocks */
  --accent-hover:  #3a7de8;   /* accent hover state */
  --hook-before:   #93bbff;   /* beforeAll/beforeEach label */
  --radius-xs:     3px;       /* tiny badges */
  --radius-sm:     4px;       /* small interactive elements */
  --radius-lg:     8px;       /* larger containers */

  /* Accent opacity variants */
  --accent-subtle:    rgba(79,140,255,0.06);
  --accent-tint-4:    rgba(79,140,255,0.04);
  --accent-tint-10:   rgba(79,140,255,0.10);
  --accent-tint-12:   rgba(79,140,255,0.12);
  --accent-border-sm: rgba(79,140,255,0.20);
  --accent-border:    rgba(79,140,255,0.40);

  /* State backgrounds */
  --state-success-bg:    rgba(74,222,128,0.10);
  --state-warning-bg:    rgba(250,204,21,0.08);
  --state-warning-tint:  rgba(250,204,21,0.20);
  --state-warning-border: rgba(250,204,21,0.30);
  --state-danger-bg:     rgba(239,68,68,0.08);
  --state-danger-tint:   rgba(239,68,68,0.10);
  --state-danger-border: rgba(239,68,68,0.35);
  --state-danger-border2: rgba(239,68,68,0.40);

  /* Hook type backgrounds */
  --hook-before-bg:  rgba(79,140,255,0.06);
  --hook-before-bg2: rgba(79,140,255,0.04);
  --hook-after-bg:   rgba(250,204,21,0.04);
  --hook-after-bg2:  rgba(250,204,21,0.06);
}
```

### Step 1.2 — Replace hardcoded values (mechanical find-replace)

**Replace map:**

| Find | Replace with |
|------|-------------|
| `#0b0d12` | `var(--surface-code)` |
| `#3a7de8` | `var(--accent-hover)` |
| `#93bbff` | `var(--hook-before)` |
| `rgba(79,140,255,0.06)` | `var(--accent-subtle)` |
| `rgba(79,140,255,0.04)` | `var(--accent-tint-4)` |
| `rgba(79,140,255,0.10)` | `var(--accent-tint-10)` |
| `rgba(79,140,255,0.12)` | `var(--accent-tint-12)` |
| `rgba(79,140,255,0.20)` | `var(--accent-border-sm)` |
| `rgba(79,140,255,0.40)` | `var(--accent-border)` |
| `rgba(79,140,255,0.3)` | mix of border-sm and border — pick nearest |
| `rgba(74,222,128,0.1)` | `var(--state-success-bg)` |
| `rgba(250,204,21,0.08)` | `var(--state-warning-bg)` |
| `rgba(250,204,21,0.20)` | `var(--state-warning-tint)` |
| `rgba(250,204,21,0.30)` | `var(--state-warning-border)` |
| `rgba(239,68,68,0.08)` | `var(--state-danger-bg)` |
| `rgba(239,68,68,0.10)` | `var(--state-danger-tint)` |
| `rgba(239,68,68,0.35)` | `var(--state-danger-border)` |
| `rgba(239,68,68,0.40)` | `var(--state-danger-border2)` |
| `rgba(255,255,255,0.02)` | `rgba(255,255,255,0.02)` — keep (too small to tokenize) |

### Verification
After Layer 1, run:
```bash
grep -n '#[0-9a-fA-F]\{3,8\}' frontend/src/styles.css
```
Result should show ONLY lines inside `:root { }`. Zero hardcoded values outside `:root`.

---

## LAYER 2 — ACCESSIBILITY BASELINE

**Scope:** `styles.css` + JSX files (canvas, execution panel, step rows)
**Visual change:** Focus ring appears (positive), no other visual change
**Logic change:** None — attribute additions only

### Step 2.1 — Button focus ring (styles.css)
```css
/* Add after existing button reset */
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```
**Verify:** Tab through entire app. Every button should show blue ring on focus.

### Step 2.2 — aria-label on icon buttons (JSX)
Go file by file. Read each file first. Add `aria-label` to each button missing one.
Do NOT change any other JSX — one concern per pass.

File order:
1. `StepRow.jsx` — step-remove, step-drag-handle
2. `SuiteBlock.jsx` — collapse-btn, remove-btn
3. `TestBlock.jsx` — collapse-btn, remove-btn
4. `HookBlock.jsx` — collapse-btn
5. `Canvas.jsx` — flow-name input, flow-baseurl input

### Step 2.3 — aria-live on dynamic regions (JSX)
1. `ExecutionPanel.jsx` — exec-log div + status badge span

### Verification
Tab through entire app from header to analytics panel.
Every interactive element should be reachable and labeled.

---

## LAYER 3 — STATE COMPLETION

**Scope:** Feature component JSX files
**Visual change:** New UI appears in empty/loading/error conditions
**Logic change:** New conditional render paths — READ component first, understand data flow

### Migration Strategy per Component

**Rule:** Before modifying any component, read it completely. Understand:
1. Where data comes from (prop vs. store vs. local state)
2. What loading/error state variables exist (if any)
3. Whether data is fetched on mount or on demand

### Step 3.1 — Shared CSS classes (styles.css)
Add `.panel-empty`, `.skeleton`, `.skeleton-row` classes (see T019, T020 in TASK_QUEUE.md).
These must exist before any component uses them.

### Step 3.2 — Analytics Panel
Read `AnalyticsPanel.jsx` fully before touching.
Add: empty state (0 runs), loading state (skeleton cards), error state (fetch failed).

### Step 3.3 — History Panel
Read `HistoryPanel.jsx` fully before touching.
Add: empty state (0 runs), loading state (skeleton rows), error state (fetch failed).

### Risk Mitigation
- If panel uses SSE instead of fetch, loading state is different (SSE connects = streaming, not loading)
- If panel subscribes to Zustand store that is always populated, "loading" may not apply
- Read the data flow before implementing — do not assume

---

## LAYER 4 — COMPONENT CONSOLIDATION

**Scope:** `styles.css` + App.jsx + CodePanel.jsx
**Visual change:** None
**Logic change:** CSS class name change only (reset-btn → btn-ghost, run-btn → btn-primary)

### Migration Safety
This is a rename, not a restyle. The new class names have identical visual output.

### Step 4.1 — Add new class definitions to styles.css
```css
.btn-ghost { /* identical to current .reset-btn */ }
.btn-primary { /* identical to current .run-btn */ }
```
**Do not delete `.reset-btn` or `.run-btn` yet.** Add the new classes alongside them.

### Step 4.2 — Update JSX to use new class names
Replace `className="reset-btn"` → `className="btn-ghost"` in App.jsx.
Replace `className="copy-btn"` → `className="btn-ghost"` in CodePanel.jsx.
Replace `className="run-btn"` → `className="btn-primary"` in ExecutionPanel.jsx.

### Step 4.3 — Remove old class definitions
After verifying all usages updated, delete `.reset-btn`, `.copy-btn`, `.run-btn` from styles.css.
**Run visual verification before delete.**

---

## WHAT NOT TO MIGRATE

These are explicitly excluded from migration scope:

| Item | Reason |
|------|--------|
| `useFlowStore.ts` core logic | Working, tested, migration is visual not logical |
| Codegen emitters | Output-focused, not UI |
| Backend code | Out of scope for UI design system |
| `@dnd-kit` drag implementation | Working correctly, accessibility handled via T024 separately |
| Type definitions in `types.ts` | Not UI |
| `examples/` JSON files | Static data |

---

## REGRESSION CHECKLIST

After each layer, verify these core flows still work:

```
[ ] Add suite to canvas
[ ] Add test to suite
[ ] Add step to test via palette drag
[ ] Configure step in config panel
[ ] Code panel updates on every change
[ ] Save flow (Save Flow button)
[ ] Load example flow
[ ] Run test (mock runner)
[ ] View execution log
[ ] View history tab
[ ] View analytics tab
[ ] Undo/redo (Ctrl+Z/Ctrl+Shift+Z)
```
