# INTERACTION RULES
> Motion, feedback, state transitions, and micro-interactions.
> Derived from: UX_PRINCIPLES.md (Purposeful Motion) + USER_PSYCHOLOGY.md (Feedback Loops)

---

## MOTION PHILOSOPHY

Motion communicates. It is a semantic tool, not a decoration layer.

### Motion Serves Four Functions

| Function | Description | Example |
|----------|------------|---------|
| **Spatial** | Explains spatial relationships between elements | Panel slides in from right = it's layered above |
| **Feedback** | Confirms an action was received | Button press scale, checkbox fill |
| **Orientation** | Helps user track state change | Fade + translate in for new content |
| **Continuity** | Maintains object identity during transformation | Expand in place instead of replace |

**If the motion doesn't serve one of these four functions, remove it.**

---

## DURATION SCALE

Motion duration must be calibrated to perceived distance and importance.

```
instant:    0ms      — State toggle with no visual travel (checkbox check, toggle flip internal)
micro:      100ms    — Subtle feedback (hover glow, scale 0.98)
fast:       150ms    — UI micro-interactions (button press, badge appear)
default:    200ms    — Standard UI transition (dropdown open, focus ring)
comfortable: 250ms   — Panel expand, card expand, content reveal
slow:       300ms    — View transitions, page-level changes
deliberate: 400ms    — Large spatial movements (sidebar open, sheet slide-in)
never:      >400ms  — For any UI navigation transition. Longer = animation, not transition.
```

**Why this matters:** Users wait for animations before continuing. Every millisecond of animation duration is a millisecond of forced user wait. Be aggressive about keeping durations short.

---

## EASING CURVES

Match easing to motion type.

| Curve | CSS/Tailwind | Use Case |
|-------|-------------|---------|
| `ease-out` | `cubic-bezier(0,0,0.2,1)` | **Entrances** — elements entering viewport (start fast, land gently) |
| `ease-in` | `cubic-bezier(0.4,0,1,1)` | **Exits** — elements leaving viewport (start slow, accelerate away) |
| `ease-in-out` | `cubic-bezier(0.4,0,0.2,1)` | **Transformation** — element changing size/position without entering/leaving |
| `linear` | `linear` | Progress bars, loading indicators — must feel continuous |
| `spring` | CSS approximation | Playful bouncy feedback (rare — consumer apps only) |

**Rule:** Never use `ease` (browser default — it's slightly off in both directions). Always specify.

---

## INTERACTION FEEDBACK LIBRARY

### Button Interactions
```
Hover:        Background darkens 10-15% (filled), border + background tint (outlined)
              Duration: 150ms ease-out
Press (active): Scale 0.97, slight darken
              Duration: 100ms ease-in
Focus:        Ring 2px brand-color, offset 2px
              Duration: 150ms ease-out
Loading:      Spinner replaces/appends to label, pointer-events: none
              Spinner: 16px, 2px border, rotating 500ms linear
Released:     Returns to hover state
              Duration: 100ms ease-out
```

### Input Interactions
```
Focus:        Border transitions to accent color, ring appears
              Duration: 150ms ease-out
              Ring: brand-accent/20 3px spread
Typing:       No animation (let text appear naturally)
Blur:         Ring fades, border returns to default (if valid) or error (if invalid)
              Duration: 200ms ease-out
Error:        Border color transitions to danger, message fades in below
              Duration: 200ms ease-out
Clear (×):    Appears after first keystroke, fades in. Disappears on clear.
              Duration: 150ms ease-out
```

### Dropdown / Select
```
Open:         Content fades in + translates up 4px
              Duration: 150ms ease-out
Close:        Fades out + translates down 4px
              Duration: 100ms ease-in
Option hover: Subtle background fill
              Duration: 80ms ease-out (nearly instant — feel snappy)
Selection:    Checkmark appears, highlight applies
              Duration: 100ms ease-out
```

### Modal
```
Backdrop:     Fades from 0 → 0.5 opacity
              Duration: 200ms ease-out
Dialog:       Fades in + scales from 0.96 → 1.0
              Duration: 200ms ease-out
Close:        Dialog scales from 1.0 → 0.96, fades out
              Duration: 150ms ease-in
Backdrop out: Fades from 0.5 → 0 (slightly longer than dialog close for feel)
              Duration: 200ms ease-in
```

### Sidebar / Panel
```
Open:         Translate from -100% (or -280px) to 0, optional fade-in
              Duration: 250ms ease-out
Close:        Translate from 0 to -100%
              Duration: 200ms ease-in
Main content shift: width/margin transition if sidebar pushes content
              Duration: same as sidebar, ease-in-out
```

### Toast / Notification
```
Enter:        Slide up + fade in (bottom: -8px → 0, opacity 0 → 1)
              Duration: 250ms ease-out
Exit:         Fade out + slight slide down
              Duration: 200ms ease-in
Stack shift:  Items above shift up when new toast enters
              Duration: 200ms ease-in-out
```

### Accordion / Expandable
```
Expand:       Height transitions from 0 to full (use max-height: 0 → max-height: content)
              Duration: 250ms ease-out
Content fade: Content fades in after height expands slightly
              Duration: 150ms ease-out, 50ms delay
Collapse:     Height collapses
              Duration: 200ms ease-in
Chevron:      Rotates 0° → 180° (down to up)
              Duration: 200ms ease-in-out
```

### Skeleton Loading
```
Shimmer:      Background-position animates left to right
              Duration: 1500ms linear infinite
Color range:  bg-neutral-100 to bg-neutral-200 (approximately)
Start:        Skeleton appears immediately (no delay)
End:          Content fades in replacing skeleton
              Duration: 200ms ease-out
```

### Tab Switching
```
Active indicator: Underline/bar transitions position left/right
                  Duration: 200ms ease-in-out
Content:          Fade in (no slide — horizontal slide for tabs is disorienting without context)
                  Duration: 150ms ease-out
```

---

## STATE TRANSITION RULES

### Loading State Design

Every async operation must have a loading state. Pick the right type:

| Operation | Loading Pattern | Why |
|-----------|----------------|-----|
| Full page load | Full skeleton | Preserve layout, prevent shift |
| Partial data (widget) | Widget skeleton | Only affected area |
| Button-triggered action | Button spinner + disabled | User knows their action is processing |
| Background sync | Status indicator (small, persistent) | Non-blocking, but visible |
| Long operation (>5s) | Progress bar + message | Communicate progress, reduce anxiety |
| File upload | Progress bar with percentage | User needs to know how much remains |

**Rule:** Never show a blank space where content will appear. Either show skeleton, previous state, or a spinner with context.

### Empty State Transitions

When data populates a previously empty state:
1. Empty state fades out (150ms ease-in)
2. Content fades in and potentially slides up 8px (200ms ease-out)

When data is removed and state becomes empty:
1. Content fades out (150ms ease-in)
2. Empty state fades in (200ms ease-out, 50ms delay)

### Error State Design

Error states must communicate:
1. **What failed** (specific, not "something went wrong")
2. **Why it failed** (if the reason helps user act)
3. **What to do** (specific recovery action, not "try again")

Inline validation errors:
- Appear immediately on blur (not on typing — interrupts flow)
- Exception: format validation (email, URL) can show while typing after first blur

Form submission errors:
- Show at top of form (summary) AND inline on each failing field
- Auto-scroll to first error if off-screen
- Error border + icon + message below field

---

## GESTURE AND POINTING RULES

### Touch Targets
```
Minimum:        44×44px (iOS HIG, Apple Watch target — aggressive but safe)
Recommended:    48×48px for primary actions
Spacing:        8px minimum between adjacent touch targets
```

### Hover vs. Touch Philosophy
```
Hover effects:    Progressive enhancement — UI must function without hover
Hover reveals:    Must have equivalent on touch (tap to reveal)
Drag interactions: Always provide tap/click alternative
Long press:       Never as only way to access a function (desktop has no long press)
```

### Swipe Patterns (mobile)
```
Swipe left (row):  Reveal destructive/action menu
Swipe right:       Archive / save / positive action (context dependent)
Pull to refresh:   Acceptable for content feeds, not for structured data
```

---

## KEYBOARD INTERACTION CONTRACT

Every component must define its keyboard behavior:

| Component | Keys | Behavior |
|-----------|------|---------|
| Button | `Enter` or `Space` | Activate |
| Input | `Tab` | Focus next field |
| Input | `Shift+Tab` | Focus previous field |
| Select/Dropdown | `Space` or `Enter` | Open |
| Select/Dropdown | `↑↓` | Navigate options |
| Select/Dropdown | `Enter` | Select option |
| Select/Dropdown | `Escape` | Close without selecting |
| Modal | `Escape` | Close |
| Modal | `Tab` | Cycle through focusable elements (trapped) |
| Modal | `Shift+Tab` | Reverse cycle (trapped) |
| Accordion | `Enter` or `Space` | Toggle expand/collapse |
| Tab panel | `←→` | Switch tabs |
| Toast | `Escape` | Dismiss |

**Rule:** Keyboard focus must be visible at all times. No `outline: none` without a custom visible focus style.

---

## REDUCED MOTION CONTRACT

All animations must degrade gracefully under `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Replace with instant transitions */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Exceptions:** Progress bars (linear motion, not decorative), loading spinners (functional feedback — use opacity pulse instead of rotation).

**Test:** Enable OS reduced motion setting. Walk through all interactions. If any UI becomes non-functional, that motion is structural — fix it to be enhancement only.

---

## FEEDBACK TIMING RULES

| Action Type | First Feedback | Final Feedback |
|------------|---------------|---------------|
| Click/tap | < 16ms (immediate visual response) | On result |
| Form save | < 500ms (button loading state) | Success/error state |
| Page navigation | < 100ms (loading indicator) | Page content rendered |
| Search/filter | < 300ms (debounced, then skeleton) | Results appear |
| File upload | Immediate progress start | Completion confirmation |
| Background task | Status visible within 1s | Completion notification |

**The silent UI rule:** Never leave the UI "silent" for > 500ms after a user action. If the operation takes longer, show a loading state.
