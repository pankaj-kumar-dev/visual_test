# TASK QUEUE
> Atomic implementation tasks. Each task = one logical change. One concern at a time.
> Status: [ ] TODO  [~] IN PROGRESS  [x] DONE  [!] BLOCKED

---

## STATUS LEGEND
- **P0** — Critical: accessibility violation or broken state
- **P1** — High: token compliance, wrong copy, missing a11y ARIA
- **P2** — Medium: missing states (empty/loading/error), UX gaps
- **P3** — Low: consolidation, cleanup, polish

---

## PHASE 1 — CRITICAL TRUST FIXES

---

### T001 — Add :focus-visible ring to all buttons
**Status:** [ ] TODO
**Priority:** P0
**Audit Finding:** FRONTEND_AUDIT.md § Interaction Audit — "Buttons have no focus-visible ring"
**WCAG:** 2.4.7 (AA)

**Affected Files:**
- `frontend/src/styles.css`

**Why It Matters:**
Keyboard users cannot navigate the app — no visible indicator shows which button is focused.
This is a WCAG AA violation. Developers using the tool via keyboard (tab through, trigger runs)
have no navigation cues.

**Implementation Strategy:**
```css
/* Add to styles.css after existing button reset */
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
/* Remove any existing outline:none on buttons */
```
Verify no existing `outline: none` override exists on buttons. Check: `.tab-btn`, `.collapse-btn`,
`.remove-btn`, `.suite-action-btn`, `.reset-btn`, `.run-btn`, `.copy-btn`.

**Dependencies:** None

**Expected Visual Impact:** Blue ring appears around focused buttons. No other visual change.

**Risk:** Very Low — additive CSS, no JavaScript, no layout change.

---

### T002 — Add aria-label to icon-only buttons
**Status:** [ ] TODO
**Priority:** P0
**Audit Finding:** FRONTEND_AUDIT.md § Accessibility Audit — "icon-only buttons lack aria-label"
**WCAG:** 4.1.2 (A — Critical)

**Affected Files:**
- `frontend/src/features/canvas/StepRow.jsx`
- `frontend/src/features/canvas/SuiteBlock.jsx`
- `frontend/src/features/canvas/TestBlock.jsx`
- `frontend/src/features/canvas/HookBlock.jsx`

**Why It Matters:**
Screen readers announce icon-only buttons as unlabeled or read the Unicode character
(e.g., "×" becomes "multiplication sign"). Users with screen readers cannot operate
the test builder.

**Implementation Strategy:**
In each file, add `aria-label` to:
```jsx
// StepRow.jsx
<button className="step-remove" aria-label="Remove step">×</button>
<span className="step-drag-handle" aria-hidden="true">⋮⋮</span>

// SuiteBlock.jsx
<button className="collapse-btn" aria-label={collapsed ? "Expand suite" : "Collapse suite"}>
<button className="remove-btn" aria-label="Remove suite">×</button>

// TestBlock.jsx
<button className="collapse-btn" aria-label={collapsed ? "Expand test" : "Collapse test"}>
<button className="remove-btn" aria-label="Remove test">×</button>

// HookBlock.jsx
<button className="collapse-btn" aria-label={collapsed ? "Expand hook" : "Collapse hook"}>
```
Drag handle gets `aria-hidden="true"` — keyboard reorder (T024) handles accessibility there.

**Dependencies:** None

**Expected Visual Impact:** None visible. Screen reader behavior improved.

**Risk:** Very Low — JSX attribute addition only.

---

### T003 — Add aria-live to execution log
**Status:** [ ] TODO
**Priority:** P0
**Audit Finding:** FRONTEND_AUDIT.md § Accessibility Audit — "Execution log not announced"
**WCAG:** 4.1.3 (AA)

**Affected Files:**
- `frontend/src/features/execution/ExecutionPanel.jsx`

**Why It Matters:**
When a test runs, log lines stream in via SSE. Screen readers don't announce dynamic content
unless explicitly told to. Users relying on assistive technology can't know if a test passed.

**Implementation Strategy:**
```jsx
// Wrap exec-log in aria-live region
<div
  className="exec-log"
  aria-live="polite"
  aria-label="Execution log"
>
  {logLines.map(...)}
</div>

// Status badge for PASSED/FAILED — use assertive (critical state change)
<span
  className="exec-status-badge"
  aria-live="assertive"
  aria-atomic="true"
>
  {status}
</span>
```
Use `aria-live="polite"` for log (non-interrupting), `aria-live="assertive"` for status badge
(test result is important — interrupt current reading).

**Dependencies:** None

**Expected Visual Impact:** None. Screen reader behavior only.

**Risk:** Very Low.

---

### T004 — Fix canvas empty state copy
**Status:** [ ] TODO
**Priority:** P1
**Audit Finding:** FRONTEND_AUDIT.md § Component Consistency — "Canvas empty copy too technical"

**Affected Files:**
- `frontend/src/features/canvas/Canvas.jsx`

**Why It Matters:**
"Flow has no root suite." exposes internal architecture vocabulary to users. Users build
suites by interacting with the canvas — the message should guide the action.

**Implementation Strategy:**
```jsx
// In Canvas.jsx, change:
<div className="canvas-empty-msg">Flow has no root suite.</div>

// To:
<div className="canvas-empty-msg">
  Drag a command from the palette to start building, or load an example above.
</div>
```

**Dependencies:** None

**Expected Visual Impact:** Text change only in empty canvas state.

**Risk:** None.

---

### T008 — Add aria-label to canvas flow inputs
**Status:** [ ] TODO
**Priority:** P0
**Audit Finding:** FRONTEND_AUDIT.md § Accessibility — "Canvas inputs lack visible label"
**WCAG:** 1.3.1 (AA)

**Affected Files:**
- `frontend/src/features/canvas/Canvas.jsx`

**Why It Matters:**
The flow-name and baseUrl inputs have no `<label>` and no `aria-label`. Screen readers
announce them as unlabeled inputs. Users cannot know what data belongs in each field.

**Implementation Strategy:**
```jsx
<input
  className="flow-name"
  aria-label="Flow name"
  value={flow.name}
  placeholder="Flow name"
  onChange={...}
/>
<input
  className="flow-baseurl"
  aria-label="Base URL"
  placeholder="baseUrl"
  value={flow.baseUrl}
  onChange={...}
/>
```
Do NOT add visible labels — they would break the compact canvas header layout.
`aria-label` is the correct accessibility solution here.

**Dependencies:** None

**Expected Visual Impact:** None. Screen reader behavior only.

**Risk:** Very Low.

---

### T016 — Remove !important from step-remove hover
**Status:** [ ] TODO
**Priority:** P1
**Audit Finding:** FRONTEND_AUDIT.md § Anti-Pattern Detection — "`!important` in .step-remove:hover"

**Affected Files:**
- `frontend/src/styles.css`

**Why It Matters:**
`!important` signals a specificity conflict. One instance is acceptable but sets a bad
precedent — future CSS changes will be tempted to escalate.

**Implementation Strategy:**
```css
/* Current (line ~351): */
.step-remove:hover { color: var(--danger) !important; }

/* Fix — increase specificity correctly: */
.step-row .step-remove:hover { color: var(--danger); }
```
The `.step-row` parent gives enough specificity without `!important`.

**Dependencies:** None

**Expected Visual Impact:** None — same color, no `!important`.

**Risk:** Very Low.

---

## PHASE 2 — TOKEN SYSTEM

---

### T005 — Tokenize #0b0d12 as --surface-code
**Status:** [ ] TODO
**Priority:** P1
**Audit Finding:** FRONTEND_AUDIT.md § Color Audit — "3 hardcoded hex values"

**Affected Files:**
- `frontend/src/styles.css`

**Why It Matters:**
`#0b0d12` appears in 3 places (`.codepanel-pre`, `.exec-log`, `.import-textarea`).
If this color ever changes (e.g., slight blue tint for contrast), 3 locations must
be updated manually. Tokenizing ensures single source of truth.

**Implementation Strategy:**
```css
/* 1. Add to :root */
:root {
  /* ... existing tokens ... */
  --surface-code: #0b0d12;
}

/* 2. Replace 3 occurrences */
.codepanel-pre    { background: var(--surface-code); }
.exec-log         { background: var(--surface-code); }
.import-textarea  { background: var(--surface-code); }
```

**Dependencies:** None

**Expected Visual Impact:** None — same color.

**Risk:** None.

---

### T006 — Tokenize #3a7de8 as --accent-hover
**Status:** [ ] TODO
**Priority:** P1

**Affected Files:**
- `frontend/src/styles.css`

**Implementation Strategy:**
```css
:root {
  --accent-hover: #3a7de8;
}

/* Replace: */
.run-btn:hover:not(:disabled) { background: var(--accent-hover); }
```

**Dependencies:** None. **Risk:** None.

---

### T007 — Tokenize #93bbff as --hook-before
**Status:** [ ] TODO
**Priority:** P1

**Affected Files:**
- `frontend/src/styles.css`

**Implementation Strategy:**
```css
:root {
  --hook-before: #93bbff;
}

.hook-beforeAll  .hook-kind-label,
.hook-beforeEach .hook-kind-label { color: var(--hook-before); }
```

**Dependencies:** None. **Risk:** None.

---

### T009 — Tokenize rgba(79,140,255,...) accent variants
**Status:** [ ] TODO
**Priority:** P1

**Affected Files:**
- `frontend/src/styles.css`

**Why It Matters:**
`rgba(79,140,255,X)` appears 7+ times with varying opacities. If accent color changes,
all 7+ must be manually updated. Semantic tokens prevent drift.

**Implementation Strategy:**
```css
:root {
  --accent-subtle:  rgba(79,140,255,0.06);   /* selection bg, suite-head-root */
  --accent-border:  rgba(79,140,255,0.4);    /* selected borders */
  --accent-border-2: rgba(79,140,255,0.2);   /* lighter selected borders */
  --accent-tint-10: rgba(79,140,255,0.1);    /* suite.selected head */
  --accent-tint-12: rgba(79,140,255,0.12);   /* suite-icon bg */
}
```
Then grep for `rgba(79,140,255` and replace each with the nearest semantic token.
Map by opacity:
- 0.04 → `--accent-subtle` (close enough, or add --accent-tint-4)
- 0.06 → `--accent-subtle`
- 0.1  → `--accent-tint-10`
- 0.12 → `--accent-tint-12`
- 0.2  → `--accent-border-2`
- 0.3  → between --accent-border-2 and --accent-border
- 0.4  → `--accent-border`

**Dependencies:** None. **Risk:** Low — visual parity must be verified.

---

### T010 — Tokenize state background rgba values
**Status:** [ ] TODO
**Priority:** P1

**Affected Files:**
- `frontend/src/styles.css`

**Implementation Strategy:**
```css
:root {
  --state-success-bg:  rgba(74,222,128,0.1);
  --state-warning-bg:  rgba(250,204,21,0.08);
  --state-warning-bg2: rgba(250,204,21,0.2);   /* stronger — flaky badge */
  --state-warning-border: rgba(250,204,21,0.3);
  --state-danger-bg:   rgba(239,68,68,0.08);
  --state-danger-bg2:  rgba(239,68,68,0.1);    /* exec-error */
  --state-danger-border: rgba(239,68,68,0.35);
  --state-danger-border2: rgba(239,68,68,0.4); /* stronger — exec-error */
}
```

**Dependencies:** T005 (establishes tokenization pattern). **Risk:** Low.

---

### T011 — Tokenize hook background rgba values
**Status:** [ ] TODO
**Priority:** P1

**Affected Files:**
- `frontend/src/styles.css`

**Implementation Strategy:**
```css
:root {
  --hook-before-bg:  rgba(79,140,255,0.06);  /* can reuse --accent-subtle */
  --hook-before-bg2: rgba(79,140,255,0.04);
  --hook-after-bg:   rgba(250,204,21,0.04);
  --hook-after-bg2:  rgba(250,204,21,0.06);
}

.hook-beforeAll  .hook-head { background: var(--hook-before-bg); }
.hook-beforeEach .hook-head { background: var(--hook-before-bg2); }
.hook-afterEach  .hook-head { background: var(--hook-after-bg); }
.hook-afterAll   .hook-head { background: var(--hook-after-bg2); }
```

**Dependencies:** T009 (if reusing --accent-subtle). **Risk:** Low.

---

### T012 — Tokenize test-icon background rgba
**Status:** [ ] TODO
**Priority:** P1

**Affected Files:**
- `frontend/src/styles.css`

**Implementation Strategy:**
```css
/* .test-icon uses rgba(74,222,128,0.1) — same as --state-success-bg */
.test-icon { background: var(--state-success-bg); }
```

**Dependencies:** T010. **Risk:** None.

---

## PHASE 3 — STATE COMPLETION

---

### T013 — Add Analytics panel empty state
**Status:** [ ] TODO
**Priority:** P2
**Audit Finding:** FRONTEND_AUDIT.md § Component Consistency — "Analytics missing empty state"

**Affected Files:**
- `frontend/src/features/analytics/AnalyticsPanel.jsx`
- `frontend/src/styles.css`

**Why It Matters:**
On first use (0 executions), the analytics panel renders empty stat cards with
zero values, giving the impression something is broken. The empty state should
communicate the panel's purpose and what action populates it.

**Implementation Strategy:**
1. Read current AnalyticsPanel.jsx to understand data shape
2. Add conditional: if `totalRuns === 0`, render empty state instead of stats
3. Empty state markup:
```jsx
{totalRuns === 0 ? (
  <div className="panel-empty">
    <div className="panel-empty-icon">📊</div>
    <p className="panel-empty-title">No runs yet</p>
    <p className="panel-empty-hint">
      Run a test suite to start tracking pass rates and flakiness.
    </p>
  </div>
) : (
  <div className="analytics-stats">...</div>
)}
```
4. Add `.panel-empty` styles to styles.css (shared with T014)

**Dependencies:** None

**Expected Visual Impact:** Empty analytics panel shows purposeful empty state instead of zeroed stats.

**Risk:** Low — additive conditional render.

---

### T014 — Add History panel empty and loading states
**Status:** [ ] TODO
**Priority:** P2

**Affected Files:**
- `frontend/src/features/history/HistoryPanel.jsx`
- `frontend/src/styles.css`

**Implementation Strategy:**
1. Read HistoryPanel.jsx — identify how data is fetched and stored
2. Add `loading` and `error` states to local component state
3. Empty state: "No test runs yet. Run a suite to record history."
4. Loading state: skeleton rows (2-3 rows mimicking .history-row shape)
5. Error state: "Couldn't load history. Check backend is running."
```jsx
if (loading) return <HistorySkeleton />
if (error)   return <ErrorState message="Couldn't load history." />
if (!runs.length) return <EmptyState title="No runs yet" hint="Run a suite to record history." />
```
6. Add `.panel-empty`, `.panel-empty-title`, `.panel-empty-hint` shared classes

**Dependencies:** T013 (establishes shared .panel-empty CSS)

**Expected Visual Impact:** Panel shows skeleton during load, clear message when empty.

**Risk:** Medium — requires reading and modifying component state logic.

---

### T015 — Add Analytics panel loading and error states
**Status:** [ ] TODO
**Priority:** P2

**Affected Files:**
- `frontend/src/features/analytics/AnalyticsPanel.jsx`

**Implementation Strategy:**
Same pattern as T014 — add loading/error conditional renders.
Skeleton: 2 stat-card skeletons (matching .astat grid shape).

**Dependencies:** T013, T014

**Risk:** Low.

---

### T017 — Add config panel selected-node header
**Status:** [ ] TODO
**Priority:** P2
**Audit Finding:** FRONTEND_AUDIT.md § Visual Hierarchy — "Config panel missing node context"

**Affected Files:**
- `frontend/src/features/config/ConfigPanel.jsx`
- `frontend/src/styles.css`

**Why It Matters:**
When a user selects a step in one suite and then a node in another suite, the config
panel updates but shows no indication of what is currently being edited. This creates
"selection anxiety" — one of the three primary user anxieties identified in USER_PSYCHOLOGY.md.

**Implementation Strategy:**
1. Read ConfigPanel.jsx to understand current selection display
2. Add header row above config content:
```jsx
<div className="config-node-header">
  <span className="config-node-type">{selectedNode?.kind ?? 'Nothing selected'}</span>
  <span className="config-node-name">{selectedNode?.name ?? '—'}</span>
</div>
```
3. CSS:
```css
.config-node-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-bottom: 1px solid var(--border);
  flex-shrink: 0; background: var(--surface-2);
}
.config-node-type {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--muted);
}
.config-node-name {
  font-size: 12px; font-weight: 600; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
```

**Dependencies:** None

**Expected Visual Impact:** Config panel gains a persistent context bar showing "STEP / selector-value" or "TEST / Login test" etc.

**Risk:** Low — layout addition above existing config content.

---

## PHASE 4 — LAYOUT CONSISTENCY

---

### T018 — Align spacing to 4px base scale
**Status:** [ ] TODO
**Priority:** P3
**Audit Finding:** FRONTEND_AUDIT.md § Spacing Audit — "5px, 7px off-scale values"

**Affected Files:**
- `frontend/src/styles.css`

**Why It Matters:**
5px and 7px values exist alongside 4px, 6px, 8px values. While minor, they create
subtle misalignment that accumulates. Fixing ensures the spacing grammar is clean.

**Implementation Strategy:**
Replace specific values:
```
padding: 5px 8px  → padding: 4px 8px   (inputs — slightly tighter, acceptable)
padding: 7px 10px → padding: 6px 10px  (palette-item — one step down the scale)
padding: 5px 6px  → padding: 4px 6px   (step-row — maintains proportion)
padding: 5px 14px → padding: 4px 14px  (tab-btn — minor)
padding: 5px 8px  → padding: 6px 8px   (run-btn — slightly taller, more clickable)
```
Verify each change visually — some rounding up, some down based on optical feel.

**Dependencies:** None. **Risk:** Low — micro-pixel changes, verify visually.

---

### T019 — Add shared .panel-empty base class to styles.css
**Status:** [ ] TODO
**Priority:** P2

**Affected Files:**
- `frontend/src/styles.css`

**Why It Matters:**
T013 and T014 both need empty state styles. Define once, use everywhere.

**Implementation Strategy:**
```css
/* ─── Empty states ────────────────────────────────────────── */
.panel-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 32px 16px; text-align: center;
  gap: 8px;
}
.panel-empty-icon  { font-size: 24px; opacity: 0.4; }
.panel-empty-title {
  margin: 0; font-size: 13px; font-weight: 600; color: var(--text);
}
.panel-empty-hint  {
  margin: 0; font-size: 12px; color: var(--muted); line-height: 1.5;
  max-width: 220px;
}
```

**Dependencies:** None. **Risk:** None — new CSS only.

---

### T020 — Add shared skeleton base styles
**Status:** [ ] TODO
**Priority:** P2

**Affected Files:**
- `frontend/src/styles.css`

**Implementation Strategy:**
```css
/* ─── Skeleton loading ────────────────────────────────────── */
@keyframes shimmer {
  from { background-position: -200px 0; }
  to   { background-position: calc(200px + 100%) 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-2) 0px,
    var(--surface-3) 40px,
    var(--surface-2) 80px
  );
  background-size: 200px 100%;
  animation: shimmer 1.4s linear infinite;
  border-radius: var(--radius-sm);
}

.skeleton-row {
  height: 40px; border-radius: var(--radius); margin-bottom: 4px;
}
.skeleton-text-sm { height: 10px; width: 60%; margin-bottom: 4px; }
.skeleton-text-md { height: 10px; width: 80%; }
```

**Dependencies:** None. **Risk:** None — new CSS only.

---

## PHASE 5 — COMPONENT SYSTEM

---

### T021 — Consolidate .reset-btn / .copy-btn into shared base
**Status:** [ ] TODO
**Priority:** P3

**Affected Files:**
- `frontend/src/styles.css`
- `frontend/src/app/App.jsx`
- `frontend/src/features/codegen/CodePanel.jsx`

**Why It Matters:**
`.reset-btn` and `.copy-btn` are visually identical secondary ghost buttons. Maintaining
two class definitions creates drift risk — one gets updated, the other doesn't.

**Implementation Strategy:**
```css
/* Replace both with shared base */
.btn-ghost {
  background: var(--surface-2); color: var(--muted);
  border: 1px solid var(--border); border-radius: var(--radius);
  padding: 4px 10px; font-size: 12px;
  transition: color 0.15s, border-color 0.15s;
}
.btn-ghost:hover:not(:disabled) { color: var(--text); border-color: var(--border-2); }
.btn-ghost:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-ghost.active   { border-color: var(--accent); color: var(--accent); }
```
Update JSX to use `className="btn-ghost"` instead of `reset-btn` or `copy-btn`.
Keep `.run-btn` separate — it is the primary action button.

**Dependencies:** None. **Risk:** Low — visual change is zero, class rename only.

---

### T022 — Extract .btn-primary pattern
**Status:** [ ] TODO
**Priority:** P3

**Affected Files:**
- `frontend/src/styles.css`

**Implementation Strategy:**
```css
.btn-primary {
  background: var(--accent); color: #fff;
  border: none; border-radius: var(--radius);
  padding: 5px 14px; font-size: 12px; font-weight: 600;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled)  { background: var(--accent-hover); }
.btn-primary:disabled              { opacity: 0.4; cursor: not-allowed; }
```
Replace `.run-btn` usage in ExecutionPanel with `className="btn-primary"`.

**Dependencies:** T006 (--accent-hover token). **Risk:** None.

---

### T023 — Audit and document all button variants in COMPONENT_RULES.md
**Status:** [ ] TODO
**Priority:** P3

**Affected Files:**
- `design_agent/.design/COMPONENT_RULES.md`

**Implementation Strategy:**
Add a "Current Implementation" section to COMPONENT_RULES.md → Button section:
```
.btn-primary  → Primary filled button (run-btn equivalent)
.btn-ghost    → Secondary ghost button (reset-btn / copy-btn unified)
.btn-icon     → Icon-only button (collapse-btn, remove-btn) — requires aria-label
.tab-btn      → Tab navigation button (special case)
.add-step-btn → Dashed add-item button
```

**Dependencies:** T021, T022. **Risk:** None — documentation only.

---

## PHASE 6 — INTERACTION REFINEMENT

---

### T024 — Keyboard reorder for step rows (or documented limitation)
**Status:** [ ] TODO
**Priority:** P3
**WCAG:** 2.1.1 (A)

**Affected Files:**
- `frontend/src/features/canvas/StepRow.jsx`
- `frontend/src/core/state/useFlowStore.ts`

**Why It Matters:**
Drag-to-reorder has no keyboard alternative. WCAG 2.1.1 requires all functionality
be operable via keyboard. Step reordering is a core function.

**Implementation Strategy:**

Option A — Keyboard reorder (preferred):
```jsx
// StepRow.jsx — add keyboard handler to drag handle
<span
  className="step-drag-handle"
  role="button"
  tabIndex={0}
  aria-label={`Step ${index + 1}: ${step.rootLabel}. Press Alt+Up to move up, Alt+Down to move down.`}
  onKeyDown={(e) => {
    if (e.altKey && e.key === 'ArrowUp')   { e.preventDefault(); onMoveUp?.(); }
    if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); onMoveDown?.(); }
  }}
>
  ⋮⋮
</span>
```
Add `onMoveUp` / `onMoveDown` props to StepRow that call `reorderStep(nodeId, idx, idx-1/+1)`.

Option B — Document limitation:
Add ARIA description to drag handle: "Use drag to reorder. Keyboard reorder not yet supported."
This is the fallback if Option A is too risky for current milestone.

**Dependencies:** T002 (establish aria pattern)

**Expected Visual Impact:** None.

**Risk:** High — requires new JS event handling + store coordination. Do last.

---

## TASK STATUS SUMMARY

| ID | Priority | Title | Status |
|----|---------|-------|--------|
| T001 | P0 | Button :focus-visible ring | [ ] |
| T002 | P0 | aria-label icon-only buttons | [ ] |
| T003 | P0 | aria-live exec-log | [ ] |
| T004 | P1 | Canvas empty state copy | [ ] |
| T005 | P1 | Tokenize #0b0d12 | [ ] |
| T006 | P1 | Tokenize #3a7de8 | [ ] |
| T007 | P1 | Tokenize #93bbff | [ ] |
| T008 | P0 | aria-label canvas inputs | [ ] |
| T009 | P1 | Tokenize rgba accent variants | [ ] |
| T010 | P1 | Tokenize state bg rgba | [ ] |
| T011 | P1 | Tokenize hook bg rgba | [ ] |
| T012 | P1 | Tokenize test-icon bg | [ ] |
| T013 | P2 | Analytics empty state | [ ] |
| T014 | P2 | History empty+loading states | [ ] |
| T015 | P2 | Analytics loading+error states | [ ] |
| T016 | P1 | Remove !important | [ ] |
| T017 | P2 | Config panel node header | [ ] |
| T018 | P3 | Align spacing to 4px scale | [ ] |
| T019 | P2 | Shared .panel-empty CSS | [ ] |
| T020 | P2 | Shared skeleton CSS | [ ] |
| T021 | P3 | Consolidate ghost button class | [ ] |
| T022 | P3 | Extract .btn-primary | [ ] |
| T023 | P3 | Document button variants | [ ] |
| T024 | P3 | Keyboard step reorder | [ ] |
