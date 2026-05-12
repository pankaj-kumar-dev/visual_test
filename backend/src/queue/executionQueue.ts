import { EventEmitter } from 'node:events';
import { v4 as uuidv4 } from 'uuid';
import { executionStore } from '../db/executionStore.ts';
import { MockRunner } from '../runner/mockRunner.ts';
import { CypressRunner } from '../runner/cypressRunner.ts';

function makeRunner() {
  return process.env['RUNNER'] === 'cypress' ? new CypressRunner() : new MockRunner();
}
import type { Execution, IncomingFlow, LogEntry, SsePayload, StepResult } from '../types.ts';

// ─── SSE subscriber registry ──────────────────────────────────────────────────
// executionId → set of callbacks. Each SSE connection registers one callback.

type SseCallback = (payload: SsePayload) => void;

const sseRegistry = new Map<string, Set<SseCallback>>();

export function subscribeSse(executionId: string, cb: SseCallback): () => void {
  if (!sseRegistry.has(executionId)) sseRegistry.set(executionId, new Set());
  sseRegistry.get(executionId)!.add(cb);
  return () => sseRegistry.get(executionId)?.delete(cb);
}

function broadcast(executionId: string, payload: SsePayload): void {
  sseRegistry.get(executionId)?.forEach((cb) => cb(payload));
}

// ─── Queue state ──────────────────────────────────────────────────────────────

const CONCURRENCY = 1; // one execution at a time for MVP
let running = 0;
const pending: string[] = []; // execution IDs waiting to run

const queueEvents = new EventEmitter();

// ─── Worker ───────────────────────────────────────────────────────────────────

async function processNext(): Promise<void> {
  if (running >= CONCURRENCY || pending.length === 0) return;

  const id = pending.shift()!;
  const execution = executionStore.findById(id);
  if (!execution || execution.status === 'cancelled') {
    processNext(); // skip cancelled jobs
    return;
  }

  running++;
  const now = new Date().toISOString();
  executionStore.updateStatus(id, 'running', { startedAt: now });
  broadcast(id, { event: 'status', data: { status: 'running' } });

  const runner = makeRunner();
  const flow = execution.flowSnapshot as IncomingFlow;

  let currentStep: { nodeId: string; nodeType: string; label: string } | null = null;
  const stepStart = { time: Date.now() };

  try {
    for await (const event of runner.run(flow)) {
      // Check for cancellation mid-run
      const latest = executionStore.findById(id);
      if (latest?.status === 'cancelled') break;

      switch (event.type) {
        case 'started':
          break;

        case 'log': {
          const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: event.level,
            message: event.message,
          };
          executionStore.appendLog(id, entry);
          broadcast(id, { event: 'log', data: entry });
          break;
        }

        case 'step-start':
          currentStep = { nodeId: event.nodeId, nodeType: event.nodeType, label: event.label };
          stepStart.time = Date.now();
          break;

        case 'step-pass': {
          const result: StepResult = {
            nodeId: event.nodeId,
            nodeType: currentStep?.nodeType ?? '',
            label: currentStep?.label ?? '',
            status: 'passed',
            durationMs: event.durationMs,
            error: null,
          };
          executionStore.appendStepResult(id, result);
          broadcast(id, { event: 'step-result', data: result });
          currentStep = null;
          break;
        }

        case 'step-fail': {
          const result: StepResult = {
            nodeId: event.nodeId,
            nodeType: currentStep?.nodeType ?? '',
            label: currentStep?.label ?? '',
            status: 'failed',
            durationMs: event.durationMs,
            error: event.error,
          };
          executionStore.appendStepResult(id, result);
          broadcast(id, { event: 'step-result', data: result });
          currentStep = null;
          break;
        }

        case 'run-pass': {
          const completedAt = new Date().toISOString();
          const started = executionStore.findById(id)?.startedAt ?? now;
          const durationMs = Date.now() - new Date(started).getTime();
          executionStore.updateStatus(id, 'passed', { completedAt, durationMs });
          const final = executionStore.findById(id)!;
          broadcast(id, { event: 'status', data: { status: 'passed' } });
          broadcast(id, { event: 'complete', data: final });
          break;
        }

        case 'run-fail': {
          const completedAt = new Date().toISOString();
          const started = executionStore.findById(id)?.startedAt ?? now;
          const durationMs = Date.now() - new Date(started).getTime();
          executionStore.updateStatus(id, 'failed', {
            completedAt,
            durationMs,
            errorMessage: event.error,
          });
          const final = executionStore.findById(id)!;
          broadcast(id, { event: 'status', data: { status: 'failed' } });
          broadcast(id, { event: 'complete', data: final });
          break;
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    executionStore.updateStatus(id, 'failed', {
      completedAt: new Date().toISOString(),
      errorMessage: msg,
    });
    broadcast(id, { event: 'status', data: { status: 'failed' } });
    broadcast(id, { event: 'complete', data: executionStore.findById(id)! });
  } finally {
    running--;
    queueEvents.emit('drain');
  }
}

queueEvents.on('drain', processNext);

// ─── Public API ───────────────────────────────────────────────────────────────

export function enqueue(flow: IncomingFlow, flowId: string | null = null): Execution {
  const id = uuidv4();
  const now = new Date().toISOString();

  // If flow has an active environment, override baseUrl
  const resolvedFlow = resolveEnvironment(flow);

  const execution: Execution = {
    id,
    flowId,
    flowName: resolvedFlow.name || 'Untitled Flow',
    flowSnapshot: resolvedFlow,
    status: 'queued',
    createdAt: now,
    startedAt: null,
    completedAt: null,
    durationMs: null,
    stepResults: [],
    logs: [],
    errorMessage: null,
  };

  executionStore.create(execution);
  pending.push(id);
  queueEvents.emit('drain');

  return execution;
}

/** Resolve activeEnvironment override on baseUrl before execution. */
function resolveEnvironment(flow: IncomingFlow): IncomingFlow {
  if (!flow.activeEnvironment || !flow.environments?.length) return flow;
  const env = flow.environments.find((e) => e.name === flow.activeEnvironment);
  if (!env) return flow;
  return { ...flow, baseUrl: env.baseUrl };
}

export function cancel(id: string): boolean {
  const execution = executionStore.findById(id);
  if (!execution) return false;
  if (execution.status !== 'queued' && execution.status !== 'running') return false;

  const pendingIdx = pending.indexOf(id);
  if (pendingIdx >= 0) pending.splice(pendingIdx, 1);

  executionStore.updateStatus(id, 'cancelled', {
    completedAt: new Date().toISOString(),
  });
  broadcast(id, { event: 'status', data: { status: 'cancelled' } });
  broadcast(id, { event: 'complete', data: executionStore.findById(id)! });
  return true;
}
