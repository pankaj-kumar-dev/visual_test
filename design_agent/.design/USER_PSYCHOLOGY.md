# USER PSYCHOLOGY
> How users think, feel, and behave. Design must serve these realities — not fight them.
> Derived from: PRODUCT_ESSENCE.md → product category, user profile, emotional arc

---

## MENTAL MODELS

Users arrive with pre-existing mental models from products they've used before. The UI must either:
1. **Conform** to the dominant mental model (lower learning curve, familiar = trusted), or
2. **Deliberately diverge** with clear onboarding that reframes the model (higher risk, higher differentiation)

```
Dominant Mental Model:    IDE (left panel = tools/files, center = editor, right = output/config).
                          Also: Cypress test runner (describe → it → step tree).

Our Model:                Same — intentionally. Canvas maps to test file structure.
                          Palette = command library. Config panel = argument editor. Code panel = preview.

Divergence Risk:          Low — we match the existing IDE mental model deliberately.
Mitigation Strategy:      Terminology matches Cypress/Playwright exactly (suite, test, beforeEach,
                          afterAll). No invented vocabulary.
```

### Model Mapping

| User Expects | We Provide | Mapping Quality |
|-------------|-----------|----------------|
| describe() block | Suite block on canvas | direct |
| it() / test() block | Test block inside suite | direct |
| beforeEach() / afterAll() etc. | Hook block with labeled kind | direct |
| cy.get().click() chain | Step row with chain badges | analogous |
| Generated .cy.ts file | Code panel preview | direct |
| Terminal test output | Execution log panel | analogous |

---

## COGNITIVE LOAD PROFILE

Different user tasks impose different cognitive loads. Design must calibrate information density per context.

```
Primary Task Load:    Medium — building a test suite is moderately complex but users
                      are domain experts. Load comes from *selector correctness*, not UI confusion.

Secondary Task Load:  Low — reviewing code, running tests, checking history. Familiar patterns.

Appropriate Density:  Information-rich (expert tool). Do NOT simplify aggressively.
                      Three panels visible simultaneously is correct for this user type.
```

### Cognitive Overload Signals

For this product, overload comes from:
- Validation errors not surfaced at point of error (users won't scan for banners at top)
- Code panel out of sync with canvas state (trust breaks instantly)
- Execution status unclear during run (did it finish? did it hang?)
- Step configuration ambiguity (which argument does what?)

---

## ANXIETY POINTS

### Primary Anxiety Points (this product)

**1. Code correctness anxiety** — "Will this generated code actually work in CI?"
- Trigger: Every step added/configured; any selector input
- Design response: Real-time validation with specific error messages on the step row itself.
  Code panel updates instantly. Errors at point of occurrence, not just on "Run".

**2. Execution progress anxiety** — "Is it running? Did it hang? Why is it taking so long?"
- Trigger: Clicking Run → waiting for Cypress/MockRunner to complete
- Design response: Live SSE log stream visible immediately. Status badge shows RUNNING → PASSED/FAILED.
  If > 3s, step-by-step progress updates in execution panel.

**3. Selection anxiety** — "Which suite/test/step am I editing? Did my config change apply?"
- Trigger: Clicking between nodes while config panel shows last-selected state
- Design response: Selected node highlighted with accent border. Config panel title shows
  selected node name. Changes apply immediately (no "save" button on config).

---

## DELIGHT ARCHITECTURE

Delight moments for this user type are functional, not decorative:

```
Primary Delight Moments:
  1. First time generated code appears in code panel — instant, correct, readable
  2. First successful test run (PASSED green badge, step timings visible)
  3. Drag-to-reorder a step and watching the code update in real time

Delight Budget:   Minimal — developer users distrust excessive celebration.
                  No confetti, no mascots, no "Great job!" messages.
                  Delight = "this tool did exactly what I expected, instantly."
```

---

## TRUST BUILDING ARCHITECTURE

```
Primary Trust Signals:
  1. Code quality — generated code must be clean, idiomatic, syntactically correct
  2. State transparency — selected node, execution status, validation errors all visible simultaneously
  3. Instant feedback — canvas change → code panel updates in < 100ms (feels like truth)

Trust-Critical Screens:
  - Code panel (will developers trust this output enough to commit it?)
  - Execution panel (does the pass/fail accurately reflect test reality?)
  - Step row validation (are errors specific and actionable?)
```

---

## BEHAVIOR PATTERNS BY USER SOPHISTICATION

```
User Sophistication Mix:  70% intermediate developers (know Cypress/Playwright basics,
                          want faster authoring), 30% power users (QA engineers who
                          own the test suite, need full hook/selector control)

Design Primary Target:    Intermediate developer — fast onboarding to canvas model,
                          full suite authoring without consulting docs

Power User Affordances:
  - Full beforeAll/beforeEach/afterEach/afterAll hook support
  - Selector type system (CSS, XPath, test-id, role)
  - Chain command editor (multi-step assertion chains)
  - Import/export JSON flow format
  - Keyboard shortcuts (Ctrl+Z/Y for undo/redo)
```

---

## DECISION FATIGUE MANAGEMENT

### Choice Budget
- **Critical decisions**: target framework (Cypress vs. Playwright) — surfaced once in canvas header.
  Everything else defaults.
- **Moderate decisions**: step command type, selector strategy — presented with smart defaults
  (CSS selector default, click as default action).
- **Micro-decisions**: step arguments — last-used value restored where appropriate.

### Default Philosophy
```
Smart Defaults:    Cypress as default target. CSS selector as default selector type.
                   "cy.visit" as first suggested step for empty test.
Reversibility:     Undo/redo stack on every action. No confirmation required for canvas changes.
Last Used:         Not implemented in MVP; future: remember last selector type per user.
```

---

## FEEDBACK LOOP REQUIREMENTS

| Action | Feedback Required | Timing |
|--------|-----------------|--------|
| Step added to canvas | Step appears instantly, code panel updates | < 100ms |
| Step configured (selector typed) | Validation state updates | < 500ms (debounced) |
| Flow saved | "Saving…" → "Saved ✓" or "Error ✗" text in Save button | < 500ms start |
| Run triggered | RUNNING badge + log stream starts | < 500ms |
| Test passes/fails | PASSED/FAILED badge + green/red color | Immediate on SSE event |
| Undo/redo | Canvas updates instantly | < 16ms |

```
Feedback Expectations:  Users expect IDE-like responsiveness. Any perceived lag between
                        canvas action and code panel update breaks trust.

Tolerance for Silence:  < 500ms for any user-triggered action. Execution panel must show
                        "running" state immediately even before first SSE event arrives.
```

---

## PSYCHOLOGY-TO-DESIGN SIGNAL

```yaml
psychology_signal:
  primary_anxieties:        [code_correctness, execution_progress, selection_state]
  cognitive_load_target:    rich
  trust_investment_level:   high
  delight_budget:           minimal
  feedback_sensitivity:     high
  default_aggressiveness:   moderate
  sophistication_target:    power (with intermediate accessibility)
```
