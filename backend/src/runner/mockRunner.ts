import type { IRunner } from './interface.ts';
import type {
  IncomingCommand,
  IncomingFlow,
  IncomingHookNode,
  IncomingStep,
  IncomingSuiteNode,
  IncomingTestNode,
  IncomingTreeNode,
  RunnerEvent,
} from '../types.ts';

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const rand  = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Execution unit: flat list of {testName, steps[]} ────────────────────────

interface ExecutionUnit {
  testId:   string;
  testName: string;
  steps:    IncomingStep[];
}

// ─── Tree → linear execution plan ─────────────────────────────────────────────
// Resolves: beforeAll (once), beforeEach (per test), test steps, afterEach (per test), afterAll (once)

function getNode(flow: IncomingFlow, id: string): IncomingTreeNode | null {
  return flow.nodes[id] ?? null;
}

function collectSuiteUnits(
  flow: IncomingFlow,
  suiteId: string,
  inheritedBeforeEach: IncomingStep[],
  inheritedAfterEach:  IncomingStep[],
): ExecutionUnit[] {
  const suite = getNode(flow, suiteId) as IncomingSuiteNode | null;
  if (!suite || suite.kind !== 'suite') return [];

  const units: ExecutionUnit[] = [];

  // Resolve hooks at this suite level
  const localBeforeAll  = suite.hooks.beforeAll.flatMap( (id) => (getNode(flow, id) as IncomingHookNode | null)?.steps ?? []);
  const localBeforeEach = suite.hooks.beforeEach.flatMap((id) => (getNode(flow, id) as IncomingHookNode | null)?.steps ?? []);
  const localAfterEach  = suite.hooks.afterEach.flatMap( (id) => (getNode(flow, id) as IncomingHookNode | null)?.steps ?? []);
  const localAfterAll   = suite.hooks.afterAll.flatMap(  (id) => (getNode(flow, id) as IncomingHookNode | null)?.steps ?? []);

  // beforeAll: run as a synthetic test unit (won't fail individual tests)
  if (localBeforeAll.length > 0) {
    units.push({ testId: `${suiteId}:beforeAll`, testName: `[before all] ${suite.name}`, steps: localBeforeAll });
  }

  const myBeforeEach = [...inheritedBeforeEach, ...localBeforeEach];
  const myAfterEach  = [...localAfterEach,  ...inheritedAfterEach];

  for (const childId of suite.children) {
    const child = getNode(flow, childId);
    if (!child) continue;
    if (child.kind === 'suite') {
      units.push(...collectSuiteUnits(flow, childId, myBeforeEach, myAfterEach));
    } else if (child.kind === 'test') {
      if (child.skip) continue;
      units.push({
        testId:   child.id,
        testName: child.name,
        steps:    [...myBeforeEach, ...child.steps, ...myAfterEach],
      });
    }
  }

  if (localAfterAll.length > 0) {
    units.push({ testId: `${suiteId}:afterAll`, testName: `[after all] ${suite.name}`, steps: localAfterAll });
  }

  return units;
}

function lineariseTree(flow: IncomingFlow): ExecutionUnit[] {
  if (!flow.rootSuiteId) return [];
  return collectSuiteUnits(flow, flow.rootSuiteId, [], []);
}

// ─── Step description ─────────────────────────────────────────────────────────

function describeStep(step: IncomingStep): { label: string; nodeType: string } {
  const cmd = step.command;
  const label = describeCommand(cmd);
  const nodeType = cmd.name;
  return { label, nodeType };
}

function describeCommand(cmd: IncomingCommand): string {
  const arg0 = cmd.args[0];
  switch (cmd.name) {
    case 'visit': {
      const url = arg0?.kind === 'string' ? String(arg0.value ?? '') : '';
      return `visit("${url}")`;
    }
    case 'get': {
      if (arg0?.kind === 'selector') {
        const sel = arg0.value as { strategy: string; value: string } | undefined;
        return `get [${sel?.strategy ?? 'css'}="${sel?.value ?? ''}"]`;
      }
      if (arg0?.kind === 'alias') return `get @${arg0.name}`;
      return 'get';
    }
    case 'click':   return 'click';
    case 'type': {
      const text = arg0?.kind === 'string' ? String(arg0.value ?? '') : '';
      return `type("${text}")`;
    }
    case 'clear':   return 'clear';
    case 'should': {
      const a = arg0?.kind === 'assertion' ? arg0.assertion : '';
      return `should(${a})`;
    }
    case 'wait': {
      const ms = arg0?.kind === 'number' ? arg0.value : '';
      return `wait(${ms}ms)`;
    }
    default:
      return cmd.name + (cmd.chain.length > 0 ? ` .${cmd.chain.map((c) => c.name).join('.')}` : '');
  }
}

// ─── MockRunner ───────────────────────────────────────────────────────────────

export class MockRunner implements IRunner {
  private readonly failureRate: number;

  constructor() {
    this.failureRate = parseFloat(process.env['MOCK_FAILURE_RATE'] ?? '0');
  }

  async *run(flow: IncomingFlow): AsyncGenerator<RunnerEvent> {
    const units = lineariseTree(flow);
    const totalSteps = units.reduce((sum, u) => sum + u.steps.length, 0);

    yield { type: 'log', level: 'info', message: `Starting mock execution: "${flow.name}"` };
    yield { type: 'log', level: 'info', message: `Framework: ${flow.target} | Tests: ${units.length} | Steps: ${totalSteps}` };
    if (flow.baseUrl) yield { type: 'log', level: 'info', message: `Base URL: ${flow.baseUrl}` };
    yield { type: 'started' };

    await sleep(rand(80, 200));

    for (const unit of units) {
      yield { type: 'log', level: 'info', message: `▶ ${unit.testName}` };

      for (const step of unit.steps) {
        if (step.disabled) continue;

        const { label, nodeType } = describeStep(step);
        yield { type: 'log', level: 'info', message: `  ▷ ${label}` };
        yield { type: 'step-start', nodeId: step.id, nodeType, label };

        const dur = rand(60, 350);
        await sleep(dur);

        const failed = Math.random() < this.failureRate;
        if (failed) {
          const error = `Element not found or assertion failed: ${label}`;
          yield { type: 'log', level: 'error', message: `  ✗ ${label} — ${error}` };
          yield { type: 'step-fail', nodeId: step.id, durationMs: dur, error };
          yield { type: 'run-fail', error: `Step "${label}" failed: ${error}` };
          return;
        }

        yield { type: 'log', level: 'info', message: `  ✓ ${label} (${dur}ms)` };
        yield { type: 'step-pass', nodeId: step.id, durationMs: dur };
      }
    }

    yield { type: 'log', level: 'info', message: `✅ All ${totalSteps} steps passed` };
    yield { type: 'run-pass' };
  }
}
