// ─── Execution lifecycle ──────────────────────────────────────────────────────

export type ExecutionStatus =
  | 'queued'
  | 'running'
  | 'passed'
  | 'failed'
  | 'cancelled';

// ─── Step-level result ────────────────────────────────────────────────────────

export interface StepResult {
  nodeId:     string;
  nodeType:   string;
  label:      string;
  status:     'passed' | 'failed' | 'skipped';
  durationMs: number;
  error:      string | null;
}

// ─── Log entry ────────────────────────────────────────────────────────────────

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level:     LogLevel;
  message:   string;
}

// ─── Full execution record ────────────────────────────────────────────────────

export interface Execution {
  id:             string;
  flowId:         string | null;
  flowName:       string;
  flowSnapshot:   unknown;
  status:         ExecutionStatus;
  createdAt:      string;
  startedAt:      string | null;
  completedAt:    string | null;
  durationMs:     number | null;
  stepResults:    StepResult[];
  logs:           LogEntry[];
  errorMessage:   string | null;
}

// ─── Saved flow ───────────────────────────────────────────────────────────────

export interface SavedFlow {
  id:          string;
  name:        string;
  description: string;
  createdAt:   string;
  updatedAt:   string;
  flow:        IncomingFlow;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface FlakyStat {
  nodeId:    string;
  nodeType:  string;
  label:     string;
  totalRuns: number;
  failures:  number;
  flakeRate: number;
  isFlaky:   boolean;
}

export interface ExecutionStats {
  totalExecutions: number;
  passed:          number;
  failed:          number;
  cancelled:       number;
  passRate:        number;
  avgDurationMs:   number;
  p95DurationMs:   number;
}

// ─── v2 IncomingFlow — minimal tree shape for backend ────────────────────────

export interface IncomingArg {
  kind:      string;
  value?:    unknown;
  assertion?: string;
  expected?: string;
  name?:     string;
}

export interface IncomingCommand {
  id:    string;
  name:  string;
  args:  IncomingArg[];
  alias?: string;
  chain: IncomingCommand[];
}

export interface IncomingStep {
  id:       string;
  command:  IncomingCommand;
  label?:   string;
  disabled?: boolean;
}

export type IncomingHookKind = 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll';

export interface IncomingSuiteNode {
  id:       string;
  kind:     'suite';
  name:     string;
  parentId: string | null;
  children: string[];
  hooks:    Record<IncomingHookKind, string[]>;
  parallel?: boolean;
}

export interface IncomingTestNode {
  id:       string;
  kind:     'test';
  name:     string;
  parentId: string;
  steps:    IncomingStep[];
  skip?:    boolean;
  only?:    boolean;
}

export interface IncomingHookNode {
  id:       string;
  kind:     'hook';
  hookKind: IncomingHookKind;
  parentId: string;
  steps:    IncomingStep[];
}

export type IncomingTreeNode = IncomingSuiteNode | IncomingTestNode | IncomingHookNode;

export interface IncomingFlow {
  version:           string;
  name:              string;
  baseUrl:           string;
  target:            string;
  rootSuiteId:       string;
  nodes:             Record<string, IncomingTreeNode>;
  // Optional — used by backend to resolve active environment baseUrl override
  environments?:     Array<{ name: string; baseUrl: string }>;
  activeEnvironment?: string | null;
  // Pre-generated spec code sent from frontend (required for CypressRunner)
  specCode?: string;
}

// ─── Runner events ────────────────────────────────────────────────────────────

export type RunnerEvent =
  | { type: 'started' }
  | { type: 'log';        level: LogLevel; message: string }
  | { type: 'step-start'; nodeId: string; nodeType: string; label: string }
  | { type: 'step-pass';  nodeId: string; durationMs: number }
  | { type: 'step-fail';  nodeId: string; durationMs: number; error: string }
  | { type: 'run-pass' }
  | { type: 'run-fail';   error: string };

// ─── SSE events ───────────────────────────────────────────────────────────────

export type SsePayload =
  | { event: 'log';         data: LogEntry }
  | { event: 'step-result'; data: StepResult }
  | { event: 'status';      data: { status: ExecutionStatus } }
  | { event: 'complete';    data: Execution };
