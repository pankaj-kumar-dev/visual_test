# PRODUCT ESSENCE
> Foundational product understanding. All design flows from here.
> Populate this first. Every other file depends on it.

---

## PRODUCT IDENTITY

```
Product Name:         Visual Test Builder
Product Category:     Dev Tool
Core Domain:          E2E test automation — visual composition of Cypress/Playwright test suites
Primary Platform:     Web app (browser-based, desktop-focused)
Launch Stage:         MVP
```

---

## THE JOB-TO-BE-DONE

> One sentence. What does this product let someone accomplish that they couldn't easily accomplish before?

```
Primary JTBD:   Build and run complete Cypress/Playwright test suites visually, without
                writing boilerplate code by hand — and immediately see the generated output.

Secondary JTBD: Review execution history and analytics to catch flaky tests before they
                land in CI.
```

**Validation:** "I built an E2E test without touching a code editor" — fully expressible without feature vocabulary. Identity is clear.

---

## USER PROFILE

```
Primary User:     Frontend and fullstack developers, QA engineers — technically proficient,
                  familiar with test runners (Cypress/Playwright), frustrated by boilerplate
                  and selector management.

Secondary User:   QA lead reviewing test history and flakiness reports without running tests.

Sophistication:   Power user / expert. Users understand describe/it/beforeEach semantics.
                  They do NOT need hand-holding through what a "test" is.

Context of Use:   Desktop browser, focused work session during development or QA sprint.
                  Not mobile. Not interrupted. Full attention.

Frequency:        Daily during active dev/QA cycles. Occasional for suite auditing.
```

### User Trust Requirements

| Dimension | Level | Rationale |
|-----------|-------|-----------|
| Data Privacy | low | No sensitive user data; test code is not proprietary secret |
| Financial Trust | n/a | No payments |
| Technical Trust | high | Generated code will be committed to CI — must be correct |
| Brand Authority | medium | Portfolio project; users judge quality by output quality |

---

## WORKFLOW DENSITY PROFILE

```
Workflow Density:     Expert-dense
Primary Action Flow:  build (canvas) → configure (config panel) → generate (code panel)
                      → run (execution panel) → review (history/analytics)
Session Length:       15–90 minutes for active suite authoring; 5–10 min for review
Interruption Tolerance: High — state is always saved/resumable; steps are discrete
```

### Density Definitions
- **Expert-dense** — This is an IDE-adjacent tool. Three panels visible simultaneously.
  Users are productive precisely because everything is visible at once. Don't reduce density.

---

## COMPETITIVE LANDSCAPE

```
Direct Competitors:   Cypress Studio (deprecated 2023), Playwright test recorder (basic),
                      TestCafe Studio

Adjacent Products:    VS Code test extension, Selenium IDE, Mabl, Applitools

Industry Standard UX: Left sidebar navigation, split editor/preview, tabbed panels,
                      monospace output, dark theme default

Industry Gap:         All tools either generate unreadable code OR provide visual UI that
                      doesn't map to how developers actually think about test structure
                      (describe/it/hooks). The mental model mismatch is universal.

Our Differentiator:   Tree structure matches Cypress/Playwright describe/it/hook semantics
                      directly — users see the code shape they know, visually.
```

### Competitive Design Positioning

```
         COMPLEX ←──────────────────→ SIMPLE
              │                          │
    DARK/     │   [Cypress Studio]       │
    PRECISE   │   [Playwright Recorder]  │
              │                          │
              │       [Visual Test  ]    │
    WARM      │       [Builder →    ]   │
              │                          │
```

Position: More structured than Cypress Studio (which felt like an afterthought), warmer
than raw IDE, developer-native without pretending to be a no-code consumer tool.

---

## EMOTIONAL EXPECTATIONS

```
Before State:   Frustrated — boilerplate fatigue, selector typos, test structure confusion,
                "why is this test failing in CI but passing locally"

After State:    Capable, in control — "I can see exactly what my test will do, the code
                is correct, and I can run it right here"

Emotional Arc:  Frustration → Clarity → Confidence
                UI must feel like control was *returned* to the developer, not taken away.
```

**Design implication:** The tool must feel precise and trustworthy, not playful or friendly.
Developers don't want reassurance — they want correctness. Design communicates competence.

---

## SPEED VS. ACCURACY BALANCE

```
Primary Value Driver:  Accuracy (generated code must be correct) + Speed (faster than writing)
Error Tolerance:       Low — test code goes to CI. Validation must be visible and specific.
Undo Philosophy:       Reversible-first — full undo/redo stack; no destructive-without-confirm
```

---

## VALUE HIERARCHY

1. Correctness of generated code (primary reason to trust the tool)
2. Speed of test suite assembly (core efficiency gain)
3. Clarity of test structure visible at a glance (canvas legibility)
4. Execution feedback quality (did it pass? why not?)
5. Analytics depth (flakiness detection, history)

**Design implication:** Code quality indicators (validation banners, step errors) get prime placement.
Analytics is valuable but secondary — buried in tabs is acceptable.

---

## ANTI-IDENTITY

This product is NOT:
- [ ] A consumer no-code tool for non-technical users
- [ ] A visual test recorder that produces fragile selector-based scripts
- [ ] A test management dashboard (Jira-style project tracking)
- [ ] A standalone CI/CD platform

**Why this matters:** The design must not drift toward:
- Onboarding flows, guided wizards, friendly mascots
- "Your first test!" celebration states
- Feature-complete enterprise UI chrome (breadcrumbs to 3 levels, sidebar navigation tree)

---

## PRODUCT CATEGORY SIGNAL MAP

```yaml
product_signal:
  category:           Dev Tool
  trust_level:        high
  workflow_density:   expert-dense
  emotional_register: Intelligent/Quiet
  primary_user_mode:  creating (test composition) + reviewing (execution output)
  differentiator:     "Test structure as first-class visual tree — not a recorder"
```

This signal block is referenced by: USER_PSYCHOLOGY.md, BRAND_TONE.md, VISUAL_LANGUAGE.md
