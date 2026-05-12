import type { Flow } from '../core/types.ts';

const BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
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

export interface SavedFlowSummary {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedFlow extends SavedFlowSummary {
  flow: Flow;
}

export const flowApi = {
  save(flow: Flow, description = ''): Promise<SavedFlow> {
    return req<SavedFlow>('/api/flows', {
      method: 'POST',
      body: JSON.stringify({ flow, description }),
    });
  },

  update(id: string, flow: Flow, description?: string): Promise<SavedFlow> {
    return req<SavedFlow>(`/api/flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ flow, description }),
    });
  },

  list(): Promise<SavedFlowSummary[]> {
    return req<SavedFlowSummary[]>('/api/flows');
  },

  get(id: string): Promise<SavedFlow> {
    return req<SavedFlow>(`/api/flows/${id}`);
  },

  delete(id: string): Promise<void> {
    return req<void>(`/api/flows/${id}`, { method: 'DELETE' });
  },
};
