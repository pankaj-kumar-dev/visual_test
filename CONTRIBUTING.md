# Contributing

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Architecture

```
frontend/src/
├── core/          # Zero React. Pure JS: model, state, transformer, codegen, parser.
├── features/      # React components: palette, canvas, config, codegen UI.
├── app/           # Root layout + DndContext.
└── utils/         # id.js (crypto.randomUUID)
```

**Layer rule:** `core/` must never import from React or any UI library.
Verify with: `grep -r "from 'react'" frontend/src/core/` — must return nothing.

## Adding a new node type

1. Add entry to `NODE_TYPES` in `core/model/nodeSchema.js` with `label`, `icon`, `defaultParams`.
2. Add emitter: `core/codegen/emitters/{type}.js` — exports `emit{Type}(node)`.
3. Register emitter in `core/codegen/generate.js` EMITTERS map.
4. Add matcher: `core/parser/matchers/{type}.js` — exports `match{Type}(line)`.
5. Register matcher in `core/parser/parse.js` MATCHERS array.
6. Add field component: `features/config/fields/{Type}Fields.jsx`.
7. Register in `features/config/ConfigPanel.jsx` FIELDS map.
8. Round-trip test: `generate(flow)` → `parse(code)` → params must deep-equal originals.

## Key invariants

- Flow is always a single linear chain from `rootNodeId` (MVP).
- `nodes` and `edges` are `Record<id, object>` — O(1) lookup, never arrays.
- Every codegen emitter must have a matching parser matcher (reversibility).
- `condition: 'success'` on all edges for MVP. Branching comes via new edge types later.

## Pull requests

- One PR per feature/fix.
- Include a round-trip test for any codegen change.
- Run `npm run lint` before submitting.
