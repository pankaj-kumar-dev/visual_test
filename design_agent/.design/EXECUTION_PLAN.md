# EXECUTION PLAN
> Master control document for design → implementation pipeline.
> Read this before touching any file. All work flows from here.

---

## CURRENT STATE

```
Design Intelligence:  COMPLETE (boot sequence done 2026-05-26)
Implementation State: MVP — functional, no design system enforcement
Audit Status:         COMPLETE — 45+ findings logged in FRONTEND_AUDIT.md
Migration Status:     NOT STARTED
```

---

## EXECUTION PHILOSOPHY

Three constraints govern all decisions:

```
1. PRESERVE LOGIC    — Never break working code to fix visual issues.
                       Separate style changes from logic changes in every commit.

2. TOKEN-FIRST       — Before touching visual appearance, ensure the value is tokenized.
                       A hardcoded color fixed in one place re-appears in another.
                       Fix the token system first; the visual follows.

3. ATOMIC CHANGES    — Each task modifies one layer. Color changes don't touch layout.
                       Spacing changes don't touch accessibility. This reduces regression risk
                       and makes rollback surgical.
```

---

## PIPELINE DEPENDENCY MAP

```
TASK_QUEUE.md
      │
      ▼
REFACTOR_PRIORITY.md          ← Which tasks to execute in which order
      │
      ├──────────────────────────────────┐
      ▼                                  ▼
COMPONENT_MIGRATION_PLAN.md     SCREEN_BLUEPRINTS.md
(HOW to change)                 (WHAT the target looks like)
      │                                  │
      └─────────────────┬────────────────┘
                        ▼
              DESIGN_ENFORCEMENT.md       ← Rules every change must pass
                        │
                        ▼
              UI_DIFF_CHECKLIST.md        ← Validation gate before merge
```

---

## EXECUTION PHASES

### Phase 1 — Critical Trust Fixes (P0 tasks)
**Goal:** Remove accessibility blockers. Fix broken interactive states.
**Duration:** 1–2 sessions
**Success metric:** All buttons have visible focus ring. All icon-only buttons have aria-label.
**Risk:** Very low — additive changes only

Tasks: T001, T002, T003, T004, T008, T016

---

### Phase 2 — Token System (P1 tasks)
**Goal:** Every color value comes from a CSS custom property. Zero hardcoded values.
**Duration:** 1 session
**Success metric:** `grep -r '#[0-9a-f]\{3,6\}' frontend/src/styles.css` returns only `:root` definitions.
**Risk:** Low — purely mechanical substitution, no visual change

Tasks: T005, T006, T007, T009, T010, T011, T012

---

### Phase 3 — State Completion (P2 tasks)
**Goal:** Every panel has empty, loading, and error states.
**Duration:** 2–3 sessions
**Success metric:** Analytics/History panels never appear blank.
**Risk:** Medium — requires new component code (skeleton, empty state)

Tasks: T013, T014, T015, T017

---

### Phase 4 — Layout Consistency (P2 tasks)
**Goal:** Spacing on 4px scale. Config panel has node context. Canvas copy fixed.
**Duration:** 1 session
**Success metric:** No `5px` or `7px` spacing values. Config panel shows selected node name.
**Risk:** Low

Tasks: T018, T019, T020

---

### Phase 5 — Component System (P3 tasks)
**Goal:** Consolidate duplicate component patterns. Establish shared class vocabulary.
**Duration:** 1–2 sessions
**Success metric:** `.reset-btn` and `.copy-btn` share a common base class. `.step-remove` has no `!important`.
**Risk:** Low — internal CSS refactor, no logic changes

Tasks: T021, T022, T023

---

### Phase 6 — Interaction Refinement (P3 tasks)
**Goal:** Keyboard reorder for steps. Drag handle accessible.
**Duration:** 2–3 sessions
**Success metric:** Full keyboard navigation through step reorder without mouse.
**Risk:** High — requires new JS logic (keyboard event handler in StepRow)

Tasks: T024

---

## EXECUTION RULES

1. **One phase at a time.** Do not start Phase 3 tasks while Phase 1 tasks are incomplete.
2. **Validate with UI_DIFF_CHECKLIST.md after each task.** Mark task DONE only after validation.
3. **Log unexpected decisions in DESIGN_DECISIONS.md.** If implementation reveals a conflict with design intent, document it.
4. **DESIGN_ENFORCEMENT.md is law.** If a change violates enforcement rules, revert — don't add exceptions.
5. **Never remove a working interaction to implement a design fix.** Find the additive path.

---

## SESSION START PROTOCOL

When beginning a new implementation session:

```
1. Read REFACTOR_PRIORITY.md — identify current phase
2. Read TASK_QUEUE.md — identify next P0/P1 task
3. Check task dependencies — all deps must be DONE
4. Make the change
5. Run UI_DIFF_CHECKLIST.md against the change
6. Mark task DONE in TASK_QUEUE.md
7. Update FRONTEND_AUDIT.md if the finding is resolved
```

---

## COMPLETION CRITERIA

The design system is "implemented" when:

```
[ ] FRONTEND_AUDIT.md — all High and Medium findings resolved
[ ] TASK_QUEUE.md — all P0, P1, P2 tasks marked DONE
[ ] UI_DIFF_CHECKLIST.md — passes for every major screen
[ ] DESIGN_ENFORCEMENT.md — no violations found in codebase
[ ] Lighthouse a11y score ≥ 85/100
```
