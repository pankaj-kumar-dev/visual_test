# DESIGN DECISIONS
> Rationale log for every non-obvious design choice.
> Never delete. Mark obsolete entries [SUPERSEDED] with link to replacement.

---

## HOW TO USE THIS FILE

When you make a design decision that:
- Goes against a common pattern or default expectation
- Has meaningful trade-offs that should be understood by future designers/developers
- Will be questioned ("why does this work this way?")
- Overrides a principle from UX_PRINCIPLES.md (must be documented)

Log it here using the format below.

**Rule:** If someone implements a decision without checking here first and builds the wrong thing, this file failed its job. Keep it updated.

---

## DECISIONS

---

### DARK MODE NATIVE — NO LIGHT MODE

Date:       2026-05-26
Status:     Active
Area:       Visual / Color

Context:
  At project start, standard SaaS approach would offer a dark/light toggle.
  This is a developer tool used in focused coding sessions, likely in IDE-adjacent
  workflow (VS Code, terminal). Most developer tools (VS Code, terminal, browser DevTools,
  GitHub dark mode) default to or prefer dark.

Decision:
  Dark mode is the product. No light mode is planned or toggleable. The CSS custom
  properties define a dark-mode-native palette, not overrides.

Rationale:
  1. Developer audience strongly prefers dark themes (survey data: ~75% of devs use dark IDE)
  2. Dark theme reinforces technical, precise emotional register (Intelligent/Quiet)
  3. Eliminates dual-theme maintenance burden for a solo/small-team project
  4. The 4-level surface stack (`--bg` → `--surface-3`) would require complete redesign in light

Trade-offs:
  - Not accessible for users with photosensitivity who prefer light (minority in this target audience)
  - Would require complete redesign if product pivots to broader audience

Alternatives Considered:
  - System preference via `prefers-color-scheme`: adds complexity, requires full dual-palette
  - Light-first with dark toggle: wrong for audience signal

See Also: VISUAL_LANGUAGE.md → Dark Mode Philosophy

---

### SYSTEM FONT STACK — NO CUSTOM TYPEFACE

Date:       2026-05-26
Status:     Active
Area:       Typography

Context:
  Options evaluated: Inter (Google Fonts), Geist (Vercel), system font stack.
  Product is a developer tool with potential large data volumes (test steps, execution logs)
  rendered at high frequency. Users may keep this tool open in a second monitor.

Decision:
  System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
  No external font load. Fira Code loaded for monospace (code content only — justified).

Rationale:
  1. Zero font load cost — no render blocking, no FOUT (flash of unstyled text)
  2. System fonts are platform-optimized at 12-14px (the tool's primary size range)
  3. IDE-adjacent tools (VS Code, DevTools) use system fonts — matches user's existing context
  4. Saves 30-80kb payload for a tool where users care about correctness, not font selection
  5. Fira Code for code is justified: monospace ligature support for `=>`, `===`, readability

Trade-offs:
  - Minor visual difference between Mac (SF Pro), Windows (Segoe UI), Linux (Roboto)
  - No custom brand differentiation through typography

Alternatives Considered:
  - Inter: Excellent, neutral, widely used in dev tools. Rejected: load cost without benefit
    over system fonts at this size range. Could revisit if product goes public-facing.
  - Geist (Vercel): Strong developer-tool association. Rejected: licensing complexity + load cost.

See Also: VISUAL_LANGUAGE.md → Typography Philosophy

---

### 13PX BASE FONT SIZE (NOT 16PX)

Date:       2026-05-26
Status:     Active
Area:       Typography

Context:
  Web convention is 16px body font. This tool displays dense UI: step rows, config
  fields, code output, analytics — all visible simultaneously.

Decision:
  13px global base (`body { font-size: 13px }`). Component text at 12px for most content.

Rationale:
  1. IDE-adjacent tools (VS Code 12-13px, GitHub 14px, Terminal 12px) operate at this density
  2. Users are power/intermediate developers comfortable with dense information displays
  3. 16px base would require reducing visible steps per panel, reducing tool utility
  4. Current contrast ratios remain WCAG AA compliant at 12px+ (not below 11px for body)

Trade-offs:
  - Not optimal for casual or accessibility-first audiences (not the target user)
  - Must maintain at least 11px as minimum for any visible text (currently respected)

Alternatives Considered:
  - 14px base: Would work but loses the "real IDE density" feel slightly
  - 16px base: Correct for consumer apps, wrong for dense dev tool

See Also: VISUAL_LANGUAGE.md → Typography Philosophy

---

### 4-LEVEL DARK SURFACE STACK (TONAL SEPARATION, NOT SHADOW)

Date:       2026-05-26
Status:     Active
Area:       Visual / Layout

Context:
  Dev tools typically use either flat dark (everything same shade) or shadow-based
  card separation. This tool has 4 distinct panel layers: page, panel, card/row, hover.

Decision:
  Tonal separation via 4 CSS surface variables:
  `--bg` (#0f1115) → `--surface` (#181b22) → `--surface-2` (#1f242e) → `--surface-3` (#252b38)

Rationale:
  1. Shadow-based elevation reads poorly in dark mode (shadows nearly invisible on dark bg)
  2. Tonal stack is clean — each surface reads as "one level closer to the user"
  3. Used consistently: panels on --surface, step rows on --surface-2, hover on --surface-3
  4. Semantic: code/log blocks intentionally go *below* --bg to signal "terminal output, not UI"

Trade-offs:
  - Subtle distinction between levels — requires calibrated monitor to see all 4 levels
  - Adding a 5th level would break the hierarchy

Alternatives Considered:
  - Shadow + same background: Too visible on dark bg, inconsistent with dark IDE aesthetic
  - Border-only separation: Could work but loses the spatial depth

See Also: VISUAL_LANGUAGE.md → Surface Treatment

---

### NO COMPONENT LIBRARY — RAW CSS

Date:       2026-05-26
Status:     Active
Area:       Architecture

Context:
  Options: Radix UI, Shadcn, MUI, Headless UI, or raw CSS.
  Project is an MVP portfolio showcase. Lean stack. React + Zustand + raw CSS.

Decision:
  No component library. All components hand-crafted in raw CSS with CSS custom properties.

Rationale:
  1. Zero dependency surface — no version conflicts, no breaking changes from upstream
  2. The CSS is simple enough that a library would add more boilerplate than it removes
  3. Full design control — no fighting library defaults
  4. Demonstrates CSS design skill (relevant for portfolio)
  5. Bundle size: no library overhead

Trade-offs:
  - Accessibility gaps that libraries solve automatically (dialog focus trap, ARIA roles)
  - Must implement all interaction states from scratch

Alternatives Considered:
  - Radix UI primitives: Good choice for accessibility. Rejected for MVP due to complexity overhead.
    Strongly recommended if product grows beyond MVP.
  - Shadcn: Too opinionated, wrong aesthetic for dark dev tool.

See Also: IMPLEMENTATION_GUIDE.md → Tech Stack Assumptions

---

### MONOSPACE FONT FOR COMMAND LABELS AND CODE ELEMENTS

Date:       2026-05-26
Status:     Active
Area:       Typography

Context:
  Command names in the palette (cy.visit, cy.get, cy.click) and in step rows
  need to be visually distinct from UI text.

Decision:
  All Cypress/Playwright command names, selector values, and generated code use
  `font-family: 'Fira Code', 'Menlo', monospace`.

Rationale:
  1. Semantic clarity: users immediately distinguish "code content" from "UI chrome"
  2. Matches the mental model: these ARE code — they look like code
  3. Monospace renders selector strings predictably (equal char widths prevent misreads)
  4. Fira Code provides ligature support for === and => (relevant in code panel)

Trade-offs:
  - Fira Code must load (external font). Acceptable — it's for code display, not body text.
  - Mixed typefaces on same screen requires careful size calibration

See Also: VISUAL_LANGUAGE.md → Typography Philosophy

---

### SINGLE ACCENT COLOR (BLUE) — NO SECONDARY ACCENT

Date:       2026-05-26
Status:     Active
Area:       Color

Context:
  Some dev tools use multi-color coding (red for delete, blue for primary, green for add).
  Considered using hook-type colors as accent variants.

Decision:
  Single accent color (#4f8cff). All other colors are semantic states (green=pass,
  amber=warning/afterHook, red=error). Hook type coloring uses opacity variants of accent
  (before hooks) and amber (after hooks) — not new accent colors.

Rationale:
  1. Anti-pattern: 2+ accent colors simultaneously on screen creates visual noise
  2. Hook colors (blue-tint/amber) are semantic (lifecycle position), not brand accents
  3. Single accent maintains trust through consistency (P10 — Trust Through Consistency)
  4. Reduces cognitive load: "blue = interactive/selected" is a learnable rule

Trade-offs:
  - beforeAll/beforeEach hooks need visual distinction without creating a second accent
  - Solution: use --hook-before (#93bbff) as a desaturated/pale variant, not a second accent

See Also: VISUAL_LANGUAGE.md → Color Philosophy, UI_RULES.md → Color Rules

---

### 3-PANEL FIXED LAYOUT (NO RESPONSIVE)

Date:       2026-05-26
Status:     Active
Area:       Layout

Context:
  The tool is used at a desktop in a focused work session. A 3-panel layout (palette
  180px | canvas fluid | right-panel 360px) is required for simultaneous visibility
  of all tool functions.

Decision:
  Fixed 3-column grid. No responsive behavior. Minimum useful width: ~900px.
  Not designed for tablet or mobile.

Rationale:
  1. Product category: professional desktop tool (like Figma, VS Code, Postman)
  2. The 3-panel view is the product — hiding panels defeats the purpose
  3. No responsive = no compromises in dense layout calibration
  4. Target user: developer at desktop workstation, not on mobile

Trade-offs:
  - Breaks on small laptop screens (13" at low resolution)
  - Not accessible for mobile users (not the target use case)

Alternatives Considered:
  - Collapsible panels: Adds complexity without clear benefit for current user
  - Tabbed single-panel: Destroys simultaneous visibility of canvas + code

See Also: LAYOUT_PATTERNS.md → App Shell archetype
