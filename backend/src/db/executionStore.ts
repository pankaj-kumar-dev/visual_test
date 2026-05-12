import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Execution, ExecutionStatus, LogEntry, StepResult } from '../types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const DATA_PATH = join(DATA_DIR, 'executions.json');

// ─── Interface (swap for SQLite/Postgres without changing routes) ─────────────

export interface IExecutionStore {
  create(execution: Execution): void;
  findById(id: string): Execution | null;
  findAll(): Execution[];
  updateStatus(id: string, status: ExecutionStatus, extra?: Partial<Execution>): void;
  appendLog(id: string, entry: LogEntry): void;
  appendStepResult(id: string, result: StepResult): void;
}

// ─── In-memory store with JSON file persistence ───────────────────────────────

class InMemoryExecutionStore implements IExecutionStore {
  private readonly map = new Map<string, Execution>();

  constructor() {
    this.hydrate();
  }

  private hydrate(): void {
    try {
      if (existsSync(DATA_PATH)) {
        const arr = JSON.parse(readFileSync(DATA_PATH, 'utf-8')) as Execution[];
        for (const e of arr) this.map.set(e.id, e);
      }
    } catch { /* corrupted — start fresh */ }
  }

  private flush(): void {
    try {
      mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(DATA_PATH, JSON.stringify([...this.map.values()], null, 2));
    } catch { /* best-effort */ }
  }

  create(execution: Execution): void {
    this.map.set(execution.id, execution);
    this.flush();
  }

  findById(id: string): Execution | null {
    return this.map.get(id) ?? null;
  }

  findAll(): Execution[] {
    return [...this.map.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  updateStatus(
    id: string,
    status: ExecutionStatus,
    extra: Partial<Execution> = {},
  ): void {
    const ex = this.map.get(id);
    if (!ex) return;
    this.map.set(id, { ...ex, status, ...extra });
    this.flush();
  }

  appendLog(id: string, entry: LogEntry): void {
    const ex = this.map.get(id);
    if (!ex) return;
    // mutate in place — no flush on every log line (high frequency)
    ex.logs.push(entry);
  }

  appendStepResult(id: string, result: StepResult): void {
    const ex = this.map.get(id);
    if (!ex) return;
    ex.stepResults.push(result);
  }
}

export const executionStore: IExecutionStore = new InMemoryExecutionStore();
