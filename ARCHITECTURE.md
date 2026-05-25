# Architecture

## High-Level Overview

Visual Test Builder is a full-stack E2E test authoring and execution system. The frontend owns the test authoring domain: schema, validation, command registry, and code generation. The backend owns saved flows, execution orchestration, live event streaming, and analytics.

```mermaid
graph TB
    subgraph Browser["Browser — React 19 · Vite · Zustand"]
        Editor["Flow Editor\n(Canvas · Palette · Config)"]
        Store["Flow Store (Zustand)\nundo/redo history"]
        Codegen["Code Generator\n(Cypress · Playwright)"]
        RunPanel["Run Panel\n(SSE consumer)"]
        AnalyticsPanel["Analytics Panel"]
    end

    subgraph Server["Server — Express 5 · Node.js · TypeScript"]
        API["REST API\n/flows  /executions  /analytics"]
        Queue["FIFO Queue\n(concurrency = 1)"]
        SSEReg["SSE Registry\nMap<id, Set<callback>>"]
        FlowStore["FlowStore\n(in-memory + JSON)"]
        ExecStore["ExecutionStore\n(in-memory + JSON)"]
        AnalyticsEng["Analytics Engine\npass-rate · p95 · flaky"]
    end

    Editor --> Store
    Store --> Codegen
    Store -->|"POST /api/flows"| API
    Store -->|"POST /api/executions"| API
    AnalyticsPanel -->|"GET /api/analytics"| API
    RunPanel -.->|"SSE stream"| SSEReg
    API --> Queue
    API --> FlowStore
    API --> AnalyticsEng
    Queue --> SSEReg
    Queue --> ExecStore
    AnalyticsEng --> ExecStore
    SSEReg -.->|"log · step-result · complete"| RunPanel
```

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
| Runners | `backend/src/runner` | IRunner interface, MockRunner, CypressRunner |
| Analytics | `backend/src/analytics` | Pass-rate, duration, flaky-step calculations |

## Request Lifecycle

```mermaid
sequenceDiagram
    participant UI as Browser
    participant API as Express API
    participant Q as Execution Queue
    participant R as Runner (Mock/Cypress)
    participant SSE as SSE Registry

    UI->>API: POST /api/executions {flow, specCode}
    API->>Q: enqueue(flow) — snapshots, resolves env
    API-->>UI: 201 {id, status: "queued"}
    UI->>SSE: GET /api/executions/:id/events
    Note over SSE,UI: late-join: buffered logs + steps replayed
    Q->>R: runner.run(flow) — async generator
    loop RunnerEvent stream
        R-->>Q: log | step-start | step-pass/fail | run-pass/fail
        Q->>SSE: broadcast(payload)
        SSE-->>UI: SSE: log | step-result | status | complete
    end
```

| Step | Component | Detail |
| --- | --- | --- |
| 1 | `ExecutionPanel` | User clicks `Run Test` |
| 2 | `executionApi.run()` | Generates `specCode` from current flow |
| 3 | Express route | `POST /api/executions` validates a loose v2 payload via Zod |
| 4 | Queue | `enqueue()` snapshots flow, resolves active environment, creates execution record |
| 5 | Runner | Mock or Cypress runner emits normalized `RunnerEvent` stream |
| 6 | Store | Execution status, logs, step results updated in memory |
| 7 | SSE | Browser receives live status/log/step-result/complete payloads |

## Data Flow

| Data | Producer | Consumer | Notes |
| --- | --- | --- | --- |
| `Flow` | Frontend editor | Validation, codegen, save/run APIs | Versioned `2.0` tree |
| `specCode` | Frontend codegen | Backend Cypress runner | Generated client-side today; see [DECISIONS.md](DECISIONS.md) |
| `Execution` | Backend queue | History, analytics, SSE | Contains flow snapshot, logs, step results |
| `FlakyStat` | Analytics engine | Analytics panel | Sliding window over recent execution history |

## DB Interaction Flow

```mermaid
flowchart LR
    W["Route / Queue\n(writers)"]
    M[("In-Memory Map\nMap<id, T>")]
    J[/"JSON file\n(backend/data/*.json)"/]
    R["Routes / Analytics\n(readers)"]

    W -->|"create / updateStatus"| M
    M -->|"flush on every write"| J
    W -. "appendLog / appendStepResult\n(mutate in-place, no flush)" .-> M
    M -->|"findAll / findById"| R
    J -->|"hydrate on server start"| M
```

| Operation | Store | Current behavior | Production concern |
| --- | --- | --- | --- |
| Save flow | `FlowStore` | In-memory map then JSON flush | No transactions or write-conflict handling |
| Update flow | `FlowStore` | Replace by ID, preserve timestamps | No optimistic concurrency |
| Create execution | `ExecutionStore` | Persist queued execution immediately | Large history grows file unbounded |
| Append logs/results | `ExecutionStore` | Mutates in memory; not flushed | Crash loses latest run details |
| Analytics | `ExecutionStore.findAll()` | Scans full in-memory list | Needs DB aggregation/indexing at scale |

## External Integrations

| Integration | Direction | Purpose | Risk |
| --- | --- | --- | --- |
| Cypress programmatic API | Backend → local runner | Real browser execution via child process | Executes generated code; needs sandboxing |
| Browser clipboard | Frontend → browser API | Copy generated code | Browser permission variance |
| Blob downloads | Frontend → browser API | Export flow JSON | Local-only UX |
| Server-Sent Events | Backend → frontend | Live execution updates | Connection lifecycle and CORS hardening needed |

## Queue and Async Architecture

```mermaid
stateDiagram-v2
    [*] --> queued : enqueue()
    queued --> running : processNext()
    queued --> cancelled : cancel()
    running --> passed : run-pass event
    running --> failed : run-fail / exception
    running --> cancelled : cancel() mid-run
    passed --> [*]
    failed --> [*]
    cancelled --> [*]
```

| Piece | Current implementation |
| --- | --- |
| Queue | In-memory `pending[]` IDs |
| Concurrency | Hard-coded `1` |
| Worker trigger | Node.js `EventEmitter` drain event |
| Runner contract | Async generator of `RunnerEvent` |
| Subscriber registry | `Map<executionId, Set<callback>>` |
| SSE payloads | `log`, `step-result`, `status`, `complete` |

## Authentication

Authentication is not implemented. The only boundary is CORS configured with `FRONTEND_ORIGIN`. The SSE endpoint currently writes `Access-Control-Allow-Origin: *`.

| Current | Production direction |
| --- | --- |
| No user or session model | OIDC or session-based auth |
| No ownership checks | Flow and run ownership + RBAC |
| No audit log | Audit saved-flow changes and executions |
| Runner available to any caller | Authenticated and authorized execution requests |

## Caching

No cache layer exists. Current state is in-process maps plus JSON flushes. This is acceptable for local MVP use because data volume is small and all reads are process-local.

| Candidate cache | When it matters |
| --- | --- |
| Execution summary list | Large run history |
| Analytics windows | Expensive full-history scans |
| Generated code | Large flows or repeated preview renders |
| Flow summaries | Multi-user dashboard |

## Scalability

```mermaid
graph LR
    subgraph Now["Current (MVP)"]
        A["Single process\n(API + Queue + SSE)"]
        B[("JSON files")]
        C["CypressRunner\n(child process, same host)"]
        A --- B
        A --- C
    end

    subgraph V2["Production direction"]
        D["Stateless API\nreplicas"]
        E[("Postgres\n+ migrations")]
        F["Durable Queue\n(Redis/BullMQ · SQS)"]
        G["Worker containers\n(isolated browsers)"]
        H["Pub/Sub\n(SSE fanout)"]
        D --- E
        D --- F
        F --- G
        D --- H
    end

    Now -->|"IStore interface\nIRunner interface\nroutes unchanged"| V2
```

| Constraint | Current | Scale direction |
| --- | --- | --- |
| API process state | Stores and queue are in-memory | Stateless API replicas with DB + durable queue |
| Persistence | JSON files | SQLite/Postgres |
| Runner isolation | Backend host spawns Cypress child process | Dedicated worker pool or containers |
| Event delivery | In-process SSE registry | Pub/sub or DB-backed event stream |
| Analytics | Full in-memory scan | DB materialized views or rollups |

## Tight Coupling and Weak Abstractions

| Area | Coupling | Impact |
| --- | --- | --- |
| Frontend/backend flow types | Similar but not shared | Schema drift risk between validation layers |
| Execution contract | Backend trusts frontend `specCode` | Security and correctness risk in shared environments |
| Store singletons | Routes and queue import singletons directly | Harder to test with injected fakes |
| SSE registry | Process-local callbacks | Cannot fan out across horizontal API replicas |
| Analytics | Reads all execution records | Not ready for high-volume history |

## Reusable Engineering Components

| Component | Reuse value |
| --- | --- |
| Command registry | Consistent command metadata, defaults, chain semantics across UI/validation/codegen |
| Flow schema | Versioned contract for import/export/migration |
| Codegen emitters | Adapter pattern for target frameworks |
| `IRunner` interface | Swappable execution engines (mock, Cypress, Playwright) |
| `IFlowStore` / `IExecutionStore` | Migration seams toward SQL-backed repositories |
| Analytics engine | Pure calculations; no side effects |

## Missing Production Practices

| Practice | Status |
| --- | --- |
| Automated tests | Missing |
| Auth/RBAC | Missing |
| Durable queue | Missing |
| Database migrations | Missing |
| Structured logging/metrics/tracing | Missing |
| Run artifact retention | Missing |
| Runner sandboxing | Missing |
| CI/CD pipeline | Missing |
| API rate limiting | Missing |
| OpenAPI spec | Missing |
