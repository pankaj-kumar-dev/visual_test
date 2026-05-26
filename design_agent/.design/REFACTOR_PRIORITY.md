# REFACTOR PRIORITY
> Execution roadmap. Phases in order. Tasks within phases by impact/risk ratio.
> This is the answer to: "what do I work on next?"

---

## READING THIS FILE

Each phase has a **gate condition** — the phase is DONE only when the gate passes.
Do not advance to the next phase until the gate condition is met.

**Current phase:** → Phase 1 (not started)

---

## PHASE 1 — CRITICAL TRUST (P0 tasks)

**Goal:** Remove all WCAG AA violations. Ensure keyboard users can operate the tool.

**Why first:** Accessibility violations are not cosmetic — they are blockers for real users
and legal requirements. These fixes are also zero-risk (additive CSS + JSX attributes).
High impact, near-zero effort. No excuse to defer.

**Gate Condition:** Tab through entire app from top-left to bottom-right. Every interactive
element is reachable by keyboard and has a visible focus ring. Every icon-only button
announces its purpose when focused with a screen reader.

### Task Execution Order

| Order | Task ID | What | Files | Time |
|-------|---------|------|-------|------|
| 1 | T001 | Button :focus-visible ring | styles.css | 5 min |
| 2 | T002 | aria-label icon-only buttons | StepRow, SuiteBlock, TestBlock, HookBlock | 15 min |
| 3 | T008 | aria-label canvas inputs | Canvas.jsx | 5 min |
| 4 | T003 | aria-live execution log + status badge | ExecutionPanel.jsx | 10 min |

**Commit message after Phase 1:** `fix(a11y): add focus-visible rings, aria-labels, aria-live regions`

---

## PHASE 2 — TOKEN SYSTEM (P1 tasks)

**Goal:** Zero hardcoded color values outside `:root`. Complete CSS custom property system.

**Why second:** Tokens enable everything downstream. Once all values are in the token system,
visual changes become single-source updates. Debugging "why does this color look different
on that component" disappears.

**Gate Condition:**
```bash
grep -n '#[0-9a-fA-F]\{3,8\}' frontend/src/styles.css
```
Returns ONLY lines inside the `:root { }` block. Zero matches outside.

### Task Execution Order

| Order | Task ID | What | Time |
|-------|---------|------|------|
| 1 | T019 | Add .panel-empty CSS (needed by Phase 3) | 5 min |
| 2 | T020 | Add .skeleton CSS (needed by Phase 3) | 10 min |
| 3 | T005 | Tokenize #0b0d12 → --surface-code | 5 min |
| 4 | T006 | Tokenize #3a7de8 → --accent-hover | 3 min |
| 5 | T007 | Tokenize #93bbff → --hook-before | 3 min |
| 6 | T016 | Remove !important from .step-remove | 3 min |
| 7 | T009 | Tokenize rgba(79,140,255,...) variants | 15 min |
| 8 | T010 | Tokenize state bg rgba values | 10 min |
| 9 | T011 | Tokenize hook bg rgba values | 10 min |
| 10 | T012 | Tokenize test-icon bg (uses T010's token) | 2 min |

**Note:** T019 and T020 go first because Phase 3 components need those CSS classes ready.
They are P2 tasks but sequenced here for dependency reasons.

**Commit message after Phase 2:** `refactor(tokens): normalize all color values to CSS custom properties`

---

## PHASE 3 — STATE COMPLETION (P2 tasks)

**Goal:** Every panel renders purposefully in all states (empty, loading, error, populated).

**Why third:** After tokens are clean, adding component states is safe — we know the visual
system is consistent. New CSS classes reference tokens, not hardcoded values.

**Gate Condition:** Load the app with no backend running. Analytics and History panels must
show loading then error states, not blank panels. Load the app fresh with no flows saved.
Analytics must show the empty state, not zeroed stat cards.

### Task Execution Order

| Order | Task ID | What | Time |
|-------|---------|------|------|
| 1 | T004 | Fix canvas empty state copy | 2 min |
| 2 | T013 | Analytics empty state | 30 min |
| 3 | T015 | Analytics loading + error states | 20 min |
| 4 | T014 | History empty + loading + error states | 30 min |
| 5 | T017 | Config panel selected-node header | 20 min |

**Commit:** `feat(ui): add empty/loading/error states to analytics and history panels`
**Commit:** `feat(ui): add selected-node context header to config panel`

---

## PHASE 4 — LAYOUT CONSISTENCY (P3 tasks)

**Goal:** Spacing values on 4px scale. Visual micro-polish.

**Why fourth:** After states are complete, polish existing components. This phase is
low urgency but improves the tool's "precision" feeling — appropriate for a dev tool.

**Gate Condition:** No spacing value exists in styles.css that isn't on the 4px scale
(outside of the 1px border exceptions). Visual inspection shows no obvious optical
inconsistencies in padding.

### Task Execution Order

| Order | Task ID | What | Time |
|-------|---------|------|------|
| 1 | T018 | Align spacing to 4px base scale | 20 min |

**Commit:** `style: align spacing values to 4px base scale`

---

## PHASE 5 — COMPONENT SYSTEM (P3 tasks)

**Goal:** Unified button vocabulary. Documented component variants.

**Why fifth:** This is internal cleanup — no user-visible benefit except reduced drift risk
over time. Important for maintainability but not for user experience.

**Gate Condition:** `grep -n 'reset-btn\|copy-btn\|run-btn' frontend/src` returns zero results.
All usages migrated to `.btn-ghost` and `.btn-primary`.

### Task Execution Order

| Order | Task ID | What | Time |
|-------|---------|------|------|
| 1 | T021 | Add .btn-ghost, update JSX | 20 min |
| 2 | T022 | Add .btn-primary, update JSX | 10 min |
| 3 | T023 | Document button variants in COMPONENT_RULES.md | 15 min |

**Commit:** `refactor(components): consolidate button classes to btn-ghost and btn-primary`

---

## PHASE 6 — INTERACTION REFINEMENT (P3 tasks)

**Goal:** Keyboard step reorder. Full keyboard operability.

**Why last:** Highest risk, requires new JS. Everything else must be stable before
introducing new interaction logic.

**Gate Condition:** User can reorder a step within a test using Alt+↑ / Alt+↓ keyboard
shortcuts without touching the mouse.

### Task Execution Order

| Order | Task ID | What | Time |
|-------|---------|------|------|
| 1 | T024 | Keyboard reorder for step rows | 60–90 min |

**Commit:** `feat(a11y): add keyboard step reorder with Alt+Up/Down`

---

## PRIORITY DECISION FRAMEWORK

When two tasks feel equal priority, use this tiebreaker:

```
1. Does it affect a real user right now?             → highest priority
2. Does it enable other tasks (dependency)?          → second priority
3. Is it zero-risk?                                  → prefer earlier
4. Does it improve user trust in the output?         → prefer earlier
5. Is it polish with no functional impact?           → prefer later
```

---

## BLOCKED WORK (do not start)

| Task | Blocked By | Condition to Unblock |
|------|-----------|---------------------|
| T012 | T010 | --state-success-bg token must exist |
| T013 | T019 | .panel-empty CSS class must exist |
| T014 | T019, T020 | .panel-empty + .skeleton CSS must exist |
| T015 | T013 | analytics empty state pattern must be established |
| T021 | none | but verify T006 done (--accent-hover) |
| T024 | T002 | aria pattern established first |

---

## COMPLETION SUMMARY

| Phase | Tasks | Estimated Time | Current |
|-------|-------|---------------|---------|
| 1 — Critical Trust | 4 | ~35 min | NOT STARTED |
| 2 — Token System | 10 | ~66 min | NOT STARTED |
| 3 — State Completion | 5 | ~102 min | NOT STARTED |
| 4 — Layout Consistency | 1 | ~20 min | NOT STARTED |
| 5 — Component System | 3 | ~45 min | NOT STARTED |
| 6 — Interaction | 1 | ~75 min | NOT STARTED |
| **TOTAL** | **24** | **~6 hrs** | |
