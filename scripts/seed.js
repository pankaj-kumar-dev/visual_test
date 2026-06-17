#!/usr/bin/env node
/**
 * Seed script — populates demo data for screenshots.
 * Saves both example flows and runs several mock executions to populate
 * History and Analytics panels.
 *
 * Usage:
 *   node scripts/seed.js
 *   BACKEND=https://vtb-backend.onrender.com node scripts/seed.js
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BACKEND ?? 'http://localhost:3001';

const loginFlow  = JSON.parse(readFileSync(join(__dirname, '../frontend/examples/login-flow.json'), 'utf8'));
const tasksFlow  = JSON.parse(readFileSync(join(__dirname, '../frontend/examples/taskflow-tasks.json'), 'utf8'));

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function waitForDone(id, timeout = 30000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/api/executions/${id}`);
    const ex = await res.json();
    if (['passed', 'failed', 'cancelled'].includes(ex.status)) return ex;
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error(`Execution ${id} timed out`);
}

async function run(flow) {
  const ex = await post('/api/executions', { ...flow, specCode: '// mock' });
  console.log(`  queued ${ex.id} (${flow.name})`);
  const done = await waitForDone(ex.id);
  console.log(`  done   ${done.id} → ${done.status} (${done.durationMs}ms)`);
  return done;
}

async function main() {
  console.log(`Seeding ${BASE} …\n`);

  // Save both flows
  console.log('Saving flows…');
  const sf1 = await post('/api/flows', { flow: loginFlow, description: 'Login smoke tests' });
  console.log(`  saved flow: ${sf1.name} (${sf1.id})`);
  const sf2 = await post('/api/flows', { flow: tasksFlow, description: 'Task creation flow' });
  console.log(`  saved flow: ${sf2.name} (${sf2.id})`);

  // Run each flow several times to populate History + Analytics
  console.log('\nRunning executions…');
  for (let i = 0; i < 3; i++) await run(loginFlow);
  for (let i = 0; i < 3; i++) await run(tasksFlow);
  // One more of each to get flaky detection data (need ≥2 runs per step)
  await run(loginFlow);
  await run(tasksFlow);

  console.log('\nSeed complete. Open the app and check History + Analytics tabs.');
}

main().catch((err) => { console.error(err); process.exit(1); });
