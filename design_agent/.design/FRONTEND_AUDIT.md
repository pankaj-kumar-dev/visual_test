# FRONTEND AUDIT
> Current state analysis of the existing UI/frontend.
> Run this audit before beginning any design system work. Findings drive prioritization.

---

## AUDIT STATUS

```
Project:           Visual Test Builder
Audited By:        Design Agent (automated code scan + structure analysis)
Audit Date:        2026-05-26
Codebase Branch:   integrating-with-external-system
Product Stage:     MVP
```

---

## AUDIT FINDINGS

### 1. Color Audit

```
Total distinct colors in use:     ~22 (including rgba variants and hardcoded values)
Colors from design system:        12 (via CSS custom properties)
Hardcoded hex values:             3 — #0b0d12 (code bg), #3a7de8 (run-btn hover), #93bbff (hook-before label)
Semantic misuse:                  None significant — accent used consistently for interaction only
Missing dark mode support:        N/A — dark mode native, no light mode planned
```

| Issue | Location | Severity | Fix |
|-------|---------|---------|-----|
| `#0b0d12` hardcoded in 3 places | styles.css: codepanel-pre, exec-log, import-textarea | Med | Add `--surface-code: #0b0d12` to :root |
| `#3a7de8` hardcoded run-btn hover | styles.css: .run-btn:hover | Low | Add `--accent-hover: #3a7de8` to :root |
| `#93bbff` hardcoded hook label | styles.css: .hook-beforeAll/.hook-beforeEach | Low | Add `--hook-before: #93bbff` to :root |
| `rgba(79,140,255,...)` used 7+ times | styles.css: suite/step selection states | Med | Token as `--accent-subtle`, `--accent-border` |
| `rgba(74,222,128,0.1)` hardcoded | styles.css: .test-icon background | Low | Token as `--state-success-bg` |
| `rgba(250,204,21,0.2)` hardcoded | styles.css: flaky-count, flaky-badge | Low | Token as `--state-warning-bg` |
| `rgba(239,68,68,0.1)` hardcoded | styles.css: exec-error, validation-banner | Low | Token as `--state-danger-bg` |

---

### 2. Typography Audit

```
Distinct font sizes in use:     8 (9px, 10px, 11px, 12px, 13px, 14px, 15px, 16px, 20px)
Font sizes appropriate for tool: Yes — dense dev tool sizing is intentional
Font families in use:           2 (system-ui sans, Fira Code mono) — correct
Inconsistent font weights:      Minor — most at 500/600/700, consistent
Line height problems:           None critical — dense layout uses tight line-heights appropriately
Readability issues:             None — all text above 10px with sufficient contrast
```

| Issue | Location | Severity | Fix |
|-------|---------|---------|-----|
| `.panel-title` uses uppercase + letter-spacing correctly | styles.css | ✓ Pass | — |
| Body text uses 12px (correct for dense tool) | styles.css | ✓ Pass | — |
| Monospace used for code labels, commands, logs | styles.css | ✓ Pass | — |

---

### 3. Spacing Audit

```
Arbitrary spacing values:         4 — 5px (input padding), 7px (palette-item), 5px (step-row)
Consistent padding in components: Mostly yes — panels all use 14px
Consistent gap in grids/lists:    Yes — 4-6px within sections, 10-12px between
Section separation problems:      None significant
```

| Issue | Location | Severity | Fix |
|-------|---------|---------|-----|
| `padding: 5px 8px` on inputs | styles.css: input/select/textarea | Low | Could be 4px 8px (on scale) |
| `padding: 7px 10px` on palette-item | styles.css: .palette-item | Low | Could be 8px 10px or 6px 10px |
| `padding: 5px 6px` on step-row | styles.css: .step-row | Low | Could be 4px 6px or 6px 6px |
| `gap: 1px` used as border between panels | styles.css: .app-grid | ✓ Intentional | Background=border creates 1px gaps |

---

### 4. Component Consistency Audit

```
Components with missing states:
  - Buttons: loading state missing on Reset, Undo, Redo (only Save has loading state)
  - Palette items: no empty state for filtered-to-nothing
  - Canvas: empty state exists (✓) but minimal ("Flow has no root suite." — too technical)
  - History panel: empty state exists (needs verification)
  - Analytics panel: no empty state for zero-run data

Duplicate components:
  - .reset-btn and .copy-btn are visually similar but separate classes (consolidate as .btn-secondary)
  - .run-btn is isolated primary button (ok as-is)

Components without skeleton states:   All panels (none have skeleton loading)
Components without empty states:       Analytics panel, History panel (verify)
Components without error states:       Analytics panel has no error state
```

| Issue | Location | Severity | Fix |
|-------|---------|---------|-----|
| No skeleton loading on any panel | All panels | High | Add skeleton for initial data load |
| Canvas empty message too technical | Canvas.jsx: "Flow has no root suite." | Med | Change to "Drag a command from the palette to start building." |
| Analytics has no empty/error state | AnalyticsPanel.jsx | Med | Add empty state for 0 executions |
| `.reset-btn` and `.copy-btn` are nearly identical | styles.css | Low | Consolidate to `.btn-ghost` |

---

### 5. Visual Hierarchy Audit

```
Screens with no clear primary action:  None — "Run" is always the primary action, visually dominant
Screens with multiple primary buttons: None — only one .run-btn exists
Information hierarchy problems:        Minor — config panel title lacks clear visual separation
Contrast issues:                       None critical — all text on dark surfaces has sufficient contrast
```

| Issue | Location | Severity | Fix |
|-------|---------|---------|-----|
| Config panel has no title/context showing what's being edited | ConfigPanel | Med | Add selected node name as config panel header |
| Tab bar active state (color + border) is clear | ✓ Pass | — | — |
| "Save Flow" status text uses button as status display | App.jsx | Low | Consider a separate status indicator |

---

### 6. Layout Audit

```
Grid inconsistencies:         None — 3-column grid is consistent
Mobile layout problems:       Not applicable — desktop-only tool
Viewport overflow issues:     Panels have overflow-y:auto (correct)
Max-width inconsistencies:    None — no max-width constraints needed (3-column fills viewport)
Alignment breaks:             Step rows align consistently
```

| Issue | Location | Severity | Fix |
|-------|---------|---------|-----|
| Right panel (360px) may be tight for config + tabs on small laptops | styles.css: app-grid | Low | Consider min-width constraint or collapsible panel |
| No responsive behavior at all | Entire app | Low | Not a current priority (desktop tool) |

---

### 7. Interaction Audit

```
Missing loading states:
  - History panel fetch (no skeleton)
  - Analytics panel fetch (no skeleton)
  - Flow save (shows text in button — adequate for MVP)

Missing error states:
  - Analytics panel: no error UI if API call fails
  - History panel: no error UI if fetch fails

No success feedback:     Run success shows PASSED badge (✓ adequate)
Focus states absent:     Only inputs have focus style (outline: 1px solid var(--accent))
                         Buttons have no visible focus ring — accessibility gap
Hover states absent:     Most elements have hover states — good
Animation issues:        All transitions at 0.15s — appropriate
```

| Issue | Location | Severity | Fix |
|-------|---------|---------|-----|
| Buttons have no focus-visible ring | All button elements | High (a11y) | Add `outline: 2px solid var(--accent); outline-offset: 2px` on :focus-visible |
| Step remove button (×) only shows on row hover | styles.css: .step-remove | Med | Fine for desktop, problematic for keyboard nav |
| No success toast for save (text in button is fine) | App.jsx | Low | Acceptable for MVP |

---

### 8. Accessibility Audit

```
Lighthouse Accessibility Score:    Estimated 55-65/100 (not run — estimated from code scan)
axe violations (estimated):        3-5 critical (button labels, form labels, live regions)
Missing alt text:                  N/A — no images in functional UI
Missing ARIA labels:               Multiple icon-only buttons lack aria-label
Color contrast failures:           --muted (#8a93a6) on --surface (#181b22): passes AA (ratio ~4.6:1)
                                   --muted on --surface-2 (#1f242e): passes AA (ratio ~4.3:1)
Keyboard navigation gaps:          Buttons lack :focus-visible; tab order not verified
Form label issues:                 Canvas inputs lack <label> elements (placeholder-only)
Focus trap missing (modals):       No modals in current MVP
```

| Issue | WCAG Criterion | Severity | Fix |
|-------|--------------|---------|-----|
| `.collapse-btn`, `.remove-btn`, `.step-remove` lack aria-label | 4.1.2 | A (Critical) | Add `aria-label="Remove step"` etc. |
| `.step-drag-handle` has no keyboard alternative | 2.1.1 | A (Critical) | Add keyboard reorder (Alt+↑/↓) or documented limitation |
| Canvas inputs (flow-name, baseUrl) have no visible label | 1.3.1 | AA | Add `<label>` elements or `aria-label` |
| Button focus ring missing | 2.4.7 | AA | Add `:focus-visible` styles to all buttons |
| Execution log not announced to screen readers | 4.1.3 | AA | Add `aria-live="polite"` to exec-log |
| SSE-driven status badge not announced | 4.1.3 | AA | Add `aria-live="assertive"` for PASSED/FAILED badge |

---

### 9. Performance Perception Audit

```
Largest Contentful Paint (LCP):  Fast — single-page app, no hero images
Total Blocking Time:             Low — React + Vite build, no heavy synchronous ops
Cumulative Layout Shift (CLS):   Low — fixed layout, no lazy-loaded images above fold
Skeleton loading coverage:       0% — no skeletons implemented
Perceived blank states:          History/Analytics panels appear blank during initial fetch
```

---

### 10. Anti-Pattern Detection

| Anti-Pattern | Found? | Locations |
|-------------|--------|----------|
| Gradient for decoration | ✗ No | — |
| 2+ accent colors active | ✗ No | Single blue accent throughout |
| Glass/blur as structure | ✗ No | — |
| Shadow as decoration | ✗ No | Shadow only on hook-menu overlay |
| Unmotivated animation | ✗ No | All transitions are state-feedback |
| Icon + label redundancy | ✗ No | — |
| Border radius inconsistency | ⚠ Minor | 3/4/6/8/10px in use — mostly intentional |
| Off-system color | ✓ Yes | 3 hardcoded hex values + 7 hardcoded rgba values |
| 3+ type sizes per view | ⚠ Minor | 5-6 sizes visible in canvas — acceptable for IDE density |
| Weight as decoration | ✗ No | Weight follows hierarchy |
| Body letter-spacing | ✗ No | Only on uppercase labels |
| Spacing off-scale | ⚠ Minor | 5px, 7px values (close but not on 4px base scale) |
| Alignment inconsistency | ✗ No | All flex-based, consistent |
| Modal > 80vh | ✗ N/A | No modals |
| 3+ visual hierarchy levels | ✗ No | Well-managed surface stack |
| `!important` usage | ✓ Yes | `.step-remove:hover` — 1 instance |

---

## PRIORITY MATRIX

| Finding | Impact (1-5) | Effort (1-5) | Priority |
|---------|------------|------------|---------|
| Button focus-visible ring missing | 5 (a11y) | 1 | H |
| Icon-only buttons missing aria-label | 5 (a11y) | 1 | H |
| Hardcoded color values (tokenize) | 3 | 1 | H |
| Canvas empty state copy too technical | 3 | 1 | H |
| Analytics missing empty state | 3 | 2 | H |
| Skeleton loading for panels | 3 | 3 | M |
| Canvas inputs missing labels | 4 (a11y) | 2 | M |
| Config panel missing selected-node header | 3 | 2 | M |
| Exec log aria-live missing | 4 (a11y) | 1 | M |
| Arbitrary spacing values (5px, 7px) | 1 | 2 | L |
| Consolidate btn class variants | 1 | 2 | L |

---

## REMEDIATION ROADMAP

### Phase 1 — Foundation (high impact, low effort)
```
[ ] Add :focus-visible ring to ALL button elements in styles.css
[ ] Add aria-label to all icon-only interactive elements
[ ] Tokenize 3 hardcoded hex values (#0b0d12, #3a7de8, #93bbff)
[ ] Tokenize 7 hardcoded rgba() values as CSS custom properties
[ ] Fix canvas empty state copy
[ ] Add aria-live to exec-log and status badge
```

### Phase 2 — Consistency (moderate effort)
```
[ ] Add empty state to Analytics panel (0 executions)
[ ] Add loading skeleton for History and Analytics panels
[ ] Add aria-label to canvas flow-name and baseUrl inputs
[ ] Add config panel header showing selected node name
[ ] Round spacing values to 4px base scale (5px→4px or 6px, 7px→8px)
```

### Phase 3 — Polish
```
[ ] Consolidate .reset-btn and .copy-btn into shared .btn-ghost class
[ ] Add keyboard reorder for step rows (Alt+↑/↓ or announced limitation)
[ ] Verify tab order through full keyboard navigation pass
[ ] Lighthouse audit run + axe scan
```

---

## COMPONENT INVENTORY

| Component | File Path | States Complete | Token Compliant | Notes |
|-----------|----------|----------------|----------------|-------|
| App Shell | App.jsx / styles.css | ✓ | ✓ | — |
| ActionPalette | features/palette/ | ✓ default, hover, disabled | ✓ | No empty state for 0 items |
| Canvas | features/canvas/Canvas.jsx | ✓ empty | ✓ | Empty copy needs revision |
| SuiteBlock | features/canvas/SuiteBlock.jsx | ✓ selected, named | ✓ | — |
| TestBlock | features/canvas/TestBlock.jsx | ✓ selected, error, step-count | ✓ | — |
| HookBlock | features/canvas/HookBlock.jsx | ✓ | ✓ | — |
| StepRow | features/canvas/StepRow.jsx | ✓ hover, selected, error, warn, disabled | ✓ | Remove btn keyboard gap |
| ConfigPanel | features/config/ConfigPanel.jsx | ✓ | ✓ | Missing node context header |
| CodePanel | features/codegen/CodePanel.jsx | ✓ | ✓ | — |
| ExecutionPanel | features/execution/ExecutionPanel.jsx | ✓ running, passed, failed, error | ✓ | Missing aria-live |
| HistoryPanel | features/history/HistoryPanel.jsx | partial | ✓ | Empty/error states unverified |
| AnalyticsPanel | features/analytics/AnalyticsPanel.jsx | partial | ✓ | Missing empty state (0 runs) |
| Tab Bar | App.jsx / styles.css | ✓ active | ✓ | — |
| Validation Banner | styles.css | ✓ error, warn | ⚠ | Uses rgba() not tokens |
