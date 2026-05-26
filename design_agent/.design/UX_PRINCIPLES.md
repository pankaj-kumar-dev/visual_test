# UX PRINCIPLES
> Decision filters. Every design choice must pass through at least one of these.
> Derived from: BRAND_TONE.md + USER_PSYCHOLOGY.md + PRODUCT_ESSENCE.md

---

## HOW TO USE THIS FILE

These principles are not aspirational slogans. They are filters.

When making a design decision, ask:
1. Which principle does this decision serve?
2. Does this decision conflict with another principle?
3. If there's a conflict, which principle takes precedence for this product? (Priority order is defined below.)

If a decision serves no principle, it is visual noise. Remove it.

---

## PRINCIPLE 01 — SIGNAL OVER NOISE

**Definition:** Every visual element must carry meaning. If removing it changes nothing for the user, it should be removed.

**Applies to:**
- Decorative borders
- Background patterns
- Ornamental icons
- Secondary colors on structural elements
- Dividers between already-separated content
- Hover effects with no functional purpose

**Test:** Cover each UI element and ask "does the user lose information or orientation?" If no: remove.

**Violation examples:**
- Card with shadow + border (double signal for same boundary)
- Icon + label where label alone suffices
- Color on every row in a table (color should mark exception, not all data)
- Dividers between items already spaced apart

---

## PRINCIPLE 02 — PROGRESSIVE DISCLOSURE

**Definition:** Show only what's needed for the current task. Reveal complexity on demand, not upfront.

**Applies to:**
- Advanced settings
- Secondary actions
- Optional form fields
- Contextual help
- Power-user features

**Implementation patterns:**
- Accordion / expandable sections for non-primary content
- "Advanced" toggle for configuration depth
- Tooltip / popover for supplementary information
- Inline expansion instead of new page for details
- Slide-over / drawer instead of full modal for editing

**Test:** Can a first-time user complete the primary JTBD without seeing anything not relevant to that task?

**Violation:** Surfacing all options on load because "power users might need them." Power users find options; novices get confused by them.

---

## PRINCIPLE 03 — FORGIVENESS BY DEFAULT

**Definition:** Reduce the cost of mistakes. Make errors recoverable. Make actions reversible where possible.

**Applies to:**
- Destructive actions (delete, archive, disconnect)
- State-changing actions (publish, send, submit)
- Data modification (bulk edits, overwrites)
- Navigation (losing unsaved form state)

**Implementation patterns:**
- Undo/undo buffer for recent actions
- Soft-delete (archive) before hard delete
- Confirmation dialogs for irreversible actions only
- Draft/autosave for long-form inputs
- Preview before publish
- Warning inline (not modal) for risky but non-destructive actions

**Test:** If a user makes a mistake, can they recover within 2 interactions?

**Violation:** Confirmation dialogs on low-stakes reversible actions (creates alert fatigue). No undo on high-stakes irreversible actions.

---

## PRINCIPLE 04 — INFORMED STATE

**Definition:** Users must always know: what state the system is in, what just happened, and what can happen next.

**Applies to:**
- Loading states
- Empty states
- Error states
- Success confirmations
- Background processing
- Sync status
- Form validation

**State contract (every interactive area must have all of these):**
- **Empty** — no data yet; what does it mean + how to fill it
- **Loading** — system is working; how long, what's happening
- **Error** — what went wrong + how to fix it
- **Populated** — normal operating state
- **Disabled** — why it's unavailable + when it becomes available

**Test:** Disconnect network. Can user understand what's happening? Does the UI tell them what failed?

**Violation:** Spinner with no label. Error with no action. Disabled button with no tooltip explaining why.

---

## PRINCIPLE 05 — HIERARCHY CLARITY

**Definition:** The most important element on any screen must be visually dominant without competing for attention.

**Applies to:**
- Every screen layout
- Card designs
- Table designs
- Form designs
- Navigation structures
- Modal designs

**Implementation rules:**
- One primary action per screen (can have secondary, tertiary — but hierarchy must be clear)
- Primary action: full-color filled button
- Secondary action: outlined or ghost button
- Tertiary action: text link or icon button
- Destructive action: visually distinct (red/danger) but not primary hierarchy — never the biggest button

**Visual hierarchy tools (in order of impact):**
1. Size
2. Color (use sparingly — reserved for hierarchy, not decoration)
3. Weight (typographic)
4. Contrast
5. Position (top-left reads first in LTR)
6. Whitespace (isolation draws attention)

**Test:** Blur the screen until it's unreadable. Can you still tell where the primary action is?

**Violation:** Two filled primary-color buttons on the same screen. No clear focal point. Every element at similar visual weight.

---

## PRINCIPLE 06 — SPATIAL INTENTIONALITY

**Definition:** Whitespace is not empty — it's structure. Every spacing choice must come from the scale and serve a purpose.

**Applies to:**
- Padding inside components
- Margin between components
- Section separation
- Content grouping (Gestalt proximity)
- Reading rhythm in text-heavy views

**Rules:**
- Small space = items in same group
- Medium space = related but distinct groups
- Large space = separate sections
- Whitespace around isolated elements = hierarchy signal (importance)

**Test:** Can you tell which items are grouped together by spacing alone, without color, borders, or labels?

**Violation:** Inconsistent padding within component family. Spacing values not from defined scale. Using borders where spacing would communicate grouping.

---

## PRINCIPLE 07 — PURPOSEFUL MOTION

**Definition:** Animation serves communication or feedback. It never exists for aesthetic reasons alone.

**Applies to:**
- Page/view transitions
- Element enter/exit
- State change feedback
- Loading/progress indicators
- Hover effects
- Micro-interactions

**When motion is justified:**
- Communicating spatial relationship (panel sliding in = it's an overlay above content)
- Confirming action was received (button press feedback)
- Orienting user during state change (fade in = new content)
- Progress indication during wait
- Drawing attention to critical change (status update, notification)

**When motion is NOT justified:**
- Decorative entrance animations for static content
- Hover effects on non-interactive elements
- Scroll-triggered reveals on functional UI (fine on landing pages, not in application UI)
- Animation on every page load

**Duration limits:**
- Micro-feedback: 100-150ms (button press, checkbox tick)
- UI transition: 150-250ms (panel expand, dropdown open)
- State change: 200-300ms (tab switch, view change)
- Entrances: 200-400ms max
- Never exceed 400ms for UI navigation

**Test:** Set OS to "reduce motion." Does the UI still function fully? If yes, motion is enhancement. If no, it's a dependency — fix it.

---

## PRINCIPLE 08 — DENSITY RESPECT

**Definition:** Match information density to the user's current task mode. Don't show everything everywhere.

**Task modes and appropriate density:**

| Mode | Density | Example |
|------|---------|---------|
| Focus / Creation | Sparse | Writing, single form, configuration |
| Review / Comparison | Medium | Dashboard, list view, audit trail |
| Monitoring | Dense | Status board, data table, analytics |
| Learning | Sparse-Medium | Onboarding, tutorial, help center |

**Implementation:**
- Dashboard views: structured density with clear hierarchy
- Form views: sparse, focused, one-task orientation
- List views: consistent row height, no orphaned whitespace
- Detail views: grouped information, progressive disclosure for metadata

**Test:** Remove secondary information. Does the primary task become clearer? If yes, secondary info might be too prominent.

---

## PRINCIPLE 09 — ACCESSIBLE BY ARCHITECTURE

**Definition:** Accessibility is structural, not a retrofit. Design for keyboard navigation, screen readers, and reduced motion from the start.

**Non-negotiable rules:**
- All interactive elements focusable by keyboard
- Focus ring visible and styled (never `outline: none` without custom focus style)
- Color is never the only signal (don't use "red = error" without also using text/icon)
- Interactive targets minimum 44×44px touch target (iOS HIG standard)
- Text contrast ≥ 4.5:1 normal, ≥ 3:1 large (WCAG AA minimum)
- Form inputs always have visible labels (no placeholder-only labels)
- Dialogs trap focus until dismissed
- Loading states announced to screen readers (aria-live)

**Test:** Tab through the UI without a mouse. Can you reach and activate every function? Is the focus path logical?

---

## PRINCIPLE 10 — TRUST THROUGH CONSISTENCY

**Definition:** Predictability builds trust. When a pattern appears, it must behave the same way every time.

**Applies to:**
- Navigation placement
- Button behavior (same label = same action every time)
- Icon semantics (one icon = one meaning)
- Color semantics (blue = primary action, always)
- Feedback patterns (same action type = same feedback type)
- Empty state patterns
- Error state patterns

**Test:** Change one UI behavior contextually (different result for same click in different context). Ask a user to predict what will happen. Surprise = violation.

**Violation:** Using the same icon for two different actions. Using "Save" on a button that navigates instead. Using blue for both primary action and informational tags.

---

## PRINCIPLE PRIORITY ORDER

When two principles conflict, resolve using this order:

```
1. Accessible by Architecture   (non-negotiable — legal + ethical requirement)
2. Informed State               (users must always know what's happening)
3. Forgiveness by Default       (mistakes must be recoverable)
4. Hierarchy Clarity            (users must find their way)
5. Signal over Noise            (clarity over completeness)
6. Progressive Disclosure       (reveal on demand)
7. Trust through Consistency    (predictability)
8. Density Respect              (task-appropriate density)
9. Spatial Intentionality       (structure through space)
10. Purposeful Motion           (last — enhancement only)
```

**Example conflict resolution:**
- "Informed State" vs "Signal over Noise": A status badge that communicates system state should stay even if it adds visual complexity. State awareness > noise reduction.
- "Progressive Disclosure" vs "Hierarchy Clarity": If hiding a secondary action makes the primary action unclear, show the secondary action at lower hierarchy. Clarity > disclosure.

---

## PRINCIPLE AUDIT CHECKLIST

For each major screen/component, run this check:

| Principle | Passing? | Notes |
|-----------|---------|-------|
| Signal over Noise | [ ] | |
| Progressive Disclosure | [ ] | |
| Forgiveness by Default | [ ] | |
| Informed State | [ ] | |
| Hierarchy Clarity | [ ] | |
| Spatial Intentionality | [ ] | |
| Purposeful Motion | [ ] | |
| Density Respect | [ ] | |
| Accessible by Architecture | [ ] | |
| Trust through Consistency | [ ] | |
