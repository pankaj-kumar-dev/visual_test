# Architecture

## High-Level Understanding

Visual Test Builder is a full-stack E2E test authoring and execution system. The frontend owns the test authoring domain model; the backend owns saved flows, execution orchestration, live event streaming, and analytics.

![System architecture](docs/diagrams/architecture.png)

## Module Responsibilities

| Module | Path | Responsibility |
| --- | --- | --- |
| App shell | `frontend/src/app` | Main editor layout and top-level panel composition |
| UI features | `frontend/src/features` | Canvas, palette, config, code, run, history, analytics panels |
| Flow model | `frontend/src/core/model` | Zod schemas, factories, migration support |
| State | `frontend/src/core/state` | Zustand flow store, selection, undo/redo, mutation actions |
| Registry | `frontend/src/core/registry` | Command definitions, defaults, chain compatibility, validation hooks |
| Codegen | `frontend/src/core/codegen` | Cypress and Playwright emitters |
| Adapters | `frontend/src/core/adapters` | Framework-specific selector translations |
| API clients | `frontend/src/services` | Flow, execution, analytics HTTP clients |
| API routes | `backend/src/routes` | Express route layer |
| Stores | `backend/src/db` | JSON-backed flow and execution repositories |
| Queue | `backend/src/queue` | FIFO execution queue, SSE subscriber registry |
| Runners | `backend/src/runner` | Mock and Cypress runner implementations |
| Analytics | `backend/src/analytics` | Pass-rate, duration, flaky-step calculations |

## Request Lifecycle

![Request lifecycle](docs/diagrams/request-flow.png)

| Step | Component | Detail |
| --- | --- | --- |
| 1 | `ExecutionPanel` | User clicks `Run Test` |
| 2 | `executionApi.run()` | Generates `specCode` from current flow |
| 3 | Express route | `POST /api/executions` validates a loose v2 payload |
| 4 | Queue | `enqueue()` snapshots flow, resolves environment, creates execution |
| 5 | Runner | Mock or Cypress runner emits normalized events |
| 6 | Store | Execution status, logs, step results are updated |
| 7 | SSE | Browser receives live status/log/step/complete payloads |

## Data Flow

| Data | Producer | Consumer | Notes |
| --- | --- | --- | --- |
| `Flow` | Frontend editor | Validation, codegen, save/run APIs | Versioned `2.0` tree |
| `specCode` | Frontend codegen | Backend Cypress runner | Generated in frontend today |
| `Execution` | Backend queue | History, analytics, SSE | Contains flow snapshot, logs, results |
| `FlakyStat` | Analytics engine | Analytics panel | Based on recent execution history |

## DB Interaction Flow

![DB flow](docs/diagrams/db-flow.png)

| Operation | Store | Current behavior | Production concern |
| --- | --- | --- | --- |
| Save flow | `FlowStore` | In-memory map then JSON flush | No transactions or write conflict handling |
| Update flow | `FlowStore` | Replace by ID, preserve timestamps | No optimistic concurrency |
| Create execution | `ExecutionStore` | Persist queued execution immediately | Large history grows JSON file |
| Append logs/results | `ExecutionStore` | Mutates in memory; not flushed on every append | Crash can lose latest run details |
| Analytics | `ExecutionStore.findAll()` | Scans in-memory execution list | Needs DB aggregation/indexing at scale |

## External Integrations

| Integration | Direction | Purpose | Risk |
| --- | --- | --- | --- |
| Cypress programmatic API | Backend to local runner | Real browser execution | Executes generated code; needs sandboxing |
| Browser clipboard | Frontend to browser API | Copy generated code | Permission/browser variance |
| Blob downloads | Frontend to browser API | Export flow JSON | Local-only UX |
| Server-Sent Events | Backend to frontend | Live execution updates | Connection lifecycle and CORS hardening |

## Queue, Async, Event Architecture

![Async flow](docs/diagrams/async-flow.png)

| Piece | Current implementation |
| --- | --- |
| Queue | In-memory `pending[]` IDs |
| Concurrency | Hard-coded `1` |
| Worker trigger | `EventEmitter` drain event |
| Runner contract | Async generator of `RunnerEvent` |
| Subscriber registry | `Map<executionId, Set<callback>>` |
| Delivery | SSE payloads: `log`, `step-result`, `status`, `complete` |

## Authentication Flow

![Auth flow](docs/diagrams/auth-flow.png)

Authentication is not implemented. The only boundary is CORS configured with `FRONTEND_ORIGIN`, while SSE currently writes `Access-Control-Allow-Origin: *`.

| Current | Production direction |
| --- | --- |
| No user/session model | OIDC or session auth |
| No ownership checks | Flow/run ownership and RBAC |
| No audit log | Audit saved-flow changes and executions |
| Runner available to any API caller | Authenticated and authorized execution requests |

## Caching Strategy

![Cache flow](docs/diagrams/cache-flow.png)

No cache layer exists. Current state is in-process maps plus JSON flushes. This is acceptable for local MVP use because data volume is small and all reads are local.

| Candidate cache | When it matters |
| --- | --- |
| Execution summary list | Large run history |
| Analytics windows | Expensive history scans |
| Generated code | Large flows or repeated previews |
| Flow summaries | Multi-user dashboard |

## Scalability Considerations

![Scaling direction](docs/diagrams/scaling.png)

| Constraint | Current design | Scale direction |
| --- | --- | --- |
| API process state | Stores and queue are in memory | Stateless API replicas with DB and durable queue |
| Persistence | JSON files | SQLite/Postgres |
| Runner isolation | Same backend host spawns Cypress worker | Dedicated worker pool/containers |
| Event delivery | In-process SSE registry | Pub/sub or DB-backed event stream |
| Analytics | Full in-memory scan | DB materialized views or rollups |

## Tight Coupling And Weak Abstractions

| Area | Coupling | Impact |
| --- | --- | --- |
| Frontend/backend flow types | Similar but not shared | Drift risk |
| Execution contract | Backend trusts frontend `specCode` | Security and correctness risk |
| JSON stores | Routes depend on singleton stores | Harder to test and scale |
| SSE registry | Process-local callbacks | Cannot scale horizontally |
| Analytics | Reads all execution records | Not ready for high-volume history |

## Reusable Engineering Components

| Component | Reuse value |
| --- | --- |
| Command registry | Add commands consistently across UI/validation/codegen |
| Flow schema | Versioned contract for import/export/migration |
| Codegen emitters | Adapter pattern for target frameworks |
| Runner interface | Swappable execution engines |
| Store interfaces | Path toward SQL-backed repositories |
| Analytics engine | Pure calculations over execution records |

## Missing Production Practices

| Practice | Status |
| --- | --- |
| Automated tests | Missing |
| Auth/RBAC | Missing |
| Durable queue | Missing |
| Database migrations | Missing |
| Structured logging/metrics/tracing | Missing |
| Artifact retention | Missing |
| Runner sandboxing | Missing |
| CI/CD | Missing |
| API rate limiting | Missing |
| Error taxonomy | Minimal |
