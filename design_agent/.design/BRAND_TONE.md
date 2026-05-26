# BRAND TONE
> Voice, personality, and emotional register. Derived from USER_PSYCHOLOGY.md + PRODUCT_ESSENCE.md.
> Every word in the UI is a design decision. This file governs those decisions.

---

## TONE DERIVATION

```
User Anxiety Profile:     Code correctness anxiety → voice must be precise, not reassuring.
                          Developers distrust vagueness.

Workflow Density:         Expert-dense → verbosity must be minimal. Labels not explanations.
                          Every character on screen competes for attention.

User Sophistication:      Power/intermediate developer → jargon is welcome.
                          Technical terms: "selector", "assertion", "beforeEach" — use them.

Competitive Differentiation: All test tools speak in either "enterprise bland" or
                          "developer aggressive". We occupy: precise + direct + respectful.

Emotional Arc:            Frustration → Confidence. Voice supports confidence by being
                          certain and specific. Never hedging. Never apologetic.
```

---

## VOICE ATTRIBUTES

```
Precise    →  Specific and correct, never vague        NOT  Pedantic or exhaustive
Direct     →  Says exactly what happened/what to do    NOT  Blunt or cold
Capable    →  Assumes user competence                  NOT  Condescending or over-explaining
Minimal    →  Uses fewest words that convey full meaning  NOT  Silent (no feedback)
```

### Tension Pairs in Detail

| Attribute | Is | Not |
|-----------|-----|-----|
| Precise | "Selector is empty — step will fail" | "There might be an issue with your configuration" |
| Direct | "Test passed in 1.2s" | "Your test has completed successfully! Great job!" |
| Capable | Uses "selector", "assertion", "hook" freely | "the thing you click on" |
| Minimal | "Saving…" then "Saved" | "Your changes are being saved to the server, please wait…" |

---

## VOICE IN CONTEXT

### Empty States
**Purpose:** Orient, show what goes here, provide the first action
**Tone:** Matter-of-fact. Describes the mechanic, not the emotion.
**Verbosity:** One or two lines max.
**Pattern:** "[What this area holds]. [How to populate it]."
**Examples:**
- Canvas: "No suites yet. Drag a command from the palette to create your first test."
- History: "No runs yet. Run a test suite to see results here."
- Analytics: "Run at least 2 test executions to see analytics."
**Anti-pattern:** "Wow, you're getting started! 🎉 Your test canvas is empty and waiting for your first test!"

### Error Messages
**Purpose:** Tell the developer exactly what broke and exactly what to fix.
**Tone:** Direct. Clinical is fine — this audience prefers precision over warmth.
**Verbosity:** Minimal — one sentence. If a second sentence adds recovery info, include it.
**Formula:** "[What is wrong]. [What to do]."
**Examples:**
- "Selector is empty — step will not generate valid code."
- "baseUrl is required to run tests. Add it in the canvas header."
- "Cypress is not installed. Run `npm install cypress` in your project."
**Anti-pattern:** "Something went wrong. Please try again." — tells user nothing.

### Success States
**Purpose:** Confirm without interrupting.
**Tone:** Minimal. Brief. The action speaks louder than the confirmation.
**Verbosity:** As short as possible — the user already knows what they just did.
**Examples:**
- Save: "Saved" (not "Your flow has been saved successfully!")
- Test pass: "PASSED · 1.2s" (status badge, not a toast)
- Code copy: "Copied" (1 second, then reverts)
**Anti-pattern:** "Awesome! Your flow has been saved! 🎉"

### Destructive Actions
**Purpose:** Ensure intentionality. Tone: factual, not alarmist.
**Formula:** "[Specific thing deleted/reset]. [What is lost]. [Confirm] [Cancel]"
**Examples:**
- Reset: "Reset this flow? All suites, tests, and steps will be removed."
**Anti-pattern:** "⚠️ WARNING: Are you SURE? This CANNOT be undone!!!"

### Loading / Processing States
**Purpose:** Tell the user what the system is doing, reduce waiting anxiety.
**Tone:** Active verb + optional time context.
**Examples:**
- "Saving…" (short operation — no time estimate needed)
- "Running tests…" (active verb, present tense)
- "Generating code…" (for any operation > 300ms)
**Anti-pattern:** "Loading…" with no context of what is loading.

### Validation / Inline Errors
**Purpose:** Immediate correction guidance at point of error.
**Tone:** Specific, instructional, non-judgmental.
**Format:** One line. Below the field or on the step row. No accusatory phrasing.
**Examples:**
- "Selector required"
- "Value must be a URL (e.g., https://example.com)"
- "Expected text is empty — assertion will always fail"

### Tooltips / Helper Text
**Purpose:** Clarify without interrupting flow. Appear on hover only.
**Tone:** Precise, minimal.
**Rule:** If a tooltip must explain what a button does, consider if the button label needs revision first.
**Anti-pattern:** Restating the visible label in different words.

### Navigation Labels
Noun-first, concrete, developer vocabulary:
- "Canvas" not "Editor" or "Builder"
- "Code" not "Generated Output" or "Preview"
- "Run" not "Execute Tests" or "Launch"
- "History" not "Past Runs" or "Test Results"
- "Analytics" not "Insights" or "Reports"

---

## MICROCOPY STANDARDS

### Button Labels
```
DO:    Single verb when context is clear ("Run", "Save", "Reset", "Undo", "Copy")
DO:    Verb + object when ambiguous ("Add Suite", "Load Example")
DO:    Match exact Cypress/Playwright vocabulary when relevant
DON'T: "Yes" / "No" — name the action ("Reset Flow" / "Cancel")
DON'T: "Submit" or "OK"
DON'T: Gerunds as CTA ("Running…" as a label — use for state text only)
```

### Palette Item Labels
```
DO:    Use exact Cypress/Playwright command names (cy.visit, cy.get, cy.click, cy.type)
DO:    Monospace font for command names
DON'T: Rename commands to friendlier alternatives (breaks mental model)
```

### Status Badges
```
PASSED   — green
FAILED   — red
RUNNING  — accent blue
QUEUED   — muted
SKIPPED  — muted
ERROR    — red
```

---

## TONE ANTI-PATTERNS

Never in this product:

**Performative enthusiasm** — "Amazing!", "Awesome!", "Super!", exclamation points on status text.

**False reassurance** — "Don't worry, this is easy!" Users are not worried — they're busy.

**Passive-aggressive politeness** — "Please make sure your selector is not empty" → just say "Selector is empty."

**Consumer-app patterns** — Emoji in functional UI (using ✓ in "Saved ✓" is acceptable, emoji in error messages is not).

---

## READING LEVEL

```
Target Reading Level:   Grade 10–12 (professional technical tool — assume domain knowledge)
Sentence Length:        Max 12 words for any single UI message
Vocabulary Standard:    Technical domain fully acceptable. "selector", "assertion",
                        "hook", "suite", "beforeEach" — never replace with plain-language
                        alternatives unless an explicit novice path is designed.
```

---

## BRAND TONE SIGNAL

```yaml
tone_signal:
  voice_register:         professional
  warmth_level:           neutral
  verbosity_setting:      minimal
  humor_allowed:          never
  emoji_policy:           functional (checkmarks, status icons only — not expressive)
  error_empathy:          matter-of-fact
```
