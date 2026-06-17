import { Router } from 'express';
import { z } from 'zod';
import { enqueue, cancel, subscribeSse } from '../queue/executionQueue.ts';
import { executionStore } from '../db/executionStore.ts';

export const executionsRouter = Router();

// ─── POST /executions — queue a new execution ─────────────────────────────────

// Loose v2 schema — passthrough allows extra fields without strict validation
const FlowBodySchema = z.object({
  version:      z.string(),
  name:         z.string(),
  baseUrl:      z.string().default(''),
  target:       z.enum(['cypress', 'playwright']).default('cypress'),
  rootSuiteId:  z.string(),
  nodes:        z.record(z.string(), z.unknown()),
  environments:      z.array(z.object({ name: z.string(), baseUrl: z.string() })).optional(),
  activeEnvironment: z.string().nullable().optional(),
}).passthrough();

executionsRouter.post('/', (req, res) => {
  const parsed = FlowBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid flow', details: parsed.error.issues });
    return;
  }

  const execution = enqueue(parsed.data as unknown as Parameters<typeof enqueue>[0]);
  res.status(201).json(execution);
});

// ─── GET /executions — list all ───────────────────────────────────────────────

executionsRouter.get('/', (_req, res) => {
  const executions = executionStore.findAll().map((e) => ({
    id: e.id,
    flowName: e.flowName,
    status: e.status,
    createdAt: e.createdAt,
    startedAt: e.startedAt,
    completedAt: e.completedAt,
    durationMs: e.durationMs,
    stepCount: e.stepResults.length,
    errorMessage: e.errorMessage,
  }));
  res.json(executions);
});

// ─── GET /executions/:id — get full execution ─────────────────────────────────

executionsRouter.get('/:id', (req, res) => {
  const ex = executionStore.findById(req.params['id'] ?? '');
  if (!ex) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(ex);
});

// ─── DELETE /executions/:id — cancel ─────────────────────────────────────────

executionsRouter.delete('/:id', (req, res) => {
  const ok = cancel(req.params['id'] ?? '');
  if (!ok) { res.status(400).json({ error: 'Cannot cancel execution in current state' }); return; }
  res.json({ cancelled: true });
});

// ─── GET /executions/:id/events — SSE live stream ────────────────────────────

executionsRouter.get('/:id/events', (req, res) => {
  const id = req.params['id'] ?? '';
  const ex = executionStore.findById(id);

  if (!ex) { res.status(404).json({ error: 'Not found' }); return; }

  // If already done, return the final state immediately
  if (ex.status === 'passed' || ex.status === 'failed' || ex.status === 'cancelled') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`data: ${JSON.stringify({ event: 'complete', data: ex })}\n\n`);
    res.end();
    return;
  }

  // Open SSE stream for live updates
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  res.write(': connected\n\n'); // initial comment to establish connection

  // Send buffered logs/steps for late joiners
  for (const entry of ex.logs) {
    res.write(`data: ${JSON.stringify({ event: 'log', data: entry })}\n\n`);
  }
  for (const step of ex.stepResults) {
    res.write(`data: ${JSON.stringify({ event: 'step-result', data: step })}\n\n`);
  }

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  const unsubscribe = subscribeSse(id, (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    if (payload.event === 'complete') {
      clearInterval(heartbeat);
      res.end();
      unsubscribe();
    }
  });

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});
