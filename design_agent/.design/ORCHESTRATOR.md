# DESIGN ORCHESTRATOR
> Master control file. Read this first. Every other file answers to this one.

---

## WHAT THIS IS

A portable design intelligence framework. Drop `.design/` into any project repository. It functions as:
- A product identity engine
- An implementation-aware design strategist
- A consistency enforcement system
- An anti-pattern detector

Not a mood board. Not a style guide afterthought. A reasoned operating system for design decisions.

---

## BOOT SEQUENCE

When deployed into a new project, run this sequence in order. Do not skip layers — each feeds the next.

```
STEP 1  →  Scan project (code, copy, naming, domain)
STEP 2  →  Populate PRODUCT_ESSENCE.md
STEP 3  →  Derive USER_PSYCHOLOGY.md from product signals
STEP 4  →  Define BRAND_TONE.md from psychology + product category
STEP 5  →  Establish UX_PRINCIPLES.md as decision filters
STEP 6  →  Build VISUAL_LANGUAGE.md from tone + principles
STEP 7  →  Define LAYOUT_PATTERNS.md from workflow density
STEP 8  →  Write COMPONENT_RULES.md from layout + visual language
STEP 9  →  Define INTERACTION_RULES.md from user psychology
STEP 10 →  Run FRONTEND_AUDIT.md against existing UI
STEP 11 →  Synthesize DESIGN_SYSTEM.md (tokens + scales)
STEP 12 →  Write IMPLEMENTATION_GUIDE.md (developer handoff)
STEP 13 →  Log all non-obvious decisions in DESIGN_DECISIONS.md
STEP 14 →  Distill hard rules into UI_RULES.md
```

---

## PIPELINE DEPENDENCY MAP

```
PRODUCT_ESSENCE          ← Project scan: domain, copy, route names, API shapes
        │
        ▼
USER_PSYCHOLOGY          ← Derived from: product category + user trust requirements
        │
        ▼
BRAND_TONE               ← Derived from: psychology + emotional register + competitor gap
        │
        ▼
UX_PRINCIPLES            ← Derived from: tone + workflow density + cognitive load profile
        │
        ├──────────────────────────────────────────────────┐
        ▼                                                  ▼
VISUAL_LANGUAGE                                    LAYOUT_PATTERNS
        │                                                  │
        └─────────────────┬────────────────────────────────┘
                          ▼
                  COMPONENT_RULES
                          │
                          ▼
                 INTERACTION_RULES
                          │
                          ├──────────────────┐
                          ▼                  ▼
                   DESIGN_SYSTEM      FRONTEND_AUDIT
                          │
                          ▼
               IMPLEMENTATION_GUIDE
                          │
                          ▼
                      UI_RULES            (distilled from everything above)
```

**Rule:** Never define VISUAL_LANGUAGE before BRAND_TONE. Color choices made before emotional register is defined are guesses.

**Rule:** Never define COMPONENT_RULES before LAYOUT_PATTERNS. Components must understand the spatial system they inhabit.

**Rule:** DESIGN_SYSTEM.md contains only tokens and scales — no reasoning. Reasoning lives in VISUAL_LANGUAGE.md.

---

## PROJECT SCANNING PROTOCOL

When scanning a new project, extract signals from:

### From Code
- Route/page names → workflow map, feature scope
- Component names → existing design language
- CSS class names → current design philosophy (or lack thereof)
- API endpoint names → data model complexity
- Error message strings → brand voice signals
- Comment density → team technical culture

### From Copy
- Product name etymology → brand personality hints
- Tagline structure → promise type (speed / accuracy / calm / power)
- CTA verb choices → urgency level
- Error message tone → current brand voice
- Onboarding copy → assumed user sophistication

### From Domain/Context
- Product category classification (see below)
- Direct competitor aesthetic analysis
- Industry trust norms (finance ≠ social ≠ creative tools)

### Product Category Classification

| Category | Trust Need | Density | Emotional Register | Primary Hazard |
|----------|-----------|---------|-------------------|----------------|
| Dev Tool | High | High | Calm/Precise | Over-design |
| SaaS Dashboard | Medium-High | High | Confident | Data overwhelm |
| Consumer App | Medium | Medium | Warm/Inviting | Blandness |
| Marketplace | Medium | High | Trustworthy | Visual noise |
| Creative Tool | Low | Variable | Expressive | Under-structure |
| Finance/Legal | Very High | Medium | Sober/Reliable | Cold/Clinical |
| Healthcare | Very High | Medium | Calm/Humane | Sterile |
| Community | Low | High | Energetic/Welcoming | Chaos |
| AI/Agent Tool | High | High | Intelligent/Quiet | Sci-fi noise |

---

## INSPIRATION ANALYSIS PROTOCOL

For each inspiration reference in `inspirations/`, extract these layers — NOT visual aesthetics:

1. **Spacing philosophy** — How does whitespace carry meaning?
2. **Typography rhythm** — How do type scales create hierarchy?
3. **Interaction density** — How much happens per click/hover?
4. **Information hierarchy** — What's always visible vs. revealed?
5. **Trust architecture** — Where are trust signals placed and why?
6. **Minimal moment** — What is stripped away that others keep?
7. **Motion economy** — When does it move and why?
8. **Error philosophy** — How does it handle failure states?
9. **Empty state craft** — What does zero-data feel like?
10. **Conversion geometry** — How is the eye led to action?

---

## EMOTIONAL IDENTITY DERIVATION

Emotional product identity is NOT a mood board. It is derived through this logic:

```
Product Category
    + Primary User Job-to-be-Done
    + Trust Level Required
    + Workflow Density
    + Competitor Gap Analysis
    ──────────────────────────────
    = Emotional Register
```

### Emotional Register Options

| Register | Color Temperature | Type Weight | Motion | White Space |
|----------|------------------|-------------|--------|------------|
| Calm / Precise | Cool neutrals | Light-Medium | Minimal, functional | Generous |
| Confident / Capable | Neutral + accent | Medium-Bold | Purposeful | Moderate |
| Warm / Approachable | Warm neutrals | Regular | Gentle, present | Balanced |
| Serious / Trustworthy | Deep neutrals, limited accent | Medium | Restrained | Controlled |
| Expressive / Creative | Broader range | Variable | Active | Tight or vast |
| Intelligent / Quiet | Greyed palette + precise accent | Light | Micro-only | Very generous |

---

## DESIGN CONSISTENCY ENFORCEMENT

Consistency is maintained through a hierarchy of constraints:

```
Layer 1 — Token Constraints   (DESIGN_SYSTEM.md)
    Colors must come from defined palette
    Spacing must use scale
    Type must use scale

Layer 2 — Component Contracts (COMPONENT_RULES.md)
    Every component has defined states
    No component invents new spacing
    No component uses undeclared colors

Layer 3 — Principle Filters   (UX_PRINCIPLES.md)
    Every design decision must pass at least one principle
    Trade-offs between principles must be logged

Layer 4 — UI Rules            (UI_RULES.md)
    Hard DO/DON'T pairs
    No exceptions without logged rationale
```

---

## ANTI-PATTERN DETECTION

Auto-flag the following during any design review:

### Visual Anti-Patterns
- [ ] Gradient used for decorative (non-semantic) purpose
- [ ] More than 2 accent colors active on a single screen
- [ ] Glass/blur used as structural element (not rare exception)
- [ ] Shadow used as decoration instead of elevation signal
- [ ] Animation without user-triggered cause or feedback purpose
- [ ] Icon + label redundancy without accessibility justification
- [ ] Border radius inconsistency across component family
- [ ] Color not from token system

### Typography Anti-Patterns
- [ ] More than 3 type sizes on a single view
- [ ] Weight used as decoration instead of hierarchy signal
- [ ] Letter-spacing applied to body text
- [ ] All-caps on more than one UI element per screen
- [ ] Line length over 75 characters in body
- [ ] Line height under 1.4 in paragraph text

### Layout Anti-Patterns
- [ ] Spacing value not on the defined scale
- [ ] Inconsistent alignment axis
- [ ] Content width exceeding reading comfort zone
- [ ] Card grid without consistent internal rhythm
- [ ] Modal taller than 80vh
- [ ] More than 3 levels of visual hierarchy on single screen

### Interaction Anti-Patterns
- [ ] Loading state without estimated duration feedback
- [ ] Error with no recovery action
- [ ] Success state that auto-dismisses before user reads it
- [ ] Hover effect with no keyboard equivalent
- [ ] Animation duration over 400ms for UI transition
- [ ] Scroll-triggered animation that blocks content reading

### Information Architecture Anti-Patterns
- [ ] Navigation item that doesn't map to a mental model
- [ ] Action buried more than 2 clicks from its logical trigger
- [ ] Destructive action without confirmation step
- [ ] Form field without visible label (placeholder-only)
- [ ] Empty state with no action path

---

## IMPLEMENTATION DERIVATION RULES

Design decisions must consider implementability:

1. **Token-first** — Every design value should be derivable from a token. If you can't name it, don't use it.
2. **Tailwind-aware** — Color scale, spacing scale, and type scale should map cleanly to Tailwind config.
3. **Component-bounded** — No design effect should require more than one external dependency.
4. **Responsive by default** — Every component is designed mobile-first; desktop is enhancement.
5. **State-complete** — Every component design includes: empty, loading, error, populated, disabled.
6. **Accessibility-native** — Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text. Focus visible always.

---

## MAINTENANCE PROTOCOL

Update cycle:

| File | Update Trigger |
|------|---------------|
| PRODUCT_ESSENCE | Product pivot, major feature addition |
| USER_PSYCHOLOGY | User research findings, support patterns |
| BRAND_TONE | Brand refresh, voice guideline update |
| DESIGN_DECISIONS | Every non-obvious decision made |
| FRONTEND_AUDIT | Before each major release |
| DESIGN_SYSTEM | Token additions or deprecations |
| UI_RULES | New anti-pattern discovered |

Never delete from DESIGN_DECISIONS. Mark obsolete entries `[SUPERSEDED]` with link to replacement.
