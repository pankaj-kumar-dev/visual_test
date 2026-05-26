# LAYOUT PATTERNS
> Spatial systems, grid logic, and layout archetypes.
> Derived from: VISUAL_LANGUAGE.md + UX_PRINCIPLES.md (Spatial Intentionality + Density Respect)

---

## SPATIAL PHILOSOPHY

Space is not emptiness. Space is structure. Every spacing decision is a communication decision:

- **Proximity** — Items close together belong together (Gestalt)
- **Separation** — Items far apart are conceptually distinct
- **Isolation** — A lone element surrounded by space is important
- **Rhythm** — Consistent spacing creates visual flow that guides the eye

**Foundational rule:** Before reaching for a border or a background color to separate content, ask if spacing alone would communicate the relationship. If yes, use spacing.

---

## SPACING SCALE

Build from a base unit. All spacing values are multiples of this unit.

### Recommended: 4px base unit

```
1  →  4px    — Micro: icon-to-label gap, tight list spacing
2  →  8px    — Small: input padding (compact), badge padding
3  →  12px   — Medium-Small: input padding (standard), label spacing
4  →  16px   — Base: standard component padding, inline spacing
5  →  20px   — Medium: card padding, section label spacing
6  →  24px   — Large: card padding (comfortable), group separation
8  →  32px   — XL: section separation, form row spacing
10 →  40px   — 2XL: major section breaks
12 →  48px   — 3XL: page padding vertical
16 →  64px   — Page: page-level margins, hero spacing
24 →  96px   — Display: landing page sections
```

**Why 4px?** Maps cleanly to 8-column grid systems, Tailwind's default scale, and visual subdivisions that work at every device density.

### Tailwind Scale Mapping

```
gap-1   = 4px
gap-2   = 8px
gap-3   = 12px
gap-4   = 16px
gap-5   = 20px
gap-6   = 24px
gap-8   = 32px
gap-10  = 40px
gap-12  = 48px
gap-16  = 64px
gap-24  = 96px
```

**Rule:** Only use values from this scale. No `mt-[17px]` or `p-[11px]`. If the design requires a non-scale value, the design is wrong — not the scale.

---

## GRID SYSTEM

### Column Grid

| Breakpoint | Columns | Gutter | Margin |
|-----------|---------|--------|--------|
| Mobile (< 640px) | 4 | 16px | 16px |
| Tablet (640-1024px) | 8 | 24px | 24px |
| Desktop (1024-1280px) | 12 | 24px | 32px |
| Wide (> 1280px) | 12 | 32px | 48px |

**Max content width:** 1280px for most products. Use `max-w-7xl` in Tailwind.
**Wide data tables / dashboards:** 1440px max. `max-w-screen-xl`.
**Narrow reading content:** 720px max. `max-w-2xl` or `max-w-prose`.

### Responsive Strategy: Mobile-First with Desktop Enhancement

```
Base styles:       Mobile layout
md: (640px+)       Tablet adjustments
lg: (1024px+)      Desktop baseline
xl: (1280px+)      Wide screen enhancements
2xl: (1536px+)     Only if product requires ultra-wide
```

**Don't design for 1920px first then try to compress to mobile.** Mobile reveals design discipline. Desktop hides poor information hierarchy.

---

## LAYOUT ARCHETYPES

Every screen in an application fits one of these archetypes. Match the archetype to its spatial treatment.

---

### ARCHETYPE 1 — App Shell

**What it is:** The persistent chrome: sidebar/navbar + main content area + optional right panel.

```
┌─────────────────────────────────────────────┐
│  HEADER  (optional — app name + nav + user)  │
├──────────┬──────────────────────────────────┤
│          │                                  │
│  SIDEBAR │      MAIN CONTENT AREA           │
│  (nav)   │                                  │
│          │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

**Spatial rules:**
- Sidebar width: 240-280px (fixed), 64-72px (collapsed/icon-only)
- Content area: never touch viewport edge — minimum 24px padding
- Header height: 56-64px (fixed top or sticky)
- Sidebar items: 36-40px height, 12px-16px padding
- Active sidebar item: background fill (not just text color change)

**Responsive behavior:**
- Mobile: Sidebar becomes bottom tab bar OR hamburger overlay
- Tablet: Sidebar collapses to icon-only with tooltip labels
- Desktop: Full sidebar visible

---

### ARCHETYPE 2 — Dashboard

**What it is:** Overview screen. Multiple data widgets, metrics, activity.

```
┌────────────────────────────────────────────────┐
│ Page Header (title + period selector + actions) │
├────────────┬───────────┬────────────────────────┤
│  Metric    │  Metric   │  Metric                │
│  Card      │  Card     │  Card                  │
├────────────┴───────────┴────────────────────────┤
│                                                 │
│            Chart / Visualization                │
│                                                 │
├────────────────────────┬────────────────────────┤
│                        │                        │
│   Table / List         │   Secondary Widget     │
│                        │                        │
└────────────────────────┴────────────────────────┘
```

**Spatial rules:**
- Metric cards: equal width, 3-4 per row (desktop), 2 (tablet), 1 (mobile)
- Card internal padding: 20-24px
- Card grid gap: 16-24px
- Section separation: 32-40px
- Chart height: 240-320px standard, 400px for feature charts
- Avoid more than 6 widgets above the fold

**Information hierarchy:**
- Most important metric: largest or first
- Supporting metrics: consistent size
- Tables: below fold unless primary workflow
- Actions: header area or inline with context

---

### ARCHETYPE 3 — List / Index

**What it is:** Searchable, filterable list of items.

```
┌────────────────────────────────────────────────┐
│ Page Header + Primary Action (Create / Add)     │
├────────────────────────────────────────────────┤
│ Search  │  Filters  │  Sort  │  View Toggle    │
├────────────────────────────────────────────────┤
│ Item row                               [actions]│
│ Item row                               [actions]│
│ Item row                               [actions]│
│ Item row                               [actions]│
├────────────────────────────────────────────────┤
│ Pagination                                      │
└────────────────────────────────────────────────┘
```

**Spatial rules:**
- Row height: 48-56px (comfortable), 40px (dense), 64px+ (with avatar/image)
- Row padding: 16px horizontal
- Action density: max 2 inline actions, rest in overflow menu
- Filter bar: below header, above list (sticky optional for long lists)
- Empty state: centered in list area, 200-300px height min

**Interaction:**
- Row click = navigate to detail (entire row is clickable, not just title)
- Hover: subtle background change (not border change)
- Selection: checkbox reveals on hover (or always visible for bulk-action products)
- Actions: show on hover (desktop), always show (mobile)

---

### ARCHETYPE 4 — Detail / Single Entity

**What it is:** Full view of one entity (record, project, item, user).

```
┌────────────────────────────────────────────────┐
│ Breadcrumb + Back + Entity Name + Actions       │
├──────────────────────────┬─────────────────────┤
│                          │                     │
│   PRIMARY CONTENT        │   SIDEBAR META      │
│   (main fields, body)    │   (status, dates,   │
│                          │    properties)      │
│                          │                     │
├──────────────────────────┴─────────────────────┤
│   RELATED CONTENT (tabs, lists, activity)       │
└────────────────────────────────────────────────┘
```

**Spatial rules:**
- Primary content: 60-70% width (desktop)
- Sidebar meta: 30-40% width, max 320px
- Section headers within primary: 24-32px margin-top, 12-16px margin-bottom
- Property rows in sidebar: 40px height, 8px label-to-value gap
- Tabs for related content: 40-44px height, 16px padding

**Responsive:**
- Mobile: sidebar meta moves below primary content (or into accordion)
- Tablet: stacked or side-by-side at 50/50

---

### ARCHETYPE 5 — Form / Input Flow

**What it is:** Data entry, configuration, settings.

```
┌────────────────────────────────────────────────┐
│ Form Title + Description                        │
├────────────────────────────────────────────────┤
│ Section Title                                   │
├────────────────────────────────────────────────┤
│ Field Label                                     │
│ ┌──────────────────────────────────────────┐   │
│ │ Input                                    │   │
│ └──────────────────────────────────────────┘   │
│ Helper text                                     │
├────────────────────────────────────────────────┤
│ Field Label                                     │
│ ┌──────────────────────────────────────────┐   │
│ │ Input                                    │   │
│ └──────────────────────────────────────────┘   │
├────────────────────────────────────────────────┤
│ Cancel          Save Changes                    │
└────────────────────────────────────────────────┘
```

**Spatial rules:**
- Max form width: 560-640px (never full viewport width for forms)
- Field vertical gap: 20-24px
- Label to input gap: 6-8px
- Input height: 36px (compact), 40px (standard), 44px (comfortable/mobile)
- Section separation within form: 32-40px
- Action button placement: right-aligned (standard), sticky bottom (long forms)

**Rules:**
- One column forms for most cases (two-column only for truly parallel fields)
- Group related fields with section headers or visual proximity
- Required indicator: asterisk (*) on label, explained once ("* required fields")
- Error message: below input, immediately after validation

---

### ARCHETYPE 6 — Modal / Dialog

**What it is:** Overlay for focused task, confirmation, or data entry.

```
┌───────────────────────────────┐
│ Modal Title            [×]    │
├───────────────────────────────┤
│                               │
│   Content / Form / Message    │
│                               │
├───────────────────────────────┤
│  Cancel        Primary Action │
└───────────────────────────────┘
```

**Spatial rules:**
- Width: 400px (small/confirm), 560px (standard), 720px (complex form), max 800px
- Height: max 80vh (scroll internal content if taller)
- Padding: 24px
- Title to content gap: 16px
- Content to footer gap: 24px
- Footer: right-aligned actions
- Backdrop: semi-transparent overlay, focus trap mandatory

**Rules:**
- Close button always present (× top-right)
- Destructive action modals: Cancel is on left, action on right (never reverse)
- Modal should not contain another modal
- Auto-focus first interactive element on open

---

### ARCHETYPE 7 — Empty State

**What it is:** Zero-data states, onboarding first view, filtered-to-nothing.

```
┌────────────────────────────────────────────────┐
│                                                │
│              [Illustration / Icon]             │
│                                                │
│                  Headline                      │
│              Supporting description            │
│                                                │
│              [ Primary Action ]               │
│                                                │
└────────────────────────────────────────────────┘
```

**Spatial rules:**
- Centered in available space
- Illustration/icon: 80-120px (simple icon), 160-200px (illustration)
- Headline to description gap: 8px
- Description to CTA gap: 24px
- Max content width: 400px

**Content rules:**
- Headline: names what's missing (not "Nothing here yet")
- Description: brief explanation of what this area does + why it matters
- CTA: primary action to populate it
- Never leave empty state without a path forward

---

## NAVIGATION PATTERNS

### Sidebar Navigation
- Flat hierarchy: up to 8 items
- Two-level: group with header, max 4 sub-items
- Three-level: requires reconsideration of information architecture

### Tab Navigation
- Use for related views of the same entity (not for global navigation)
- Max 6 tabs visible without overflow
- Active state: border-bottom (underline), not background fill (that's button territory)
- Mobile: tabs scroll horizontally, or collapse to select/dropdown

### Breadcrumbs
- Use in: 3+ level deep navigation, detail views
- Format: Parent / Child / Current (current not a link)
- Max: 4 levels before collapsing middle items to `...`

---

## BREAKPOINT BEHAVIOR MATRIX

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Sidebar | Hidden (sheet/overlay) | Icon-only or hidden | Full |
| Data table | Card list view | Horizontal scroll | Full table |
| Metric cards | 1 per row | 2 per row | 3-4 per row |
| Form | Full width | Max 600px centered | Max 640px, left-aligned |
| Modal | Full screen bottom sheet | Standard modal | Standard modal |
| Chart | Height reduced, touch zoom | Standard | Standard |
