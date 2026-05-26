# COMPONENT RULES
> Design contracts for every component. No component may violate these contracts.
> Derived from: LAYOUT_PATTERNS.md + VISUAL_LANGUAGE.md

---

## COMPONENT CONTRACT STRUCTURE

Every component must define:

1. **Purpose** — What exactly this component communicates or enables
2. **States** — All required states (empty, loading, error, populated, disabled, focused, hover, active)
3. **Anatomy** — Every visual part and its role
4. **Spacing rules** — Internal padding, gap values from scale
5. **Typographic rules** — Size, weight, and line height for each text element
6. **Variant rules** — Which variants exist and when each is used
7. **Composition rules** — What can appear inside it, what it can appear inside
8. **Anti-patterns** — Explicitly forbidden usages

---

## BUTTON

### Purpose
Triggers an action. Communicates available actions and their relative importance.

### Variants (Priority Order)

| Variant | Use Case | When to Use |
|---------|---------|------------|
| Primary (filled) | Main action on screen | One per view or context. The thing the user should do most. |
| Secondary (outlined) | Supporting action | When primary exists and secondary needs to be visible |
| Ghost (text only) | Low-emphasis action | Cancel, dismiss, tertiary navigation |
| Destructive (filled, red/danger) | Irreversible harmful action | Delete, remove, disconnect — always with confirmation |
| Link | Inline navigation | Inside prose or helper text — not for UI actions |

**Rule: Never two Primary buttons on the same screen.** If you think you need two, one of them should be Secondary.

### Sizes

| Size | Height | Padding (H) | Font Size | Use Case |
|------|--------|-------------|-----------|---------|
| xs | 28px | 10px | 12px | Inline/compact tables, tight spaces |
| sm | 32px | 12px | 13px | Secondary actions in tight layouts |
| md | 36px | 14px | 14px | Standard UI (default) |
| lg | 40px | 16px | 15px | Primary CTA in headers, onboarding |
| xl | 44px | 20px | 16px | Landing page CTA, mobile-first |

### States

```
Default:   Normal appearance
Hover:     Slight darkening (filled) or background fill (ghost/outlined)
Focus:     Visible outline ring, 2px offset, brand color
Active:    Scale down 0.97 or slight darken beyond hover
Loading:   Spinner replaces label OR spinner + "Loading..." text; button disabled
Disabled:  50% opacity, cursor-not-allowed, no hover effect
```

### Anatomy
```
[Leading Icon (optional)] [Label] [Trailing Icon (optional)]

Icon size: 16px for sm/md, 18px for lg/xl
Icon-to-label gap: 6px
```

### Anti-Patterns
- Button label longer than 3-4 words in standard UI
- Icon-only button without aria-label and tooltip
- Button inside a button
- Multiple primary buttons in the same card or form section
- Using disabled state to communicate "you need to do X first" without explanation — add tooltip

---

## INPUT / FORM FIELD

### Purpose
Receive user text input. Must communicate clearly: what to enter, current state, any constraints.

### Anatomy
```
[Label *required indicator]
[Prefix Icon (opt)] [Input Area] [Suffix Icon/Action (opt)]
[Helper Text | Error Message]
```

### Height by Type
```
Text input:      36-40px
Textarea:        80px minimum, auto-expand preferred
Select:          36-40px (same as input)
Search input:    36px (slightly shorter acceptable)
```

### States

```
Default:      Border: 1px border-color, background: input-bg
Hover:        Border slightly darker
Focus:        Border: brand-accent 2px, ring: brand-accent/20 3px spread
Error:        Border: danger-color, helper text shows error message
Success:      Border: success-color (only when explicit confirmation needed)
Disabled:     50% opacity, cursor-not-allowed, no interaction
Read-only:    Input appears but styled clearly as non-editable (different bg)
Loading:      Skeleton placeholder or spinner in suffix position
```

### Label Rules
- Always visible (never placeholder-only label)
- Label above input (never to the left in dense forms — scanning is harder)
- Required: asterisk (*) suffix on label, color: text-secondary
- Optional: "(optional)" text suffix in parentheses, only when most fields are required

### Anti-Patterns
- Placeholder text as label (disappears when user types — they forget what the field is)
- No visible label at all
- Success border on every valid input (visual noise — use only for high-stakes validation)
- Error message below the next field's label (confusing proximity)
- Multiple error messages for a single field (one message, the most actionable)

---

## CARD

### Purpose
Group related content into a bounded, scannable unit.

### Variants

| Variant | Border | Shadow | Background | Use Case |
|---------|--------|--------|-----------|---------|
| Flat | 1px border | None | Elevated bg | Data-dense views, table alternatives |
| Elevated | None | sm shadow | White | Feature cards, dashboards |
| Outlined + Ghost | 1px dashed | None | Transparent | Empty/upload states, add-new placeholder |
| Interactive | 1px border | None→sm (hover) | Elevated bg | Clickable cards in lists |
| Stat/Metric | 1px border | None | Elevated bg | KPI metrics, dashboard numbers |

### Spacing
```
Padding:          20px standard, 24px comfortable, 16px compact
Header padding:   Same as card padding, border-bottom separates from body
Footer padding:   Same as card padding, border-top or adequate margin-top
Internal gap:     16px between sections, 8px between label-value pairs
```

### Card Header Anatomy
```
[Icon/Avatar (opt)] [Title] [Subtitle (opt)]      [Actions (opt)]
```

### Anti-Patterns
- Cards with more than 3 levels of internal hierarchy
- Card inside a card (nested cards = undefined depth — use flat sections instead)
- Cards of different heights in the same grid unless explicitly intentional
- Card action buttons at bottom when there's no other content reason to scroll down
- Shadow + border on same card (double boundary)

---

## TABLE / DATA TABLE

### Purpose
Display structured relational data for scanning, comparison, and action.

### Anatomy
```
[Table Toolbar: Search | Filters | Bulk Actions | View Options | Density]
[Column Header Row]
[Data Rows]
[Pagination / Load More]
```

### Row Heights (density modes)
```
Compact:      36-40px  — Expert users, high-data density
Default:      48px     — Standard
Comfortable:  56-64px  — With secondary info, avatars
```

### Column Header Rules
- Sortable column: sort icon visible on hover, active state shows direction
- Column alignment: text = left, numbers = right, status/icon = center
- Min column width: enough to show header label without truncation
- Actions column: always rightmost, fixed width

### Row Rules
- Entire row is clickable if row has a detail view (not just the link text)
- Hover background: subtle, single color change
- Selected row: distinct background (brand/10 alpha typically)
- Row actions: visible on hover (desktop), always visible on mobile

### Empty State
- Minimum 200px height for empty table body
- Centered message + CTA (see Empty State archetype in LAYOUT_PATTERNS.md)
- Don't show column headers with "0 rows" — hide headers too or show inline message

### Anti-Patterns
- More than 6-8 columns without horizontal scroll or column hiding
- Fixed-height rows that clip content
- Actions column on the far left (confuses row scanning)
- No pagination or virtualization for lists > 50 rows
- Nested row data that doesn't follow standard expand/collapse pattern

---

## BADGE / TAG / CHIP

### Purpose
Label, categorize, or communicate status at a glance. Inline, non-interactive or minimally interactive.

### Variants

| Variant | Interactive | Use Case |
|---------|------------|---------|
| Status Badge | No | System/entity status (Active, Draft, Error) |
| Category Tag | No | Labels, taxonomy, metadata |
| Selectable Chip | Yes (toggle) | Filter chips, multi-select |
| Removable Tag | Yes (dismiss) | Applied filters, selected values |

### Size
```
Height:  20px (xs), 22px (sm), 24px (md)
Padding: 6px horizontal (xs/sm), 8px (md)
Font:    11px-12px, medium weight
```

### Color Usage
- Status badges: use semantic state colors (green=active, red=error, amber=warning, gray=inactive)
- Category tags: neutral or single accent color — never rainbow
- Max 4 distinct colors across all tag categories on one screen

### Anti-Patterns
- Badge larger than 28px height (becomes a button, not a badge)
- More than 3-4 tags on a single row item (truncate with "+N more")
- Using badge colors to decorate without semantic meaning
- Interactive chip that looks identical to non-interactive tag

---

## DROPDOWN / SELECT

### Purpose
Choose from a defined set of options when the set is too large for radio buttons (> 5 items).

### Trigger States
Same as Input states (focus ring, border color changes)

### Menu Anatomy
```
[Search input (if >7 options)]
[Option item]
[Option item — selected: checkmark + highlight]
[Divider (group separator)]
[Group Label]
[Option item]
```

### Sizing
```
Trigger:       Same height as inputs (40px)
Menu width:    At least as wide as trigger, max 320px
Option height: 36px standard, 44px with description
Max visible:   6-8 items before scroll
```

### Rules
- If > 15 options: add search inside menu
- Group options semantically with dividers and group labels
- Selected option shows checkmark (not just highlight — accessible)
- "None" / "Clear" option if field is optional: at top, styled differently

### Anti-Patterns
- Native `<select>` in a designed UI (browser controls don't match design system)
- Custom dropdown without keyboard navigation (up/down/enter/escape)
- Options that require explanation fitting in 36px height — use a different pattern
- Dropdown for 2-3 options (use radio buttons or segmented control)

---

## MODAL / DIALOG

### Rules (see LAYOUT_PATTERNS.md for spatial rules)

```
Always:
  - Trap focus inside modal while open
  - Close on Escape key
  - Close button (×) top-right
  - Overlay backdrop that blocks interaction with page behind
  - Announce to screen reader on open (aria-modal="true", role="dialog")

Never:
  - Modal that opens another modal
  - Modal wider than 800px
  - Modal taller than 80vh (scroll internal content)
  - Auto-close a modal the user didn't dismiss (except auto-dismissing success toasts)
```

---

## TOOLTIP

### Purpose
Reveal additional information for an element on hover/focus. Non-blocking.

```
Trigger:    Hover (200ms delay) or focus
Dismiss:    Mouse leave or focus away
Content:    Text only (no interactive elements — that's a popover)
Position:   Auto-placement, prefer top or bottom, avoid clipping viewport
Width:      Max 240px
Arrow:      Optional, helps orient to trigger
```

### Anti-Patterns
- Tooltip on primary action buttons (if user needs to hover to know what a button does, fix the label)
- Interactive content inside tooltip (use popover)
- Tooltip that duplicates the visible label exactly
- Tooltip that explains disabled state without providing resolution ("Only admins can do this" → show how to become admin or request access)

---

## NOTIFICATION / TOAST

### Purpose
Non-blocking feedback for async actions. Appears and disappears.

### Variants
```
Success:  Green icon, confirmation message, auto-dismiss 3-4s
Error:    Red icon, error message, persists until dismissed (errors need attention)
Warning:  Amber icon, advisory message, persists unless irrelevant
Info:     Blue/neutral icon, informational, auto-dismiss 4-5s
```

### Placement
```
Desktop: Bottom-right, 24px from edge
Mobile:  Bottom-center, above navigation
Stack:   Max 3 toasts visible, oldest dismisses first
```

### Anti-Patterns
- Toast for critical errors (use inline error or blocking dialog — toasts disappear)
- Success toast that says "Success!" with no context of what succeeded
- Toast requiring user decision (use modal for decisions)
- Toast auto-dismissing in < 2.5s (users with reading disabilities can't process in time)

---

## SKELETON / LOADING STATE

### Purpose
Maintain layout structure during data loading. Prevent layout shift. Reduce perceived wait.

### Rules
```
Use when:   Async content load is expected > 300ms
Duration:   Show skeleton for entire load, replace all at once
Animation:  Shimmer left-to-right, not pulse (pulse is jarring)
Color:      bg-gray-100 to bg-gray-200 range (light), or inverse for dark
Shape:      Match the shape of content (text = rounded rectangles, image = correct aspect ratio)
```

### Anti-Patterns
- Skeleton for < 300ms loads (flash of skeleton is worse than no skeleton)
- Generic skeleton that doesn't match actual content layout
- Skeleton that shows then collapses when data arrives (causes layout shift)
- Partial skeleton (some areas loading, some populated — except for progressive content)

---

## COMPONENT HEALTH CHECKLIST

For each new or modified component:

- [ ] All states defined and designed (empty, loading, error, populated, disabled)
- [ ] Spacing values from defined scale only
- [ ] Type sizes from defined scale only
- [ ] Colors from token system only
- [ ] Keyboard accessible (all interactions reachable via Tab/Enter/Space/Escape)
- [ ] Focus state visible
- [ ] ARIA labels on icon-only elements
- [ ] Mobile/responsive behavior defined
- [ ] No undeclared variants in use (check DESIGN_DECISIONS.md if adding variant)
