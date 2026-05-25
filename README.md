# Visual Test Builder

Production-oriented showcase for a full-stack visual E2E test authoring system. The app models test suites as structured data, generates Cypress or Playwright code, runs executions through an API-backed runner queue, and surfaces run history plus quality analytics.

![Architecture overview](docs/diagrams/architecture.png)

## Why This Project Matters

| Engineering problem | Project approach |
| --- | --- |
| E2E tests are slow to author consistently | Visual suite/test/hook/step editor backed by a typed flow model |
| Framework code should stay reviewable | Deterministic Cypress and Playwright emitters |
| Test execution needs live feedback | Express execution API with Server-Sent Events |
| Local prototypes need low setup cost | JSON-backed stores behind replaceable interfaces |
| Quality signals should come from run data | History, pass-rate, duration, and flaky-step analytics |

## Engineering Highlights

| Area | What exists | Why it is useful |
| --- | --- | --- |
| Domain model | Versioned `Flow` tree with suites, tests, hooks, steps, command chains, selectors, assertions, environments | One intermediate representation powers UI, validation, codegen, persistence, execution, and analytics |
| Validation | Zod schema validation plus command-chain validation | Prevents invalid root commands, incompatible chains, missing selectors, and `test.only` mistakes |
| Code generation | Cypress and Playwright emitters | Shows adapter-based architecture around a shared model |
| Backend API | Express routes for flows, executions, SSE, analytics | Separates authoring from execution and observability |
| Async execution | FIFO in-process queue, runner abstraction, normalized runner events | Keeps run lifecycle explicit and extensible |
| Analytics | Pass rate, average/p95 duration, flaky-step candidates | Turns execution history into engineering signals |

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite 8, Zustand, dnd-kit, Zod |
| Backend | Node.js, Express 5, TypeScript, Zod, uuid |
| Execution | Mock runner by default, Cypress runner with `RUNNER=cypress` |
| Persistence | In-memory maps hydrated/flushed to local JSON files |
| Streaming | Server-Sent Events from backend to browser |
| Tooling | npm workspaces, tsx, tsup, ESLint |

## Feature Matrix

| Feature | Status | Notes |
| --- | --- | --- |
| Visual suite/test/hook builder | Implemented | Tree model, nested suites, lifecycle hooks |
| Command palette and config panel | Implemented | Query, action, assertion, utility commands |
| Cypress code generation | Implemented | Used by copy/export and Cypress runner |
| Playwright code generation | Implemented | Export/code preview path only |
| Flow import/export | Implemented | JSON import supports v1-to-v2 migration |
| Saved flows API | Implemented | Create/list/get/update/delete backend routes |
| Live execution updates | Implemented | SSE stream for logs, status, step results |
| Execution history | Implemented | Backend persisted run summaries |
| Flaky-step analytics | Implemented | Simple recent-history heuristic |
| Authentication | Not implemented | Documented production extension point |
| Cache layer | Not implemented | Current state is in-process plus local JSON |

## Repository Layout

```text
.
|-- README.md
|-- ARCHITECTURE.md
|-- DECISIONS.md
|-- TECH_DEBT.md
|-- DEPLOYMENT.md
|-- INTERVIEW_GUIDE.md
|-- docs/
|   `-- diagrams/
|-- frontend/
|   `-- src/
|       |-- app/
|       |-- core/
|       |-- features/
|       |-- hooks/
|       `-- services/
`-- backend/
    `-- src/
        |-- routes/
        |-- db/
        |-- queue/
        |-- runner/
        `-- analytics/
```

## Quick Start

Requirements: Node.js 18+

```bash
npm run install:all
npm run dev
```

Open:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend health | `http://localhost:3001/health` |

Run modes:

```bash
npm run dev:mock
npm run dev:cypress
```

`dev:mock` uses simulated execution. `dev:cypress` sets `RUNNER=cypress` and requires Cypress to be installed in `backend/`.

## System Overview

![Request flow](docs/diagrams/request-flow.png)

| Flow | Summary |
| --- | --- |
| Build | User edits a flow tree in React; Zustand stores the current flow and undo/redo history |
| Validate | Zod checks shape; command registry checks command args and chaining |
| Generate | `generate(flow)` dispatches to Cypress or Playwright emitter |
| Save | Frontend posts flow JSON to `/api/flows`; backend persists through `FlowStore` |
| Run | Frontend posts flow plus generated `specCode` to `/api/executions` |
| Stream | Backend queue consumes runner events and broadcasts SSE updates |
| Analyze | Analytics scans execution history for stats and flaky-step candidates |

## API Overview

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Service health check |
| `POST /api/flows` | Save a flow snapshot |
| `GET /api/flows` | List saved flow summaries |
| `GET /api/flows/:id` | Load one saved flow |
| `PUT /api/flows/:id` | Update saved flow |
| `DELETE /api/flows/:id` | Delete saved flow |
| `POST /api/executions` | Queue execution |
| `GET /api/executions` | List execution summaries |
| `GET /api/executions/:id` | Load full execution |
| `DELETE /api/executions/:id` | Cancel queued/running execution |
| `GET /api/executions/:id/events` | SSE stream for live run updates |
| `GET /api/analytics/stats` | Aggregate execution stats |
| `GET /api/analytics/flaky` | Flaky-step candidates |

## Production Readiness Snapshot

| Concern | Current state | Production direction |
| --- | --- | --- |
| Persistence | Local JSON files | SQLite/Postgres with migrations and indexes |
| Queue | In-process FIFO, concurrency 1 | Durable queue plus isolated worker pool |
| Auth | None | OIDC/session auth, RBAC, audit logs |
| Execution safety | Cypress runs generated code | Sandboxed workers, server-side codegen, allowlisted targets |
| Observability | UI logs/history | Structured logs, metrics, traces, artifacts |
| Tests | Not present in repo | Unit, integration, codegen snapshots, queue tests |
| Caching | None | Cache read-heavy summaries and analytics windows when needed |

## Documentation

| Document | Purpose |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System analysis, request/data/async/auth/cache flows |
| [DECISIONS.md](DECISIONS.md) | Architectural decisions and tradeoffs |
| [TECH_DEBT.md](TECH_DEBT.md) | Bottlenecks, weak abstractions, missing production practices |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Local and production deployment model |
| [INTERVIEW_GUIDE.md](INTERVIEW_GUIDE.md) | System design and senior-engineer talking points |
| [docs/diagrams](docs/diagrams) | PNG, SVG, and Excalidraw diagram sources |

## Future Improvements

| Priority | Improvement |
| --- | --- |
| P0 | Add automated tests for validation, codegen, migration, queue, stores, analytics |
| P0 | Replace tracked runtime JSON with generated local state |
| P1 | Share flow schema/types between frontend and backend |
| P1 | Add durable persistence and queue workers |
| P1 | Harden execution boundary and auth |
| P2 | Add Playwright runner support |
| P2 | Add run artifacts, screenshots, traces, and retention policies |

## Interview Angle

This project is best discussed as an intermediate-representation problem: a visual editor produces a typed test model, and the rest of the system treats that model as the contract for validation, generation, execution, storage, and analytics.
