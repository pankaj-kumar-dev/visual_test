# INSPIRATION — LINEAR
> linear.app — Project management for software teams
> Extract: spatial philosophy, hierarchy, density, trust through precision

---

## WHAT LINEAR DOES DIFFERENTLY

Linear is a rare case of density done right. It manages to show a lot without feeling overwhelming. Study this not to copy it, but to understand the principles that make high-density UI work.

---

## SPACING PHILOSOPHY

**Observation:** Linear uses very tight internal component spacing but generous separation between sections.

- List row height: ~32px (very compact compared to industry standard 48px)
- This works because: rows have only 1-2 lines of text, consistent height, and rows never wrap
- Inter-section spacing is proportionally generous, which creates breathing room at the structural level
- The tightness signals: this is a tool, not a consumer app — it respects your screen real estate

**Extract for our system:** Dense row height is acceptable IF:
1. Content is single-line and predictable
2. Row padding is still ≥ 8px vertical
3. Section spacing compensates with generosity
4. User is a trained/returning user (not onboarding context)

---

## TYPOGRAPHY RHYTHM

**Observation:** Linear uses a small number of font sizes with significant weight variation.

- Primary label weight: 500 (medium) — not regular, not bold
- Secondary text drops to 400 regular at same size — weight carries hierarchy, not size
- Very few size steps — probably 3-4 max in the app UI
- All-caps used for section headers (but sparingly — only for grouping labels)

**Extract:** Weight variation within same size is more elegant than size variation for same-level hierarchy. Less visual jump, cleaner overall rhythm.

---

## INTERACTION DENSITY

**Observation:** Actions are discovered, not displayed.

- Primary actions: visible at all times in the header area
- Secondary/row actions: hidden until hover
- Keyboard shortcuts are the product — visible in tooltips and command palette
- Context menus on right-click reveal full action surface

**Extract:** Hide secondary actions behind hover. Show all keyboard shortcuts in tooltips and a `/` or `Cmd+K` palette. The UI surface is always minimal; power is always available.

---

## INFORMATION HIERARCHY

**Observation:** Status, priority, and assignee are persistent but compact.

- Status: colored dot or small icon (4-8px) — smallest possible signal
- Priority: icon before title (4 icon sizes for 4 levels — no text, just icon + tooltip)
- Assignee: avatar at end of row (24px circle)
- Title: takes 60-70% of row width — gets the most space

**Extract:** Meta information should use the minimum visual footprint that still communicates. Dots and small icons over text labels in dense contexts. Title/primary content gets the most real estate.

---

## EMOTIONAL TONE

**Observation:** Linear feels competent, not friendly. It doesn't try to be warm.

- No empty state illustrations with friendly characters
- Error states are factual and precise
- Onboarding is brief and assumes competence
- No celebratory animations

**Extract:** For developer/power-user tools, competence > warmth. The UI can be calm and precise without being cold. The warmth comes from quality and reliability, not from personality.

---

## TRUST PATTERNS

**Observation:** Trust is built through consistency and precision.

- Every interaction predictable
- No visual surprises
- Keyboard shortcuts documented and discoverable
- State changes are immediate and clear
- No "are you sure?" modals for low-stakes actions (trust the user)
- Undo is ubiquitous — so confirmations aren't needed

**Extract:** Remove confirmation dialogs for reversible actions. Add undo instead. Trust users more. This actually increases the feeling of trust because it treats the user as capable.

---

## MOTION PHILOSOPHY

**Observation:** Motion is micro and functional only.

- Panel slides in/out: 200ms, ease-out — communicates spatial layer
- Dropdown open/close: immediate to ~150ms — snappy
- No page transition animations
- No loading animations beyond simple spinner/bar
- Status changes animate in-place, no fanfare

**Extract:** Motion budget is small. Use it on: panel entry/exit (spatial communication) and state changes that need to be noticed (status updates). Nothing else.

---

## MINIMALISM STRATEGY

**Observation:** Features are present but not promoted. UI surface stays minimal.

- Advanced features behind `...` menus or keyboard shortcuts
- Settings page is the dumping ground (appropriately so)
- Primary views are uncluttered, not because features don't exist, but because they're accessed differently

**Extract:** Feature completeness doesn't require feature visibility. The UI can be minimal while the product is powerful. Surface the 20% of features used 80% of the time. Hide the rest.

---

## WHAT NOT TO EXTRACT

- The specific dark blue color — it's brand, not a universal principle
- The monochrome icon style — works for their brand, pick your own family
- The specific keyboard shortcut density — only appropriate for power-user products
- The extreme density — works for their specific user base (developers), would fail for general business users
