# Contributing

## Setup

```bash
npm run install:all
npm run dev
```

## Architecture Rules

| Rule | Reason |
| --- | --- |
| Keep `frontend/src/core` free of React/UI imports | Core owns portable model, validation, registry, codegen |
| Treat `Flow` v2 as the source contract | UI, codegen, persistence, execution, and analytics depend on it |
| Add command behavior through the registry first | Keeps defaults, validation, and chain semantics centralized |
| Keep backend routes thin | Route handlers should delegate to stores, queue, runners, analytics |
| Do not commit local runtime histories | `backend/data/*.json` is generated development state |

## Adding A Command

1. Register metadata/default args/validation in `frontend/src/core/registry/builtinCommands.ts`.
2. Add or update Cypress emission in `frontend/src/core/codegen/emitters/cypressEmitter.ts`.
3. Add or update Playwright emission in `frontend/src/core/codegen/emitters/playwrightEmitter.ts`.
4. Add UI field support only if the existing generic argument editors are not enough.
5. Add tests before expanding command coverage in production work.

## Verification

```bash
npm run build -w frontend
npm run lint -w frontend
npm run build -w backend
```

The repository currently lacks automated tests. Changes to flow schema, validation, codegen, or queue behavior should add focused tests as part of production hardening.
