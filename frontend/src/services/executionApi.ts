import type { Flow } from '../core/types.ts';
import { generate } from '../core/codegen/generate.ts';
import { validateFlow } from '../core/validation/validateFlow.ts';

const BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001';

// ─── API response types (mirrors backend types) ───────────────────────────────

export type ExecutionStatus = 'queued' | 'running' | 'passed' | 'failed' | 'cancelled';

export interface StepResult {
  nodeId: string;
  nodeType: string;
  label: string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  error: string | null;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export interface ExecutionSummary {
  id: string;
  flowName: string;
  status: ExecutionStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  stepCount: number;
  errorMessage: string | null;
}

export interface Execution extends ExecutionSummary {
  stepResults: StepResult[];
  logs: LogEntry[];
}

export type SsePayload =
  | { event: 'log'; data: LogEntry }
  | { event: 'step-result'; data: StepResult }
  | { event: 'status'; data: { status: ExecutionStatus } }
  | { event: 'complete'; data: Execution };

// ─── API client ───────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const executionApi = {
  /** Queue a new execution from a flow snapshot.
   *  Includes pre-generated specCode so CypressRunner can write it to a temp file
   *  without needing codegen logic in the backend. */
  run(flow: Flow): Promise<Execution> {
    // Hard gate: never execute a flow that fails validation.
    const validation = validateFlow(flow);
    if (!validation.valid) {
      const n = validation.errors.filter((e) => e.severity === 'error').length;
      return Promise.reject(
        new Error(`Cannot run: ${n} validation error${n !== 1 ? 's' : ''} — fix them before running.`),
      );
    }
    let specCode: string | undefined;
    try { specCode = generate(flow); } catch { /* empty flow — no code */ }
    return request<Execution>('/api/executions', {
      method: 'POST',
      body: JSON.stringify({ ...flow, specCode }),
    });
  },

  list(): Promise<ExecutionSummary[]> {
    return request<ExecutionSummary[]>('/api/executions');
  },

  get(id: string): Promise<Execution> {
    return request<Execution>(`/api/executions/${id}`);
  },

  cancel(id: string): Promise<{ cancelled: boolean }> {
    return request<{ cancelled: boolean }>(`/api/executions/${id}`, { method: 'DELETE' });
  },

  /** Open an SSE stream for live execution events. Returns a cleanup fn. */
  stream(
    id: string,
    handlers: {
      onLog?: (entry: LogEntry) => void;
      onStepResult?: (result: StepResult) => void;
      onStatus?: (status: ExecutionStatus) => void;
      onComplete?: (execution: Execution) => void;
      onError?: (err: Event) => void;
    },
  ): () => void {
    const es = new EventSource(`${BASE}/api/executions/${id}/events`);

    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data as string) as SsePayload;
        switch (payload.event) {
          case 'log':         handlers.onLog?.(payload.data); break;
          case 'step-result': handlers.onStepResult?.(payload.data); break;
          case 'status':      handlers.onStatus?.(payload.data.status); break;
          case 'complete':    handlers.onComplete?.(payload.data); es.close(); break;
        }
      } catch { /* malformed event — ignore */ }
    };

    es.onerror = (e) => { handlers.onError?.(e); };

    return () => es.close();
  },

  /** Check if backend is reachable. */
  async ping(): Promise<boolean> {
    try {
      await fetch(`${BASE}/health`);
      return true;
    } catch {
      return false;
    }
  },
};
