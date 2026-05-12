import express from 'express';
import cors from 'cors';
import { executionsRouter } from './routes/executions.ts';
import { flowsRouter } from './routes/flows.ts';
import { analyticsRouter } from './routes/analytics.ts';

const app = express();
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/executions', executionsRouter);
app.use('/api/flows', flowsRouter);
app.use('/api/analytics', analyticsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Accepting requests from ${FRONTEND_ORIGIN}`);
});
