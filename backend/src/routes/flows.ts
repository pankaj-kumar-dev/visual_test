import { Router } from 'express';
import { z } from 'zod';
import { flowStore } from '../db/flowStore.ts';

export const flowsRouter = Router();

const FlowBody = z.object({
  flow: z.record(z.string(), z.unknown()),
  description: z.string().optional(),
});

// POST /flows — save or create
flowsRouter.post('/', (req, res) => {
  const parsed = FlowBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid body' });
    return;
  }
  const saved = flowStore.save(parsed.data.flow as unknown as Parameters<typeof flowStore.save>[0], parsed.data.description);
  res.status(201).json(saved);
});

// GET /flows — list all
flowsRouter.get('/', (_req, res) => {
  const flows = flowStore.findAll().map(({ id, name, description, createdAt, updatedAt }) => ({
    id, name, description, createdAt, updatedAt,
  }));
  res.json(flows);
});

// GET /flows/:id — get full saved flow
flowsRouter.get('/:id', (req, res) => {
  const f = flowStore.findById(req.params['id'] ?? '');
  if (!f) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(f);
});

// PUT /flows/:id — update existing
flowsRouter.put('/:id', (req, res) => {
  const parsed = FlowBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Invalid body' }); return; }
  const updated = flowStore.update(
    req.params['id'] ?? '',
    parsed.data.flow as unknown as Parameters<typeof flowStore.save>[0],
    parsed.data.description,
  );
  if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(updated);
});

// DELETE /flows/:id
flowsRouter.delete('/:id', (req, res) => {
  const ok = flowStore.delete(req.params['id'] ?? '');
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ deleted: true });
});
