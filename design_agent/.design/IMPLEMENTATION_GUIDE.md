# IMPLEMENTATION GUIDE
> Developer-facing design system implementation strategy.
> Bridges design decisions into React/Tailwind code architecture.

---

## IMPLEMENTATION PHILOSOPHY

Design systems fail in two ways:
1. **Too abstract** — tokens and principles with no path to code
2. **Too rigid** — component library with no room for product-specific composition

This guide avoids both. It defines structure at the right layer of abstraction:
- Token → CSS variable → Tailwind config class → Component prop → UI

---

## TECH STACK ASSUMPTIONS

```
Framework:        React 19 + Vite
Styling:          Raw CSS with CSS custom properties (NO Tailwind — see DESIGN_DECISIONS.md)
Animation:        CSS transitions only (no GSAP/Framer — MVP constraint)
Icons:            Text-based currently (emoji + abbreviations). Recommended: lucide-react
Component Base:   None — hand-crafted components. Recommended for v2: Radix UI primitives
Type System:      TypeScript (core/), JSX (features/)
State:            Zustand (useFlowStore.ts)
DnD:              @dnd-kit/core (step reordering)
```

**Important:** This project uses raw CSS, NOT Tailwind. All CSS custom property patterns
in this guide apply. Tailwind config examples in DESIGN_SYSTEM.md are reference only —
map those patterns to CSS custom properties in `styles.css` instead.

---

## TOKEN IMPLEMENTATION

### CSS Custom Properties (Design Tokens as CSS Variables)

Define in `globals.css` or `tokens.css`:

```css
:root {
  /* Surface */
  --color-surface-base:     theme('colors.neutral.50');
  --color-surface-elevated: theme('colors.white');
  --color-surface-overlay:  theme('colors.white');
  --color-surface-recessed: theme('colors.neutral.100');

  /* Content */
  --color-content-primary:   theme('colors.neutral.900');
  --color-content-secondary: theme('colors.neutral.600');
  --color-content-tertiary:  theme('colors.neutral.400');
  --color-content-link:      theme('colors.accent.600');

  /* Interactive */
  --color-interactive-default: theme('colors.accent.500');
  --color-interactive-hover:   theme('colors.accent.600');
  --color-interactive-active:  theme('colors.accent.700');
  --color-interactive-subtle:  theme('colors.accent.50');
  --color-interactive-focus:   theme('colors.accent.500');

  /* Borders */
  --color-border-default: theme('colors.neutral.200');
  --color-border-strong:  theme('colors.neutral.300');
  --color-border-subtle:  theme('colors.neutral.100');
  --color-border-focus:   theme('colors.accent.500');

  /* State */
  --color-state-success:    theme('colors.green.500');
  --color-state-success-bg: theme('colors.green.50');
  --color-state-warning:    theme('colors.amber.500');
  --color-state-warning-bg: theme('colors.amber.50');
  --color-state-danger:     theme('colors.red.500');
  --color-state-danger-bg:  theme('colors.red.50');

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-xl: 16px;
}

.dark {
  --color-surface-base:      theme('colors.neutral.950');
  --color-surface-elevated:  theme('colors.neutral.900');
  --color-surface-overlay:   theme('colors.neutral.900');
  --color-surface-recessed:  theme('colors.neutral.800');
  --color-content-primary:   theme('colors.neutral.50');
  --color-content-secondary: theme('colors.neutral.400');
  --color-content-tertiary:  theme('colors.neutral.600');
  --color-border-default:    theme('colors.neutral.800');
  --color-border-strong:     theme('colors.neutral.700');
  --color-border-subtle:     theme('colors.neutral.900');
}
```

---

## COMPONENT ARCHITECTURE

### File Structure

```
src/
  components/
    ui/                     ← Design system primitives (single-responsibility)
      Button.tsx
      Input.tsx
      Card.tsx
      Badge.tsx
      Skeleton.tsx
      Spinner.tsx
      Separator.tsx
      Label.tsx
    composite/              ← Business components (composed from primitives)
      DataTable.tsx
      SearchInput.tsx
      EmptyState.tsx
      PageHeader.tsx
      ConfirmDialog.tsx
    layout/                 ← Layout components
      AppShell.tsx
      Sidebar.tsx
      PageContainer.tsx
      Section.tsx
  lib/
    cn.ts                   ← className utility (clsx + tailwind-merge)
    tokens.ts               ← Typed token references
```

### The `cn` Utility (Required)

```typescript
// lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Why:** Tailwind class conflicts (e.g., `p-4 p-8`) are silently won by CSS specificity, not by intent. `twMerge` resolves the last-applied class correctly. `clsx` handles conditional classes cleanly.

---

## COMPONENT IMPLEMENTATION PATTERNS

### Pattern 1 — Variant-based Component

Use when a component has 3+ visual variants that should be enforced:

```typescript
// components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-interactive-focus] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:     'bg-[--color-interactive-default] text-white hover:bg-[--color-interactive-hover] active:bg-[--color-interactive-active]',
        secondary:   'border border-[--color-border-default] bg-[--color-surface-elevated] text-[--color-content-primary] hover:bg-[--color-surface-recessed]',
        ghost:       'text-[--color-content-secondary] hover:bg-[--color-surface-recessed] hover:text-[--color-content-primary]',
        destructive: 'bg-[--color-state-danger] text-white hover:bg-red-600 active:bg-red-700',
        link:        'text-[--color-content-link] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-[--radius-sm]',
        sm: 'h-8 px-3 text-sm rounded-[--radius-md]',
        md: 'h-9 px-3.5 text-sm rounded-[--radius-md]',
        lg: 'h-10 px-4 text-base rounded-[--radius-md]',
        xl: 'h-11 px-5 text-base rounded-[--radius-lg]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  variant,
  size,
  loading,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'xs' || size === 'sm' ? 12 : 16} />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
```

**Tools needed:** `class-variance-authority`, `clsx`, `tailwind-merge`

---

### Pattern 2 — Compound Component (for complex components)

Use for components with multiple parts that must communicate (Tabs, Accordion, DropdownMenu):

```typescript
// Tabs example structure
const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
}

// Usage:
<Tabs.Root defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
</Tabs.Root>
```

**Why:** Avoids prop drilling and keeps composition flexible without sacrificing structural clarity.

---

### Pattern 3 — Polymorphic Component

Use for components that can render as different HTML elements:

```typescript
// Used for headings, text, links that need semantic flexibility
interface TextProps<T extends React.ElementType = 'p'> {
  as?: T
  variant?: 'heading-1' | 'heading-2' | 'body' | 'caption' | 'label'
  className?: string
}

function Text<T extends React.ElementType = 'p'>({
  as,
  variant = 'body',
  className,
  children,
  ...props
}: TextProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof TextProps<T>>) {
  const Component = as || 'p'
  return (
    <Component className={cn(textVariants({ variant }), className)} {...props}>
      {children}
    </Component>
  )
}
```

---

## RESPONSIVE IMPLEMENTATION

### Breakpoint Usage Rules

```typescript
// In Tailwind — always mobile-first:

// Bad: desktop-first (requires overrides going down)
<div className="flex-row sm:flex-col" />

// Good: mobile-first (enhancements going up)
<div className="flex-col md:flex-row" />
```

### Common Responsive Patterns

```jsx
// Sidebar navigation
<aside className="hidden lg:block w-64 shrink-0" />
<MobileNav className="lg:hidden" />

// Card grids
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" />

// Content max-width
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" />

// Stack → row at breakpoint
<div className="flex flex-col md:flex-row gap-4 md:gap-6" />
```

---

## STATE MANAGEMENT IN COMPONENTS

### Component States Checklist

Every data-rendering component must handle all states:

```tsx
function ItemList({ items, loading, error }: Props) {
  if (loading) return <ItemListSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={...} />
  if (!items.length) return <EmptyState title="No items yet" action={...} />

  return (
    <ul>
      {items.map(item => <ItemRow key={item.id} item={item} />)}
    </ul>
  )
}
```

**Rule:** States are not afterthoughts. The empty/loading/error branches are part of the component spec, not edge cases.

---

## ACCESSIBILITY IMPLEMENTATION

### Required Patterns

```tsx
// Icon buttons — always need accessible label
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

// Form fields — always visible label + proper connection
<div>
  <label htmlFor="email">Email address</label>
  <input id="email" type="email" aria-describedby="email-help" />
  <p id="email-help">Used for account recovery</p>
</div>

// Error messages — connected to field
<input aria-invalid={hasError} aria-describedby={hasError ? "email-error" : undefined} />
{hasError && <p id="email-error" role="alert">{errorMessage}</p>}

// Loading states — announced
<div aria-live="polite" aria-busy={loading}>
  {loading ? <Skeleton /> : <Content />}
</div>

// Modal — focus trap + announcement
<dialog aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">Confirm Action</h2>
  ...
</dialog>

// Skip link — for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-top bg-white p-2 rounded">
  Skip to content
</a>
```

### Focus Management

```tsx
// Auto-focus on modal open
useEffect(() => {
  if (open) {
    firstFocusableRef.current?.focus()
  }
}, [open])

// Restore focus on modal close
useEffect(() => {
  if (!open && triggerRef.current) {
    triggerRef.current.focus()
  }
}, [open])
```

---

## PERFORMANCE PATTERNS

### Code Splitting by Route

```tsx
// Lazy load heavy routes
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  )
}
```

### Image Optimization

```tsx
// Use correct sizing attributes to prevent layout shift
<img
  src={src}
  alt={alt}
  width={640}
  height={480}
  loading="lazy"
  decoding="async"
/>
```

### List Virtualization

For lists > 100 items, use virtualization:
```tsx
// react-virtual or @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual'
```

---

## TAILWIND BEST PRACTICES

### Don't use @apply in components

```css
/* Bad — creates coupling between Tailwind and CSS, hard to trace */
.btn-primary {
  @apply bg-blue-500 text-white px-4 py-2 rounded;
}

/* Good — keep Tailwind in JSX where it's visible */
```

**Exception:** `@apply` is acceptable for global resets and base HTML element styles in `globals.css`.

### Avoid Tailwind class strings in constants

```tsx
// Bad — loses Tailwind's purging and intellisense
const baseClasses = 'flex items-center gap-2 p-4'

// Good — use cva or inline with cn()
const buttonBase = cva('flex items-center gap-2')
```

### Use `tailwind-merge` to resolve class conflicts

```tsx
// Without merge: the last p-4 doesn't win, specificity decides
<Button className="p-4" /> // might not work as expected

// With cn/twMerge: explicit override always wins
function Button({ className, ...props }) {
  return <button className={cn('p-3', className)} {...props} />
  // className="p-4" will correctly override p-3
}
```

---

## DESIGN-TO-CODE HANDOFF CHECKLIST

For each new component or screen:

```
Design side:
[ ] All states designed (empty, loading, error, populated, disabled)
[ ] Spacing from defined scale
[ ] Colors from token system
[ ] Component defined in COMPONENT_RULES.md
[ ] Non-obvious decisions logged in DESIGN_DECISIONS.md

Implementation side:
[ ] Tokens used via CSS custom properties (not hardcoded values)
[ ] All states implemented in code
[ ] Keyboard accessible
[ ] ARIA labels on non-obvious elements
[ ] Loading state uses Skeleton component
[ ] Error state uses ErrorState component
[ ] Mobile layout tested
[ ] Dark mode tested (if supported)
[ ] Reduced motion tested
```
