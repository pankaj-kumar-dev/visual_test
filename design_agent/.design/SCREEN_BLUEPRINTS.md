# SCREEN BLUEPRINTS
> Implementation-ready layout specifications for every major UI zone.
> Use these before writing CSS for any panel or screen change.
> These define the TARGET STATE, not the current state.

---

## HOW TO READ BLUEPRINTS

Each blueprint defines:
- **Layout zones** — spatial areas and their dimensions
- **Visual hierarchy** — which element carries most weight
- **Information density** — how much information per unit area
- **Spacing rhythm** — the gap pattern for this zone
- **Interaction focus** — what users DO in this zone
- **Empty state** — what appears when zone has no data
- **Responsive** — behavior at different sizes (desktop-only — no mobile target)

---

## BLUEPRINT 00 — APP SHELL

### Layout Zones

```
┌──────────────────────────────────────────────────────────────────────┐
│  APP HEADER                                              [60px tall]  │
│  [Product name]              [Undo] [Redo] [Save] [Reset]            │
├──────────┬──────────────────────────────────┬───────────────────────┤
│          │                                  │                       │
│ PALETTE  │         CANVAS                   │  RIGHT STACK          │
│ [180px]  │         [fluid]                  │  [360px]              │
│          │                                  │  ┌─────────────────┐  │
│          │                                  │  │  CONFIG PANEL   │  │
│          │                                  │  │  [auto height]  │  │
│          │                                  │  ├─────────────────┤  │
│          │                                  │  │  TAB BAR        │  │
│          │                                  │  ├─────────────────┤  │
│          │                                  │  │  TAB CONTENT    │  │
│          │                                  │  │  [Code/Run/     │  │
│          │                                  │  │  History/Analytics]│
│          │                                  │  └─────────────────┘  │
└──────────┴──────────────────────────────────┴───────────────────────┘
```

### Visual Hierarchy
1. Canvas (primary — largest area, user's work)
2. Right stack (secondary — output + config)
3. Palette (tertiary — input library)
4. Header (chrome — always visible, minimal weight)

### Spacing Rhythm
- Header: `padding: 10px 16px` (vertical compact, horizontal comfortable)
- Panel gutters: `1px` gap via `background: var(--border)` on grid (current approach — keep)
- No explicit section margins — panels are flush to grid boundaries

### Interaction Focus
- Canvas: drag, click, type
- Config panel: type, select
- Tab content: read, copy, click Run

### Empty State
Not applicable — app shell is always visible.

### Responsive Target
Desktop-only. Minimum usable: ~960px wide. No responsive behavior planned.

---

## BLUEPRINT 01 — APP HEADER

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [Product Name h1]              [Undo] [Redo] [Save] [Reset] │
│  font: 15px/600                      all: .btn-ghost 12px   │
└──────────────────────────────────────────────────────────────┘
Height: 44px (10px top + 10px bottom padding + 24px content line)
Background: --surface
Border: 1px solid var(--border) on bottom
```

### Visual Hierarchy
1. Product name (identity anchor — left)
2. Save button (most frequent action — right of undo/redo group)
3. Undo/Redo (frequent but secondary)
4. Reset (destructive — same style, last position signals low priority)

### Save Button States (exact)
```
idle:    "Save Flow"    — .btn-ghost normal
saving:  "Saving…"     — .btn-ghost disabled + spinner (add when implementing properly)
saved:   "Saved ✓"     — .btn-ghost, 2s then revert
error:   "Error ✗"     — .btn-ghost text-danger, 3s then revert
```

### Target State (improvement over current)
- Save status should ideally be a status indicator separate from the button,
  not text inside the button. Button remains "Save Flow" always; status
  appears as inline text next to it. → Log as P3 task.

---

## BLUEPRINT 02 — ACTION PALETTE

### Layout

```
┌──────────────────────────────────┐
│  PANEL TITLE: COMMANDS           │  ← 11px uppercase muted
│  (11px/700/uppercase/--muted)    │
├──────────────────────────────────┤
│  GROUP LABEL: NAVIGATION         │  ← 10px uppercase muted
│  ┌──────────────────────────────┐│
│  │ 🌐  cy.visit                 ││  ← palette-item: 7px→6px 10px padding
│  └──────────────────────────────┘│  ← font: 12px mono for command name
│  ┌──────────────────────────────┐│
│  │ 🔍  cy.get                   ││
│  └──────────────────────────────┘│
│                                  │
│  GROUP LABEL: ACTIONS            │
│  ┌──────────────────────────────┐│
│  │ 👆  cy.click                 ││
│  └──────────────────────────────┘│
└──────────────────────────────────┘
Width: 180px (fixed)
Background: --surface
Overflow: scroll-y
Padding: 14px
```

### Visual Hierarchy
1. Group labels (orientation — you are looking at ACTIONS)
2. Command names (the actionable items)
3. Icons (at 14px, they reinforce but aren't primary)

### Information Density
Dense — all commands visible, group separation clear. Correct for this zone.

### Spacing Rhythm
- Between groups: 10px
- Between items in group: 3px
- Item internal padding: 6px 10px (target — currently 7px 10px)
- Group label padding: 4px 2px 2px

### Interaction Focus
Primary: drag command onto canvas
Secondary: click command (adds to selected test/hook)

### Empty State
Not applicable — palette always has built-in commands.

---

## BLUEPRINT 03 — CANVAS PANEL

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  CANVAS HEAD                                     [60px tall] │
│  [Flow name input] [baseUrl input] [Target ▾] [Examples ▾]  │
│  font: 12px for all inputs                                   │
├──────────────────────────────────────────────────────────────┤
│  CANVAS DROP AREA                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SUITE BLOCK (describe block)                          │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  SUITE HEAD: [▶] [S] Suite Name     [+ Test][…]  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  HOOK BLOCK (beforeEach)                         │ │ │
│  │  │  STEP ROW × N                                    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  TEST BLOCK                                       │ │ │
│  │  │  ┌──────────────────────────────────────────────┐│ │ │
│  │  │  │  TEST HEAD: [▶] [IT] Test Name    [×]        ││ │ │
│  │  │  └──────────────────────────────────────────────┘│ │ │
│  │  │  STEP ROW × N                                    │ │ │
│  │  │  ADD STEP ROW                                    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy
1. Active/selected step row (accent border + subtle tint — highest weight)
2. Suite blocks (structural containers — medium weight)
3. Test blocks (content containers — nested inside suites)
4. Step rows (the actual test actions — lowest unit)
5. Canvas head inputs (configuration — minimal visual weight)

### Information Density
High — IDE-level. Multiple nesting levels visible simultaneously. Intentional.

### Spacing Rhythm
- Canvas head: 6px gap between inputs, 12px margin-bottom
- Canvas drop padding: 8px
- Suite blocks: 6px margin-bottom
- Suite body: 6px padding, 4px gap between children
- Test body: 4px padding
- Step rows: 2px margin-bottom
- Step internal: 5px → 4px padding (T018), 6px gap

### Interaction Focus
- Select (click) → drives config panel
- Drag step → reorder within test/hook
- Double-click name → inline rename edit
- Hover step row → reveals remove button

### Empty State (canvas has no suites)
```
Target copy:
"Drag a command from the palette to start building, or load an example above."
Styling: .canvas-empty-msg { color: var(--muted); padding: 40px 24px; text-align: center; }
```

### Step Row Anatomy (target)
```
[⋮⋮ drag] [index] [cy.get] [.chain-badge] [...+N more] [⚠/✗] [×]
  14px      10px    12px mono   10px mono                11px  14px
  color:muted color:muted  accent      muted                   hidden→shows on hover
```

---

## BLUEPRINT 04 — CONFIG PANEL

### Layout

```
┌──────────────────────────────────────────────┐
│  NODE CONTEXT HEADER               [target]  │
│  [KIND badge]  [Node Name]                   │
│  10px uppercase  12px/600                    │
├──────────────────────────────────────────────┤
│  CONFIG SECTION TITLE: STEP CONFIG           │
│  (10px/700/uppercase/muted)                  │
├──────────────────────────────────────────────┤
│  FIELD GROUP                                 │
│  ┌────────────────────────────────────────┐ │
│  │ [label]    [input / select]            │ │
│  │ 11px muted  12px normal                │ │
│  └────────────────────────────────────────┘ │
│  COMMAND CHAIN EDITOR                        │
│  ┌────────────────────────────────────────┐ │
│  │ [cmd name]         [×]                 │ │
│  │ 12px mono accent    14px               │ │
│  │ [field inputs...]                      │ │
│  └────────────────────────────────────────┘ │
│  [+ Add chain command ▾]                     │
└──────────────────────────────────────────────┘
Width: part of 360px right panel
Background: --surface
Overflow: scroll-y
```

### Node Context Header (T017 target)
```css
.config-node-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-bottom: 1px solid var(--border);
  background: var(--surface-2); flex-shrink: 0;
}
.config-node-kind {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.6px; color: var(--muted); flex-shrink: 0;
}
.config-node-name {
  font-size: 12px; font-weight: 600; color: var(--text);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}
```

### Visual Hierarchy
1. Node context header (always visible — "what am I editing?")
2. Section titles (grouping)
3. Field inputs (the actual work)
4. Helper text / warnings

### Empty State
"Select a node on the canvas to configure it."
Shown when `selectedId === null`.

---

## BLUEPRINT 05 — CODE PANEL (tab)

### Layout

```
┌──────────────────────────────────────────────┐
│  CODE PANEL HEAD                             │
│  [Target: Cypress]  [Copy] [Format] [Save]   │
│  12px muted text      .btn-ghost buttons     │
├──────────────────────────────────────────────┤
│  VALIDATION BANNER (if errors)               │
│  ┌────────────────────────────────────────┐ │
│  │ ⚠ 2 errors — step 3, step 7           │ │
│  └────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│  CODE BLOCK                                  │
│  ┌────────────────────────────────────────┐ │
│  │  describe('Suite name', () => {        │ │
│  │    it('Test name', () => {             │ │
│  │      cy.visit('https://...')           │ │
│  │    })                                  │ │
│  │  })                                    │ │
│  └────────────────────────────────────────┘ │
│  background: --surface-code                  │
│  font: 12px Fira Code                        │
└──────────────────────────────────────────────┘
```

### Visual Hierarchy
1. Code content (the product — primary)
2. Validation banner (critical when present)
3. Action buttons (utility — secondary)

### Code Block Specs
```
background:   var(--surface-code)  (#0b0d12)
font:         12px Fira Code monospace
color:        var(--text)          (#e6e8ee)
padding:      12px
border:       1px solid var(--border)
border-radius: var(--radius-lg)    (8px)
overflow:     auto
white-space:  pre
```

---

## BLUEPRINT 06 — EXECUTION PANEL (tab)

### Layout

```
┌──────────────────────────────────────────────┐
│  EXEC HEAD                                   │
│  [Status Badge] [Runner] [Duration]  [Run ▶] │
│                                   .btn-primary│
├──────────────────────────────────────────────┤
│  EXEC ERROR (if status=error)                │
│  ┌────────────────────────────────────────┐ │
│  │ Error message text                     │ │
│  └────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│  STEP SUMMARY (if steps available)           │
│  ┌────────────────────────────────────────┐ │
│  │ [✓] step label            123ms        │ │
│  │ [✗] step label            ERROR        │ │
│  │ max-height: 160px, scroll              │ │
│  └────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│  EXECUTION LOG (aria-live="polite")          │
│  ┌────────────────────────────────────────┐ │
│  │ 12:34:01  Running test suite...        │ │
│  │ 12:34:02  Step 1: cy.visit...   ✓      │ │
│  │ background: --surface-code             │ │
│  │ font: 11px Fira Code                   │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Status Badge States
```
idle:    no badge shown
QUEUED:  gray text
RUNNING: --accent blue (with pulsing animation? — optional)
PASSED:  --green
FAILED:  --danger
ERROR:   --danger
```

### RUNNING Indicator (target improvement)
Current: just the text badge. Target: pulsing indicator dot before "RUNNING" text.
```css
.exec-status-running::before {
  content: '';
  display: inline-block; width: 6px; height: 6px;
  background: var(--accent); border-radius: 50%;
  margin-right: 6px;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
```

---

## BLUEPRINT 07 — HISTORY PANEL (tab)

### Layout

```
┌──────────────────────────────────────────────┐
│  HISTORY HEAD                                │
│  [title]        [stats: runs / avg / rate]   │
├──────────────────────────────────────────────┤
│  HISTORY LIST (scroll-y)                     │
│  ┌────────────────────────────────────────┐ │
│  │ [✓/✗] [name ...........]  [dur] [steps]│ │
│  │ 40px row height                        │ │
│  └────────────────────────────────────────┘ │
│  (repeat ×N)                                 │
├──────────────────────────────────────────────┤
│  EMPTY STATE (0 runs)                        │
│  [icon] No runs yet                          │
│  Run a suite to record history.              │
└──────────────────────────────────────────────┘
```

### Loading State (skeleton)
```
2-3 skeleton rows mimicking .history-row shape:
  ┌──────────────────────────────────────────┐
  │ [●skeleton 16px] [████████████] [██] [██]│  ← .skeleton on each section
  └──────────────────────────────────────────┘
height: 40px, margin-bottom: 4px
```

---

## BLUEPRINT 08 — ANALYTICS PANEL (tab)

### Layout

```
┌──────────────────────────────────────────────┐
│  STAT GRID (2 columns)                       │
│  ┌──────────────┐ ┌──────────────┐           │
│  │  Pass Rate   │ │  Total Runs  │           │
│  │  87%         │ │  24          │           │
│  │  [bar chart] │ │              │           │
│  └──────────────┘ └──────────────┘           │
│  ┌────────────────────────────────────────┐  │
│  │  Avg Duration                    480ms  │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│  FLAKY SECTION                               │
│  ┌────────────────────────────────────────┐  │
│  │ FLAKY ×2                               │  │
│  │ ┌──────────────────────────────────┐   │  │
│  │ │ [name.....] [type] [runs] [FLAKY]│   │  │
│  │ └──────────────────────────────────┘   │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│  EMPTY STATE (0 runs)                        │
│  [icon] No runs yet                          │
│  Run at least 2 test executions to see       │
│  analytics.                                  │
└──────────────────────────────────────────────┘
```

### Loading State (skeleton)
```
  ┌──────────────┐ ┌──────────────┐
  │ [████████]   │ │ [████████]   │   ← .skeleton .astat shape
  │ [██]         │ │ [██]         │
  └──────────────┘ └──────────────┘
```

---

## RESPONSIVE BEHAVIOR MATRIX

This product is desktop-only. However, define minimum viable breakpoints:

| Zone | ≥ 1280px | 960–1279px | < 960px |
|------|----------|------------|---------|
| App Header | Full | Full | Collapse actions to ⋮ menu |
| Palette | 180px visible | 160px | Hidden (overlay on demand) |
| Canvas | Fluid | Fluid, compressed | Full width |
| Right Stack | 360px | 300px | Hidden (overlay on demand) |
| Note | Default | Functional | Degraded — not supported |
