import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import type { IncomingFlow, SavedFlow } from '../types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const DATA_PATH = join(DATA_DIR, 'flows.json');

export interface IFlowStore {
  save(flow: IncomingFlow, description?: string): SavedFlow;
  update(id: string, flow: IncomingFlow, description?: string): SavedFlow | null;
  findById(id: string): SavedFlow | null;
  findAll(): SavedFlow[];
  delete(id: string): boolean;
}

class InMemoryFlowStore implements IFlowStore {
  private readonly map = new Map<string, SavedFlow>();

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    try {
      if (existsSync(DATA_PATH)) {
        const arr = JSON.parse(readFileSync(DATA_PATH, 'utf-8')) as SavedFlow[];
        for (const f of arr) this.map.set(f.id, f);
      }
    } catch { /* start fresh */ }
  }

  private flush(): void {
    try {
      mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(DATA_PATH, JSON.stringify([...this.map.values()], null, 2));
    } catch { /* best-effort */ }
  }

  save(flow: IncomingFlow, description = ''): SavedFlow {
    const now = new Date().toISOString();
    const saved: SavedFlow = {
      id: uuidv4(),
      name: flow.name || 'Untitled Flow',
      description,
      createdAt: now,
      updatedAt: now,
      flow,
    };
    this.map.set(saved.id, saved);
    this.flush();
    return saved;
  }

  update(id: string, flow: IncomingFlow, description?: string): SavedFlow | null {
    const existing = this.map.get(id);
    if (!existing) return null;
    const updated: SavedFlow = {
      ...existing,
      name: flow.name || existing.name,
      description: description ?? existing.description,
      updatedAt: new Date().toISOString(),
      flow,
    };
    this.map.set(id, updated);
    this.flush();
    return updated;
  }

  findById(id: string): SavedFlow | null {
    return this.map.get(id) ?? null;
  }

  findAll(): SavedFlow[] {
    return [...this.map.values()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  delete(id: string): boolean {
    const existed = this.map.has(id);
    this.map.delete(id);
    if (existed) this.flush();
    return existed;
  }
}

export const flowStore: IFlowStore = new InMemoryFlowStore();
