# INSPIRATION — STRIPE DASHBOARD
> dashboard.stripe.com — Financial operations for businesses
> Extract: trust architecture, data hierarchy, information density at scale

---

## WHY STRIPE DASHBOARD MATTERS

Stripe handles people's money. Their UI must communicate trust at every pixel. They've solved a genuinely hard problem: making dense financial data feel manageable, not overwhelming. The dashboard is used by both technical founders and non-technical finance teams — simultaneously.

---

## SPACING PHILOSOPHY

**Observation:** Stripe uses a notably comfortable spacing system for a data-dense product.

- Cards have generous padding (24px+) — more than most dashboards
- Table rows are taller than minimum (44-48px) — financial data gets room to breathe
- Section spacing is substantial — groups are clearly separated
- The generosity signals: "slow down, review this data carefully"

**Extract:** Financial data, legal data, or any data where accuracy matters more than speed benefits from generous spacing. Compact density signals "scan fast." Generous density signals "read carefully." Match to context.

---

## TYPOGRAPHY RHYTHM

**Observation:** Stripe uses size to distinguish category, weight within category.

- Large amounts: display-sized, bold — they're the point of the dashboard
- Supporting context (date, description): small, regular weight
- Labels: small, medium weight, muted color — present but not competing
- No decorative typography

**Extract:** In data contexts, let the data be the typography hero. Labels should whisper while numbers speak. Use color and weight reduction (not size alone) to subordinate contextual information.

---

## TRUST ARCHITECTURE

**Observation:** Stripe builds trust through obsessive precision and data transparency.

- Timestamps are always exact (not "2 hours ago" for financial records — exact datetime)
- Every transaction shows status clearly, with no ambiguity
- Color coding: green = complete, orange = pending, red = failed — never reused for other meanings
- Audit trails are prominent, not buried
- Copy in the UI is legally precise, not casual
- Hover reveals exact metadata on charts (no vague tooltips)

**Extract for trust-sensitive products:**
- Show exact time on records where "2 hours ago" could cause confusion
- Never reuse semantic colors for aesthetic purposes in the same product
- Surface audit/history logs near the data they reference
- In error states: show the exact error, not a softened summary

---

## INFORMATION HIERARCHY IN DATA VIEWS

**Observation:** Primary metric always anchors each card.

- Metric card: large number top, period + comparison below, sparkline if trends matter
- The number is always the hero — never compete with it
- Supporting context is visible but clearly secondary
- Related metrics are grouped in the same card section, not scattered

**Extract:** In any metric card, define one number as primary. Everything else supports it. Never two numbers at equal visual weight in the same card — one must dominate.

---

## DASHBOARD COMPOSITION

**Observation:** Stripe avoids the "widget chaos" problem through strong vertical rhythm.

- Consistent card heights within rows (grid-aligned)
- Charts positioned below KPI summary row
- Tables appear below charts
- Left-to-right, top-to-bottom reading path is clearly established

**Extract:** Dashboard layout should follow a reading grammar: overview row (KPIs) → trend row (charts) → detail row (tables). Breaking this grammar requires justification.

---

## CONVERSION GEOMETRY

**Observation:** Stripe makes the primary action visible without being aggressive.

- "Add payment method", "Manage subscription" — present in sidebar context, not modal-first
- Progressive disclosure: summary → detail → edit
- Never blocks the view with an upgrade prompt when user is reviewing data
- CTA placement: end of flow, not interrupting it

**Extract:** Don't interrupt a user who is in "review mode" with action prompts. Place conversion/action CTAs at the natural end of an information review flow.

---

## EMPTY STATE CRAFT

**Observation:** Stripe empty states are not cheerful — they're instructional.

- "You have no transactions yet" → followed by exactly what to do to get transactions
- No illustrations for empty data tables (would feel frivolous in financial context)
- Empty charts show the axis structure — user knows what the chart will look like
- The empty state communicates: "the product is ready, you haven't put data in yet"

**Extract:** Empty state tone must match product emotional register. Finance/ops tools: matter-of-fact and instructional. Consumer products: can be warmer. Never use illustrations where they feel incongruous with the product's seriousness.

---

## WHAT NOT TO EXTRACT

- The specific Stripe blue — it's brand, not principle
- The heavy reliance on table-based UI — works for financial records, overkill for simpler products
- The complexity of the filter/search bar — Stripe has a very specific use case
- The density of the left navigation — reflects their large feature surface, not a pattern to copy
