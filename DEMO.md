# Demo Guide

A recruiter-facing walkthrough of the Visual Test Builder.
Total demo time: 5–8 minutes.

---

## Recruiter Demo Script

### Setup (30s before demo starts)

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173
4. In the browser, open DevTools → Console → close it (shows it's a real app, not static)

---

### Part 1 — Build a test visually (2 min)

> "The core idea: write E2E tests by composing commands visually — no code editor, no typos in selectors."

1. Load the login flow example → click **Examples…** dropdown → select **Login flow**
2. The tree appears on canvas: a `describe` block with a `beforeEach` hook and two `it` tests
3. Click on "logs in with valid credentials" test → it expands showing 4 steps
4. Click step 1 → ConfigPanel on the right shows the `get` command and its selector
5. Point out: strategy dropdown (testId, role, label, etc.) — selector strategy is first-class
6. Click step 1's chain badge `.type()` → it shows in ConfigPanel — chains are editable
7. Double-click the test name → rename it inline → undo with Ctrl+Z → it reverts

**Talking point:** "The data model is a proper AST — suite/test/hook tree with command chains. Undo/redo on every mutation, 50-step history."

---

### Part 2 — Live code generation (1 min)

> "Every change generates real Cypress spec code in real time."

1. Click the **Code** tab on the right
2. Point at the `describe` / `beforeEach` / `it` structure — it mirrors the tree exactly
3. Switch the framework dropdown in the canvas header to **Playwright** → code switches
4. Switch back to **Cypress**
5. Click **Copy** → paste into a terminal to show it's valid JS

**Talking point:** "Frontend-side codegen via a proper emitter — the same tree drives both Cypress and Playwright output."

---

### Part 3 — Execution + SSE (2 min)

> "The builder connects to a backend that queues and runs tests. Live updates via SSE."

1. Click the **Run** tab
2. Click **Run Test**
3. Watch steps appear one by one in real time (SSE stream)
4. Show the status badge: Queued → Running → Passed
5. Point at the log entries below: timestamps, step labels, durations
6. Show the summary: "✓ N passed · Xms"

**Talking point:** "Backend has a FIFO execution queue, an async generator runner that emits step events, and an SSE fan-out layer. The frontend subscribes per execution ID."

---

### Part 4 — History + Analytics (1 min)

1. Click **History** tab → **Runs** section shows the run just completed
2. Click **Saved Flows** → click **Load** on the login flow → tree restores
3. Click **Analytics** tab → pass rate bar, avg/p95 duration stats
4. Run the test 2 more times → click **Refresh** in Analytics → flaky step detection appears

**Talking point:** "Analytics engine computes pass rate, p95 duration, and flags steps with 15–85% failure rate as flaky. Per-step, not per-test."

---

### Part 5 — Persistence + import/export (30s)

1. Edit the flow (rename a test)
2. Click **Save Flow** in header → "Saved ✓"
3. Click **History → Saved Flows** — shows the saved flow
4. Click **Code → Export JSON** → downloads the flow as JSON
5. Click **Import JSON** → drop the same JSON back in → flow restores

**Talking point:** "Flows persist to JSON on the backend. Export/import is a full-fidelity round-trip — no data loss, schema validated with Zod."

---

## Screenshot Checklist

Take these screenshots for README and resume:

| # | Screenshot | What to show |
|---|---|---|
| 1 | **Full app — 3-column layout** | Canvas with login flow tree, ConfigPanel open on a step, Code tab visible |
| 2 | **Code panel — Cypress output** | Login flow generated code, validation banner absent |
| 3 | **ConfigPanel — step selected** | `get` command with testId selector + `.type()` chain |
| 4 | **Execution panel — running** | "Running…" badge, steps appearing live |
| 5 | **Execution panel — passed** | "Passed ✓" badge, all steps green, duration shown |
| 6 | **History tab — Runs** | 5+ executions with mixed pass/fail icons, pass rate stats |
| 7 | **Analytics tab** | Pass rate bar at ~80%, avg duration, flaky detection section |
| 8 | **Saved Flows tab** | 2 saved flows with Load buttons |
| 9 | **Validation errors** | A step with empty selector (red ⚠), error banner in CodePanel |
| 10 | **Playwright code** | Same flow with Playwright target selected — `page.` syntax |

### How to capture

- Use browser zoom at 100% for crisp screenshots
- Dark theme is default — no changes needed
- Window width ≥1400px for the 3-column layout to look good
- For screenshot #4 (running), click Run and immediately screenshot — steps appear fast in mock mode

---

## Demo flows

Two example flows are embedded and loadable from the **Examples…** dropdown:

| Flow | Tests | Steps | Demonstrates |
|---|---|---|---|
| TaskFlow — Login | 2 | 8 | beforeEach hooks, chain commands, assertion checking |
| Create task flow | 2 | 10 | nested suites, form interaction, selector strategies |

---

## Talking points for technical interviews

**Architecture decisions worth discussing:**

- **Flat node map** (`nodes: Record<string, TreeNode>`) instead of nested tree — enables O(1) lookup, atomic Zustand updates, clean undo/redo without deep cloning
- **Command chain as recursive data structure** — `CommandNode.chain: CommandNode[]` mirrors Cypress's chainable API exactly; unlimited depth
- **Selector as a first-class semantic type** — `SelectorNode.strategy` encodes test-id, role, label, text etc. vs raw CSS — enables framework-agnostic targeting
- **SSE over WebSocket** — unidirectional server-push is sufficient; no handshake overhead; simple to proxy
- **Frontend-generated specCode** — codegen runs on client, backend receives spec string; avoids duplicating codegen logic server-side; documented tradeoff
- **IFlowStore / IExecutionStore interfaces** — designed as SQL migration seams; swap in Postgres without touching routes
