import { Router } from 'express';
import { executionStore } from '../db/executionStore.ts';
import { detectFlaky, computeStats } from '../analytics/analyticsEngine.ts';

export const analyticsRouter = Router();

// GET /analytics/stats — overall execution statistics
analyticsRouter.get('/stats', (_req, res) => {
  const executions = executionStore.findAll();
  res.json(computeStats(executions));
});

// GET /analytics/flaky — flaky step detection across all executions
analyticsRouter.get('/flaky', (_req, res) => {
  const executions = executionStore.findAll();
  res.json(detectFlaky(executions));
});

// GET /analytics/flaky?flowName=X — filtered by flow name
analyticsRouter.get('/flaky/:flowName', (req, res) => {
  const name = decodeURIComponent(req.params['flowName'] ?? '');
  const executions = executionStore.findAll().filter(
    (e) => e.flowName === name,
  );
  res.json(detectFlaky(executions));
});
