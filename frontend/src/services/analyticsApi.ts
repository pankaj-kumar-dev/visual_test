const BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001';

async function req<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export interface FlakyStat {
  nodeId: string;
  nodeType: string;
  label: string;
  totalRuns: number;
  failures: number;
  flakeRate: number;
  isFlaky: boolean;
}

export interface ExecutionStats {
  totalExecutions: number;
  passed: number;
  failed: number;
  cancelled: number;
  passRate: number;
  avgDurationMs: number;
  p95DurationMs: number;
}

export const analyticsApi = {
  stats(): Promise<ExecutionStats> {
    return req<ExecutionStats>('/api/analytics/stats');
  },
  flaky(): Promise<FlakyStat[]> {
    return req<FlakyStat[]>('/api/analytics/flaky');
  },
};
