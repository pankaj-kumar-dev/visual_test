# UI DIFF CHECKLIST
> Visual consistency gate. Run against every frontend change before marking a task DONE.
> Fail = fix the violation. Do not commit failing changes.

---

## HOW TO USE

1. Make your change
2. Open the app in browser
3. Work through the relevant sections below
4. Mark each item [ ] passing or [x] failing
5. Fix all [x] failures before committing
6. After all pass, mark the TASK_QUEUE.md task as DONE

You don't need to run ALL sections for every change. Use the change-type matrix:

| Change Type | Run Sections |
|------------|-------------|
| Color / CSS token change | A, G |
| Spacing / layout change | B, G |
| Typography change | C, G |
| New component / panel | A, B, C, D, E, F, G |
| Accessibility fix | E, G |
| Interaction / animation | F, G |
| Copy / microcopy change | D, G |

---

## SECTION A — COLOR CONSISTENCY

### A1 — Token Compliance
```
[ ] No new hardcoded hex values added outside :root in styles.css
[ ] No inline style with color values in JSX (style={{ color: '#...' }})
[ ] No rgba() in component CSS — only in :root token definitions
[ ] All new text uses var(--text) or var(--muted) or a documented semantic variant
[ ] All new backgrounds use var(--surface), var(--surface-2), or var(--surface-3)
[ ] All new borders use var(--border) or var(--border-2)
```

### A2 — Semantic Color Usage
```
[ ] --accent (blue) used ONLY for: interactive elements, selected state, active tabs
[ ] --green used ONLY for: PASSED status, success state, test-icon background
[ ] --yellow used ONLY for: warning state, afterHook lifecycle indicators, flaky badge
[ ] --danger used ONLY for: FAILED status, validation errors, destructive action hover
[ ] No second accent color introduced
```

### A3 — Contrast Check (for new text/background combinations)
```
[ ] Primary text (--text #e6e8ee) on any new background: verify ≥ 4.5:1
[ ] Muted text (--muted #8a93a6) on any new background: verify ≥ 4.3:1
[ ] Accent text (--accent #4f8cff) on any dark surface: verify ≥ 4.5:1
    Reference: --accent on --surface-2 (#1f242e) = 5.4:1 ✓
[ ] No new color combination below 4.5:1 for normal-size text
```

### A4 — Visual Anti-Patterns
```
[ ] No gradient on structural UI (header, sidebar, nav, card background)
[ ] No colored shadow (box-shadow using accent or state colors)
[ ] No glass/blur effect
```

---

## SECTION B — SPACING CONSISTENCY

### B1 — Scale Compliance
```
[ ] All new padding values: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 64px
[ ] All new margin values: same scale
[ ] All new gap values: same scale
[ ] No new 5px, 7px, 9px, 11px, 13px, 15px, 17px, or other off-scale values
[ ] No spacer div elements added
[ ] No negative margin compensation
```

### B2 — Visual Spacing Check
```
[ ] Open changed panel/component in browser
[ ] Items that belong together are visually closer than items in different groups
[ ] Spacing hierarchy: within-component < between-components < between-sections
[ ] Panel padding consistent with other panels (14px standard)
[ ] No element touches its container edge with zero padding
[ ] No unexpected visual gap/overflow introduced
```

### B3 — Layout Integrity
```
[ ] Changed area does not break the 3-column app grid
[ ] No horizontal scroll introduced on any panel (except code blocks — expected)
[ ] Right stack (360px) contents still fit without overflow
[ ] Config panel remains scrollable if content is tall
```

---

## SECTION C — TYPOGRAPHY CONSISTENCY

### C1 — Scale Compliance
```
[ ] All new font-size values from: 9, 10, 11, 12, 13, 14, 15, 16, 20px
[ ] No font-size below 10px (badges/counters) or below 11px (any readable text)
[ ] No font-size in rem (use px in this CSS-native project for consistency)
[ ] Body/label text: 11–13px
[ ] Code/command text: 12px monospace
[ ] Panel titles: 11px uppercase
```

### C2 — Weight and Hierarchy
```
[ ] New text element's weight matches its role:
    - Content labels, step text: 500 (medium)
    - Section headers, panel titles: 600–700 (semibold/bold)
    - Stat values: 700 (bold)
    - Body descriptions: 400–500
[ ] No weight used for decoration (bold used ONLY for hierarchy)
[ ] No mixing of 3+ weights in the same visual area
```

### C3 — Font Family
```
[ ] UI text (labels, panel titles, descriptions): system-ui stack
[ ] Code text (commands, selectors, generated code, logs): Fira Code monospace
[ ] No monospace on navigation items, panel titles, or non-code UI text
[ ] No serif font used anywhere
```

### C4 — Letter Spacing
```
[ ] letter-spacing added ONLY when text-transform: uppercase is also applied
[ ] No letter-spacing on body/content text
[ ] No letter-spacing below 0.5px on uppercase labels (subtle tracking is fine; zero isn't)
```

---

## SECTION D — INFORMATION HIERARCHY

### D1 — Visual Weight
```
[ ] Each screen/panel has one clearly dominant element
[ ] No two elements compete at equal visual weight for primary attention
[ ] Primary action (.btn-primary / .run-btn) is visually dominant — only one per view
[ ] Destructive actions (remove buttons) are visually recessive, not dominant
```

### D2 — Content Grouping
```
[ ] Related items are visually grouped (proximity + spacing)
[ ] Unrelated items are visually separated (spacing ≥ 16px between groups)
[ ] Section titles introduce what follows (no orphaned content)
[ ] Labels visually precede their inputs (no label-below-input)
```

### D3 — Copy Review (for any text change)
```
[ ] Empty state has clear headline + 1-sentence description + CTA
[ ] Error messages say WHAT failed and WHAT to do (not just "Something went wrong")
[ ] Success messages are brief (max 3 words: "Saved", "Copied", "PASSED")
[ ] No performative enthusiasm ("Awesome!", "Great job!", emoji on functional text)
[ ] No developer-internal vocabulary exposed to users ("root suite", "node", "schema")
    Exception: Cypress/Playwright terms are intentionally developer-facing vocabulary
[ ] Button labels: verb (+ object if ambiguous). No "Yes"/"No"/"OK"/"Submit"
```

---

## SECTION E — ACCESSIBILITY

### E1 — Keyboard Navigation
```
[ ] All new interactive elements are keyboard reachable via Tab key
[ ] Tab order is logical (left-to-right, top-to-bottom in the DOM order)
[ ] No interactive element has tabindex > 0 (breaks natural tab order)
[ ] Escape key closes any newly opened overlay, dropdown, or modal
```

### E2 — Focus Visibility
```
[ ] Every new focusable element has a visible :focus-visible style
[ ] Focus ring uses var(--accent) at 2px solid, 2px offset
[ ] No outline: none without replacement custom focus style
[ ] Focus ring is visible against all backgrounds in the app
```

### E3 — ARIA
```
[ ] New icon-only buttons have aria-label
[ ] New form inputs have either <label htmlFor=...> or aria-label
[ ] Decorative icons have aria-hidden="true"
[ ] New dynamically updating content has aria-live="polite" or "assertive"
[ ] New status changes use aria-atomic="true" if the whole region should be re-read
```

### E4 — Color Independence
```
[ ] New state communication doesn't rely on color alone:
    - Error: red border + error text message (both)
    - Success: green color + text label (both)
    - Warning: amber + text (both)
[ ] Icon reinforces color where color carries meaning
```

---

## SECTION F — INTERACTION QUALITY

### F1 — Animation Compliance
```
[ ] New transitions ≤ 400ms (300ms max preferred)
[ ] Transition uses ease-out for entrances, ease-in for exits
[ ] No animation without a UX purpose (spatial/feedback/orientation/continuity)
[ ] No page-load animation (no fade-in on app mount, no logo spin)
[ ] No scroll-triggered animation in application panels
```

### F2 — Loading States
```
[ ] New async operations show loading state within 500ms of trigger
[ ] Loading state describes WHAT is loading (not just "Loading...")
[ ] Loading state prevents double-submission (button disabled while loading)
[ ] No blank area appears during load — skeleton or previous state shown
```

### F3 — Feedback Completeness
```
[ ] Every new button-triggered action has immediate visual feedback (< 16ms)
[ ] Errors show at point of failure (inline on field, not only in top banner)
[ ] Success confirmation is proportional to action importance
[ ] No "silent" UI — no action leaves the UI in unchanged state for > 500ms
```

---

## SECTION G — EMOTIONAL ALIGNMENT

### G1 — Product Character Check
```
[ ] The changed area feels like a precision developer tool, not a consumer app
[ ] No rounded-pill buttons (pills are for tags/badges only)
[ ] No decorative illustrations on functional panels
[ ] No gradient header/sidebar
[ ] Typography communicates precision (tight, technical, not playful)
```

### G2 — Trust Signals
```
[ ] Generated code is still clearly visible and accurate after the change
[ ] Selected node state is clearly communicated (visual selection is obvious)
[ ] Error messages remain specific and actionable
[ ] No changes obscure execution status or test result feedback
```

### G3 — Density Appropriateness
```
[ ] The changed panel retains appropriate information density for a dev tool
[ ] No unnecessary whitespace added to dense data panels
[ ] No unnecessary content compression in reading/review panels
[ ] Balance: can the user still see what they need at a glance?
```

---

## QUICK VISUAL SANITY TEST

Run this every time, regardless of change type:

```
1. Load app (npm run dev or open in browser)
2. Load "Login flow" example from canvas header
3. Click on a step in the canvas → config panel updates
4. Check code panel shows Cypress code
5. Tab through header: Undo, Redo, Save, Reset — all show focus ring
6. Tab into canvas: Tab reaches first input (flow-name) — check aria-label announced
7. Nothing looks broken. Nothing looks visually jarring.
```

If any of the above fails, the change has a regression. Fix before committing.

---

## SIGN-OFF FORMAT

When all sections pass, add this sign-off to your task entry in TASK_QUEUE.md:

```
VALIDATED: 2026-XX-XX
  A: Color ✓  B: Spacing ✓  C: Typography ✓  D: Hierarchy ✓
  E: A11y ✓   F: Interaction ✓   G: Emotional ✓
  Sanity test: PASS
```
