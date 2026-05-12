import { selectorToCss } from '../../adapters/cypressAdapter.ts';
import type {
  ArgNode,
  AssertionKind,
  CommandNode,
  Flow,
  HookKind,
  HookTreeNode,
  StepNode,
  SuiteTreeNode,
  TestTreeNode,
  TreeNode,
} from '../../types.ts';

// ─── Escape helper ────────────────────────────────────────────────────────────

function sq(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function jq(s: string): string {
  return JSON.stringify(s);
}

// ─── Arg serialisers ──────────────────────────────────────────────────────────

function emitAssertionArgs(assertion: AssertionKind, expected?: string): string {
  return expected !== undefined
    ? `${jq(assertion)}, ${jq(expected)}`
    : jq(assertion);
}

// ─── CommandNode body (without cy. prefix and without chain) ──────────────────

function emitCmdBody(cmd: CommandNode): string {
  switch (cmd.name) {
    case 'visit': {
      const url = (cmd.args.find((a) => a.kind === 'string') as Extract<ArgNode, { kind: 'string' }> | undefined)?.value ?? '/';
      return `visit(${sq(url)})`;
    }
    case 'get': {
      const sArg = cmd.args.find((a) => a.kind === 'selector') as Extract<ArgNode, { kind: 'selector' }> | undefined;
      const aliasArg = cmd.args.find((a) => a.kind === 'alias') as Extract<ArgNode, { kind: 'alias' }> | undefined;
      if (aliasArg) return `get(${sq('@' + aliasArg.name)})`;
      if (sArg) {
        // text strategy uses contains(), not get()
        if (sArg.value.strategy === 'text') {
          return `contains(${sq(sArg.value.value)})`;
        }
        return `get(${sq(selectorToCss(sArg.value))})`;
      }
      return `get('*')`;
    }
    case 'find': {
      const sArg = cmd.args.find((a) => a.kind === 'selector') as Extract<ArgNode, { kind: 'selector' }> | undefined;
      return sArg ? `find(${sq(selectorToCss(sArg.value))})` : `find('*')`;
    }
    case 'contains': {
      const t = (cmd.args.find((a) => a.kind === 'string') as Extract<ArgNode, { kind: 'string' }> | undefined)?.value ?? '';
      return `contains(${sq(t)})`;
    }
    case 'click':
      return 'click()';
    case 'type': {
      const t = (cmd.args.find((a) => a.kind === 'string') as Extract<ArgNode, { kind: 'string' }> | undefined)?.value ?? '';
      return `type(${sq(t)})`;
    }
    case 'clear':
      return 'clear()';
    case 'select': {
      const v = (cmd.args.find((a) => a.kind === 'string') as Extract<ArgNode, { kind: 'string' }> | undefined)?.value ?? '';
      return `select(${sq(v)})`;
    }
    case 'check':
      return 'check()';
    case 'should': {
      const a = cmd.args.find((x) => x.kind === 'assertion') as Extract<ArgNode, { kind: 'assertion' }> | undefined;
      return a ? `should(${emitAssertionArgs(a.assertion, a.expected)})` : 'should()';
    }
    case 'and': {
      const a = cmd.args.find((x) => x.kind === 'assertion') as Extract<ArgNode, { kind: 'assertion' }> | undefined;
      return a ? `and(${emitAssertionArgs(a.assertion, a.expected)})` : 'and()';
    }
    case 'url':
      return 'url()';
    case 'title':
      return 'title()';
    case 'wait': {
      const n = (cmd.args.find((a) => a.kind === 'number') as Extract<ArgNode, { kind: 'number' }> | undefined)?.value;
      const alias = (cmd.args.find((a) => a.kind === 'alias') as Extract<ArgNode, { kind: 'alias' }> | undefined)?.name;
      if (alias) return `wait(${sq('@' + alias)})`;
      return `wait(${n ?? 0})`;
    }
    case 'fixture': {
      const name = (cmd.args.find((a) => a.kind === 'string') as Extract<ArgNode, { kind: 'string' }> | undefined)?.value ?? '';
      return `fixture(${sq(name)})`;
    }
    case 'env': {
      const key = (cmd.args.find((a) => a.kind === 'string') as Extract<ArgNode, { kind: 'string' }> | undefined)?.value ?? '';
      return `env(${sq(key)})`;
    }
    default:
      return `${cmd.name}()`;
  }
}

// ─── Walk command chain → single line ─────────────────────────────────────────

function walkChain(cmd: CommandNode): string {
  const self = emitCmdBody(cmd);
  const aliasStr = cmd.alias ? `.as(${sq(cmd.alias)})` : '';
  const chainStr = cmd.chain.length > 0
    ? '.' + cmd.chain.map(walkChain).join('.')
    : '';
  return self + aliasStr + chainStr;
}

function emitStep(step: StepNode): string {
  if (step.disabled) return '';
  return `cy.${walkChain(step.command)};`;
}

// ─── Tree walkers ─────────────────────────────────────────────────────────────

function indent(n: number): string {
  return '  '.repeat(n);
}

function emitSteps(steps: StepNode[], depth: number): string[] {
  return steps.filter((s) => !s.disabled).map((s) => `${indent(depth)}${emitStep(s)}`);
}

function getNode(flow: Flow, id: string): TreeNode | null {
  return flow.nodes[id] ?? null;
}

function emitHook(flow: Flow, hookId: string, depth: number): string[] {
  const hook = getNode(flow, hookId) as HookTreeNode | null;
  if (!hook || hook.kind !== 'hook') return [];
  const lines: string[] = [
    `${indent(depth)}${hook.hookKind}(() => {`,
    ...emitSteps(hook.steps, depth + 1),
    `${indent(depth)}});`,
  ];
  return lines;
}

function emitTest(test: TestTreeNode, depth: number): string[] {
  const fn = test.skip ? 'it.skip' : test.only ? 'it.only' : 'it';
  return [
    `${indent(depth)}${fn}(${jq(test.name)}, () => {`,
    ...emitSteps(test.steps, depth + 1),
    `${indent(depth)}});`,
  ];
}

function emitSuite(flow: Flow, suiteId: string, depth: number): string[] {
  const suite = getNode(flow, suiteId) as SuiteTreeNode | null;
  if (!suite || suite.kind !== 'suite') return [];

  const lines: string[] = [];

  // Top-level root suite = describe wrapper
  lines.push(`${indent(depth)}describe(${jq(suite.name)}, () => {`);
  const inner = depth + 1;

  // beforeAll hooks
  for (const hid of suite.hooks.beforeAll) lines.push(...emitHook(flow, hid, inner));
  // beforeEach hooks
  for (const hid of suite.hooks.beforeEach) lines.push(...emitHook(flow, hid, inner));

  // children (suites + tests)
  for (const childId of suite.children) {
    const child = getNode(flow, childId);
    if (!child) continue;
    if (child.kind === 'suite') lines.push(...emitSuite(flow, childId, inner));
    if (child.kind === 'test')  lines.push(...emitTest(child, inner));
  }

  // afterEach hooks
  for (const hid of suite.hooks.afterEach) lines.push(...emitHook(flow, hid, inner));
  // afterAll hooks
  for (const hid of suite.hooks.afterAll)  lines.push(...emitHook(flow, hid, inner));

  lines.push(`${indent(depth)}});`);
  return lines;
}

// ─── Public entry ─────────────────────────────────────────────────────────────

export function emitCypress(flow: Flow): string {
  const header = [
    `// Generated by Visual Test Builder`,
    `// Flow: ${flow.name}`,
    `// Framework: cypress`,
    ...(flow.baseUrl ? [`// baseUrl: ${flow.baseUrl}`] : []),
    ...(flow.tags.length ? [`// Tags: ${flow.tags.join(', ')}`] : []),
    '',
  ];

  const body = emitSuite(flow, flow.rootSuiteId, 0);

  return [...header, ...body].join('\n');
}
