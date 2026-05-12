import { spawn }                                                        from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync }                              from 'node:fs';
import { join, resolve }                                                  from 'node:path';
import { randomUUID }                                                     from 'node:crypto';
import type { IRunner }                                                   from './interface.ts';
import type { IncomingFlow, RunnerEvent }                                 from '../types.ts';

// ─── Temp base ────────────────────────────────────────────────────────────────
// Must be inside the backend directory so that Node's CJS module resolution
// can walk up and find backend/node_modules/cypress.
// os.tmpdir() is NOT used — on Windows it includes the username which may have spaces.

const TMP_BASE = resolve(process.cwd(), '.vtb-tmp');

// ─── CJS worker script ────────────────────────────────────────────────────────
// Written to disk as .cjs and executed by the same Node binary (process.execPath).
// CommonJS because cypress programmatic API is CJS.
// Separate process because cypress.run() is stateful and must not be called
// more than once per process.

const WORKER = `
'use strict';
const cypress = require('cypress');
const opts    = JSON.parse(process.argv[2]);
cypress.run(opts)
  .then(result => {
    process.stdout.write(JSON.stringify(result));
    process.exitCode = 0;
  })
  .catch(err => {
    process.stderr.write(String((err && err.message) || err));
    process.exitCode = 1;
  });
`;

// ─── Cypress result shapes (partial) ─────────────────────────────────────────

interface CyTest {
  title:        string[];
  state:        'passed' | 'failed' | 'pending';
  duration:     number;
  displayError: string | null;
}

interface CyRun {
  tests: CyTest[];
  stats: { passes: number; failures: number; duration: number };
}

interface CyResult {
  status:      'finished' | 'failed';
  totalPassed: number;
  totalFailed: number;
  message?:    string;
  runs:        CyRun[];
}

// ─── Runner ───────────────────────────────────────────────────────────────────

export class CypressRunner implements IRunner {
  async *run(flow: IncomingFlow): AsyncGenerator<RunnerEvent> {
    const specCode = (flow as IncomingFlow & { specCode?: string }).specCode;
    if (!specCode) {
      yield { type: 'log', level: 'error', message: 'No specCode in payload — send specCode from frontend' };
      yield { type: 'run-fail', error: 'No specCode provided' };
      return;
    }

    const runId  = `${Date.now()}-${randomUUID().slice(0, 8)}`;
    const tmpDir = join(TMP_BASE, runId);
    mkdirSync(tmpDir, { recursive: true });

    const specFile   = join(tmpDir, 'flow.cy.js').replace(/\\/g, '/');
    const cfgFile    = join(tmpDir, 'cypress.config.cjs').replace(/\\/g, '/');
    const workerFile = join(tmpDir, 'worker.cjs');

    writeFileSync(specFile,   specCode,              'utf8');
    writeFileSync(cfgFile,    buildConfig(flow.baseUrl), 'utf8');
    writeFileSync(workerFile, WORKER,                'utf8');

    yield { type: 'log', level: 'info', message: `CypressRunner | baseUrl: ${flow.baseUrl || '(none)'}` };
    yield { type: 'log', level: 'info', message: `Spec: ${specFile}` };
    yield { type: 'started' };

    try {
      const result = await execWorker(workerFile, tmpDir);

      if (result.status === 'failed') {
        yield { type: 'run-fail', error: result.message ?? 'Cypress launch failed' };
        return;
      }

      for (const run of result.runs) {
        for (const test of run.tests) {
          const label = test.title.join(' > ');
          const id    = stableId(label);

          yield { type: 'step-start', nodeId: id, nodeType: 'test', label };

          if (test.state === 'passed') {
            yield { type: 'log',       level: 'info',  message: `✓ ${label} (${test.duration}ms)` };
            yield { type: 'step-pass', nodeId: id, durationMs: test.duration };
          } else {
            const err = test.displayError ?? 'Test failed';
            yield { type: 'log',       level: 'error', message: `✗ ${label} — ${err.split('\n')[0]}` };
            yield { type: 'step-fail', nodeId: id, durationMs: test.duration, error: err.split('\n')[0]! };
          }
        }
      }

      if (result.totalFailed > 0) {
        yield { type: 'run-fail', error: `${result.totalFailed} test(s) failed` };
      } else {
        yield { type: 'log',      level: 'info', message: `✅ ${result.totalPassed} passed` };
        yield { type: 'run-pass' };
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      yield { type: 'log',      level: 'error', message: msg };
      yield { type: 'run-fail', error: msg };
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

// ─── Config file ──────────────────────────────────────────────────────────────

function buildConfig(baseUrl: string): string {
  const safe = (baseUrl || 'http://localhost:3000')
    .replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `module.exports = {
  e2e: {
    baseUrl: '${safe}',
    specPattern: 'flow.cy.js',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: false,
  },
};\n`;
}

// ─── Worker execution ─────────────────────────────────────────────────────────

async function execWorker(
  workerFile: string,
  tmpDir:     string,
): Promise<CyResult> {
  // `project` tells Cypress where to find cypress.config.cjs and specs.
  // Cypress then reads specPattern:'flow.cy.js' from config — a relative path
  // resolved against the project dir, no absolute path globbing involved.
  // This sidesteps the Windows backslash/fast-glob issue entirely.
  const opts = {
    browser: 'electron',
    headed:  false,
    quiet:   true,   // suppress Cypress terminal output → stdout is clean JSON only
    project: tmpDir.replace(/\\/g, '/'),
  };

  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const proc = spawn(
      process.execPath,              // exact Node binary running this server — no PATH lookup
      [workerFile, JSON.stringify(opts)],
      {
        cwd:         process.cwd(), // backend root — so require('cypress') finds node_modules
        shell:       false,         // Node binary, not a shell script
        windowsHide: true,
      },
    );

    proc.stdout?.on('data', (d: Buffer) => {
      const s = d.toString();
      stdout += s;
      process.stdout.write(s);
    });
    proc.stderr?.on('data', (d: Buffer) => {
      const s = d.toString();
      stderr += s;
      process.stderr.write(s);
    });

    proc.on('error', (err) => reject(new Error(`Worker spawn failed: ${err.message}`)));

    proc.on('close', (code) => {
      if (stdout.trim()) {
        // quiet:true → stdout is only our JSON; try direct parse first
        try { return resolve(JSON.parse(stdout) as CyResult); } catch { /* fall through */ }
        // fallback: Cypress may still prefix some output — extract the JSON object
        try { return resolve(extractCyResult(stdout)); } catch { /* fall through */ }
      }
      reject(new Error(
        `Cypress worker exited ${code ?? '?'}\n${(stderr + stdout).slice(0, 800)}`,
      ));
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the Cypress result JSON from stdout that may contain mixed terminal output. */
function extractCyResult(raw: string): CyResult {
  // Cypress programmatic API result object starts with {"browserName"
  const idx = raw.indexOf('{"browserName"');
  if (idx >= 0) return JSON.parse(raw.slice(idx));
  // Last-resort: find the last { that parses as valid JSON
  const last = raw.lastIndexOf('{"');
  if (last >= 0) return JSON.parse(raw.slice(last));
  throw new Error('No CyResult JSON found in stdout');
}

function stableId(label: string): string {
  let h = 5381;
  for (let i = 0; i < label.length; i++) h = ((h << 5) + h) ^ label.charCodeAt(i);
  return `cy-${(h >>> 0).toString(16)}`;
}
