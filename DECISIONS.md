# Architecture Decisions

## Decision Record

| Decision | Chosen approach | Why | Tradeoff |
| --- | --- | --- | --- |
| Intermediate representation | Versioned flow tree | Keeps UI, validation, codegen, execution, and analytics on one contract | Requires careful schema evolution |
| Frontend state | Zustand store with bounded undo/redo | Simple domain mutations, low boilerplate | Snapshot history can be memory-heavy for large flows |
| Command system | Central registry | One place for command metadata, defaults, validation, chain rules | Emitters must still support every registered command |
| Code generation | Framework-specific emitters | Keeps Cypress/Playwright differences isolated | No shared AST layer beyond flow model |
| Execution updates | SSE | Simple one-way stream for logs/status/results | Less suitable for bidirectional collaboration |
| Queue | In-process FIFO, concurrency 1 | Predictable MVP execution and fewer Cypress conflicts | Not horizontally scalable or durable |
| Persistence | JSON-backed repositories | Zero external setup; easy local demo | No transactions, indexes, or concurrent safety |
| Runner integration | Async generator events | Uniform contract for mock and real runners | Needs stronger lifecycle/error taxonomy |
| Cypress execution | Child process worker | Isolates Cypress programmatic API state | Still shares host and dependency boundary |

## Why These Decisions Fit The Current Stage

| Goal | Supporting decisions |
| --- | --- |
| Build a credible local prototype | JSON persistence, mock runner, npm workspaces |
| Show architecture maturity | IR model, registry, emitters, runner/store interfaces |
| Keep UX responsive | Local state, live code preview, SSE run updates |
| Enable future scaling | Seams around stores, runners, codegen, analytics |

## Where The Decisions Break At Scale

| Decision | Breaking point | v2 direction |
| --- | --- | --- |
| JSON persistence | Concurrent users or large run history | SQL database with migrations |
| In-process queue | Multiple API instances or long jobs | Durable queue and worker fleet |
| Process-local SSE registry | Horizontal API replicas | Pub/sub fanout or event stream |
| Frontend-generated `specCode` | Untrusted clients | Server-side generation from validated flow |
| No auth | Shared environments | OIDC/session auth and ownership model |
| Full history scans | High execution volume | Indexed queries and rollups |

## Deferred Decisions

| Topic | Current stance | Decision needed |
| --- | --- | --- |
| Playwright execution | Codegen only | Add runner or mark export-only |
| Flow ownership | None | User/team model |
| Artifacts | Not stored | Screenshots/videos/traces retention |
| CI integration | None | GitHub Actions or external runner API |
| Import from existing tests | Not present | Parser or explicit non-goal |
