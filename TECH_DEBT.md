# Technical Debt And Production Gaps

## Executive Summary

The codebase has a strong MVP architecture: a typed flow model, command registry, framework emitters, runner abstraction, and backend execution pipeline. Production hardening is still needed around durability, security, testing, and horizontal scale.

## Bottlenecks

| Bottleneck | Evidence | Impact | Fix |
| --- | --- | --- | --- |
| Single execution worker | `CONCURRENCY = 1` | Long tests block all later runs | Durable queue and worker pool |
| JSON-file stores | `backend/src/db/*.ts` | No transactions, slow growth, write conflicts | SQLite/Postgres |
| In-process SSE registry | `Map<executionId, Set<callback>>` | Cannot fan out across API replicas | Pub/sub or event stream |
| Full analytics scan | `executionStore.findAll()` | Cost grows with run history | Indexed queries/rollups |
| Frontend-generated execution code | `executionApi.run()` sends `specCode` | Trust boundary issue | Server-side generation from validated flow |

## Tight Coupling

| Coupling | Why it matters |
| --- | --- |
| Frontend and backend define similar flow concepts separately | Type/schema drift can cause accepted backend payloads that frontend would reject |
| Backend runner depends on frontend-provided code | Backend cannot independently prove `specCode` matches flow |
| Store singletons are imported directly into routes/queue | Harder to test with injected fakes |
| Analytics depends on execution storage shape | Storage change may ripple into analytics |

## Weak Abstractions

| Area | Current weakness | Stronger boundary |
| --- | --- | --- |
| Persistence | Best-effort JSON flush with swallowed errors | Repository with explicit errors and transaction semantics |
| Runner lifecycle | Normalized events, but limited cancellation/control | Job state machine with timeouts, retries, artifacts |
| Validation | Frontend rich validation, backend loose validation | Shared schema package |
| Observability | UI logs only | Structured logs, metrics, traces, run artifacts |
| Security | CORS only | Auth, RBAC, sandboxed execution, target allowlist |

## Missing Production-Grade Practices

| Category | Missing |
| --- | --- |
| Testing | Unit tests, integration tests, codegen snapshots, runner tests, API tests |
| CI/CD | Lint/build/test workflow, artifact upload, dependency audit |
| Data | Migrations, schema versioning policy, retention, backups |
| Security | Auth, authorization, rate limiting, input hardening, execution sandbox |
| Reliability | Durable queue, retry policy, job timeout, crash recovery |
| Observability | Structured logs, metrics, traces, alerting |
| API | OpenAPI spec, consistent error model, pagination |
| Frontend | Error boundaries, loading states audit, accessibility pass |

## Cleanup Completed For Showcase

| Cleanup | Rationale |
| --- | --- |
| Root README rewritten | Replaces stale v1/tutorial content with architecture landing page |
| Top-level architecture docs added | Makes the repo scan-friendly for recruiters and senior reviewers |
| Diagrams added under `docs/diagrams` | Gives immediate system-design signal |
| Runtime data ignored | Prevents local execution history from dominating the repo |

## Recommended Next Sprint

| Priority | Task | Outcome |
| --- | --- | --- |
| P0 | Add codegen snapshot tests | Protect generated Cypress/Playwright output |
| P0 | Add validation tests | Protect command-chain and schema behavior |
| P0 | Share flow schema | Remove frontend/backend drift |
| P1 | Replace JSON store | Improve durability and queryability |
| P1 | Add durable queue | Make runner work crash-safe |
| P1 | Add auth and sandboxing | Make execution boundary safe |
