# UI RULES
> Hard DO/DON'T pairs. Distilled from every other file in this system.
> No exceptions without a logged entry in DESIGN_DECISIONS.md.

---

## COLOR RULES

**DO**
- Use semantic color tokens only (`--color-content-primary`, not `#1a1a1a`)
- Use state colors for their single defined purpose (danger = error only, not "emphasis")
- Use a single accent color for all primary interactive elements
- Maintain ≥ 4.5:1 contrast ratio for normal text, ≥ 3:1 for large text
- Use color to reinforce a state — never as the only signal

**DON'T**
- Don't use gradient on structural UI elements (nav, header, sidebar, button)
- Don't use more than 1 accent color simultaneously on any screen
- Don't use brand color to indicate success (green) or error (red) — those are semantic
- Don't use color to distinguish groups when position or shape would suffice
- Don't use pure black (`#000000`) as background in dark mode — use near-black
- Don't change an element's color without changing its meaning
- Don't use opacity to create "new" colors — use defined tokens

---

## TYPOGRAPHY RULES

**DO**
- Use the defined type scale — xs, sm, base, lg, xl, 2xl, 3xl only
- Use weight to signal hierarchy: light/regular for body, medium for labels, semibold/bold for headings
- Set body text line-height to 1.5 minimum
- Set heading line-height to 1.2–1.3
- Constrain body text line length to 45–75 characters (use `max-w-prose` or `max-w-2xl`)

**DON'T**
- Don't use more than 3 distinct font sizes on a single screen
- Don't add `letter-spacing` to body or paragraph text
- Don't use italic for UI labels or navigation — italic is semantic emphasis in prose
- Don't use `font-weight: 900` outside of display headings
- Don't use ALL CAPS on more than one element per screen
- Don't set font-size below 11px (badges/captions minimum)
- Don't mix two sans-serif typefaces — one sans, one mono maximum

---

## SPACING RULES

**DO**
- Use values from the 4px-base spacing scale only
- Use small spacing (4–12px) within components (label-to-input, icon-to-text)
- Use medium spacing (16–32px) between components
- Use large spacing (32–64px) between page sections
- Keep internal card padding consistent within a card family (all 20px or all 24px)

**DON'T**
- Don't use arbitrary values: no `p-[17px]`, `mt-[13px]`, `gap-[11px]`
- Don't use different padding values for the same component type on different pages
- Don't add spacer `<div>`s — use gap/margin from the scale
- Don't compensate for bad layout with asymmetric padding
- Don't use `margin: auto` as a spacing workaround within flex/grid containers

---

## LAYOUT RULES

**DO**
- Design mobile-first — base styles for mobile, breakpoint overrides for desktop
- Use `max-w-7xl` (1280px) as primary content max-width
- Use `max-w-prose` or `max-w-2xl` for reading-width content
- Keep forms max 640px wide
- Maintain consistent horizontal padding: 16px mobile, 24px tablet, 32px+ desktop

**DON'T**
- Don't allow content to touch viewport edges with no padding
- Don't stack more than 3 levels of visual hierarchy on a single screen
- Don't create layouts that require horizontal scroll on any screen except data tables
- Don't use fixed heights on content containers that hold dynamic content
- Don't use `position: absolute` to position elements that are part of normal document flow

---

## BUTTON RULES

**DO**
- Use one primary (filled) button per screen context
- Label buttons with verb + object when ambiguous ("Delete Project", "Save Changes")
- Match button size to context: standard UI = md (36px), hero CTA = lg/xl
- Show loading state (spinner) while button-triggered action is processing
- Disable button while loading to prevent double-submission

**DON'T**
- Don't use two primary buttons in the same view
- Don't use "Yes" / "No" as button labels — name the action specifically
- Don't use "OK" or "Submit" as labels (too generic)
- Don't make destructive action the primary (dominant) button
- Don't show loading state without also disabling the button
- Don't use icon-only buttons without an aria-label and tooltip

---

## FORM RULES

**DO**
- Always show visible label above each input
- Show helper text below input for format/context hints
- Show error message below the specific failing field after blur
- Auto-focus the first input in a form or modal
- Show inline validation errors after blur (not while typing)
- Group related fields visually and with section headers

**DON'T**
- Don't use placeholder text as a substitute for a label
- Don't clear form inputs after a failed submission
- Don't show validation errors before the user has interacted with a field
- Don't put the submit button at the top of a form
- Don't use two-column layout for unrelated fields just to save vertical space
- Don't exceed 640px form width

---

## MODAL RULES

**DO**
- Trap focus inside modal while open
- Close on Escape key
- Show a visible close button (×) in top-right
- Dim background with overlay
- Auto-focus first interactive element on open
- Return focus to trigger element on close

**DON'T**
- Don't open a modal from inside another modal
- Don't exceed 800px modal width
- Don't allow modal content to exceed 80vh (use internal scroll)
- Don't auto-close a modal the user didn't dismiss (except ephemeral success states)
- Don't use modals for navigation — that's what pages are for

---

## TABLE RULES

**DO**
- Align text columns left, number columns right
- Show loading skeleton with correct column structure while fetching
- Show empty state with CTA inside the table body area
- Keep row height consistent within a table (48px default)
- Make the entire row clickable if clicking navigates to detail

**DON'T**
- Don't exceed 6–8 visible columns without horizontal scroll or column toggle
- Don't use nested rows more than 1 level deep without explicit expand/collapse
- Don't show all data upfront with no pagination for > 50 rows
- Don't vary row height within the same table
- Don't place action buttons on the far left of a row (breaks scanning)

---

## INTERACTION RULES

**DO**
- Show feedback within 16ms of any user click (immediate visual response)
- Show loading state within 500ms if an operation doesn't complete
- Use 150–250ms duration for standard UI transitions
- Use `ease-out` for entrances, `ease-in` for exits
- Make all animations work under `prefers-reduced-motion: reduce`

**DON'T**
- Don't use transitions longer than 400ms for UI navigation
- Don't animate elements for purely decorative reasons
- Don't use scroll-triggered animations in application UI (landing pages OK)
- Don't remove focus outlines without replacing them with visible custom focus styles
- Don't use hover effects that have no keyboard equivalent

---

## ICON RULES

**DO**
- Use one icon family throughout the entire product
- Use icons at defined sizes: 16px inline, 20px button, 24px standard
- Pair icons with labels for navigation items and important actions
- Add `aria-hidden="true"` to decorative icons
- Add `aria-label` to icon-only interactive elements

**DON'T**
- Don't mix icon families (no Heroicons + Lucide + Feather together)
- Don't use an icon to mean two different things
- Don't scale icons to non-standard sizes (no `w-[18px]` when `w-5` is 20px)
- Don't use colored icons for decoration — color on icons must carry meaning
- Don't use duotone/complex icons for UI controls — simple outline for functional icons

---

## EMPTY STATE RULES

**DO**
- Always provide a path forward (CTA or instructions)
- Make the headline describe what's missing, not just "Nothing here"
- Keep empty state centered in its container
- Use a simple icon or illustration (not a complex image)

**DON'T**
- Don't leave a blank white space with no content
- Don't show empty state placeholder while loading (show skeleton instead)
- Don't use the same empty state for every context
- Don't make the empty state bigger than necessary for the available space

---

## ACCESSIBILITY RULES (NON-NEGOTIABLE)

**DO**
- Ensure all interactive elements are keyboard reachable and operable
- Show visible focus indicator on all focusable elements
- Connect form labels to inputs with `htmlFor` / `id`
- Provide `alt` text on all meaningful images (`alt=""` for decorative)
- Announce loading states with `aria-live`
- Mark invalid fields with `aria-invalid="true"`
- Set minimum touch target to 44×44px

**DON'T**
- Don't use `outline: none` without a visible custom focus replacement
- Don't convey state through color alone
- Don't use `tabindex` values above 0 (it breaks natural tab order)
- Don't leave clickable `<div>` or `<span>` without `role="button"` and keyboard handler
- Don't use placeholder as the only label for an input

---

## ANTI-PATTERN QUICK REFERENCE

Remove immediately if found:

| Anti-Pattern | Why It's Wrong |
|-------------|---------------|
| Gradient background on app chrome | Undefined boundary, visual noise |
| `!important` in component styles | Signals a specificity fight — fix the architecture |
| Hardcoded color values in components | Breaks theming, not maintainable |
| `z-index: 9999` | Signals unmanaged stacking context |
| `margin: -Xpx` to fix spacing | Compensating for wrong layout |
| `overflow: hidden` to clip layout bugs | Hiding the real problem |
| Empty `alt=""` on a meaningful image | Accessibility failure |
| Tooltip-less icon-only button | Accessibility failure |
| Loading spinner with label "Loading..." | Tell the user *what* is loading |
| Success toast that auto-dismisses in <2.5s | Inaccessible timing |
| Disabled button with no tooltip explaining why | User can't understand the constraint |
| Animations on initial page load (logo spin, hero bounce) | Unearned, delays content perception |

---

## PROJECT-SPECIFIC RULES (Visual Test Builder)

### Developer Tool Rules

**DO**
- Use exact Cypress/Playwright terminology in all copy (suite, test, beforeEach, cy.get, etc.)
- Keep monospace font for all command names, selector values, code output, log lines
- Keep dark-mode-native palette — do not add light mode variables without a logged decision
- Use CSS custom properties for all color values (no hardcoded hex in component styles)
- Surface validation errors at the point of failure (on the step row, not only in a top banner)

**DON'T**
- Don't rename Cypress/Playwright concepts to friendlier terms (breaks developer mental model)
- Don't add emoji to error messages or functional status text (ok in status badges like ✓ only)
- Don't inflate font size to 16px base — 13px is correct and intentional for this tool
- Don't add consumer-oriented features (onboarding wizard, guided tours, mascot) without
  explicit product pivot logged in DESIGN_DECISIONS.md
- Don't add a second accent color — hook lifecycle colors (blue-tint, amber) are semantic,
  not brand accents

### CSS Token Rules (raw CSS project)

**DO**
- All colors via CSS custom property: `var(--accent)`, `var(--border)`, `var(--surface-2)`
- Add new tokens to `:root` in styles.css before using them anywhere
- Group tokens in `:root` by category (surfaces, borders, text, state, structure)

**DON'T**
- Don't hardcode hex values in component CSS — use or create a token
- Don't create rgba() values inline — token them as `rgba(var(--accent-rgb), 0.1)` or named vars
- Don't use `!important` (1 current violation in .step-remove:hover — fix in Phase 1)
