import { buildLocatorExpr, selectorToLocatorMethod } from '../../adapters/playwrightAdapter.ts';
import type {
  ArgNode,
  AssertionKind,
  CommandNode,
  Flow,
  HookTreeNode,
  StepNode,
  SuiteTreeNode,
  TestTreeNode,
  TreeNode,
} from '../../types.ts';

// ─── Assertion → Playwright expect matcher ────────────────────────────────────

function assertionToMatcher(assertion: AssertionKind, expected: string | undefined, locator: string): string {
  const e = expected ? JSON.stringify(expected) : undefined;
  switch (assertion) {
    case 'be.visible':   return `await expect(${locator}).toBeVisible();`;
    case 'be.hidden':    return `await expect(${locator}).toBeHidden();`;
    case 'be.enabled':   return `await expect(${locator}).toBeEnabled();`;
    case 'be.disabled':  return `await expect(${locator}).toBeDisabled();`;
    case 'be.checked':   return `await expect(${locator}).toBeChecked();`;
    case 'exist':        return `await expect(${locator}).toBeAttached();`;
    case 'not.exist':    return `await expect(${locator}).not.toBeAttached();`;
    case 'have.text':    return `await expect(${locator}).toHaveText(${e ?? "''"});`;
    case 'contain.text': return `await expect(${locator}).toContainText(${e ?? "''"});`;
    case 'have.value':   return `await expect(${locator}).toHaveValue(${e ?? "''"});`;
    case 'have.class':   return `await expect(${locator}).toHaveClass(${e ?? "''"});`;
    case 'have.attr':    return `await expect(${locator}).toHaveAttribute(${e ?? "''"});`;
    case 'include':      return `await expect(${locator}).toContainText(${e ?? "''"});`;
    case 'equal':        return `await expect(${locator}).toHaveText(${e ?? "''"});`;
    case 'be.gt':        return e ? `await expect(${locator}).toBeGreaterThan(${e});` : `// be.gt needs expected`;
    case 'be.gte':       return e ? `await expect(${locator}).toBeGreaterThanOrEqual(${e});` : `// be.gte needs expected`;
    case 'be.lt':        return e ? `await expect(${locator}).toBeLessThan(${e});` : `// be.lt needs expected`;
    case 'be.lte':       return e ? `await expect(${locator}).toBeLessThanOrEqual(${e});` : `// be.lte needs expected`;
    default:             return `// Unknown assertion: ${assertion}`;
  }
}

// ─── Stateful walk context ────────────────────────────────────────────────────

interface WalkCtx {
  locator: string;
  lines:   string[];
  depth:   number;
}

function ind(depth: number): string {
  return '  '.repeat(depth);
}

function getStringArg(cmd: CommandNode): string | undefined {
  return (cmd.args.find((a) => a.kind === 'string') as Extract<ArgNode, { kind: 'string' }> | undefined)?.value;
}

function getNumberArg(cmd: CommandNode): number | undefined {
  return (cmd.args.find((a) => a.kind === 'number') as Extract<ArgNode, { kind: 'number' }> | undefined)?.value;
}

function getSelectorArg(cmd: CommandNode) {
  return (cmd.args.find((a) => a.kind === 'selector') as Extract<ArgNode, { kind: 'selector' }> | undefined)?.value;
}

function getAliasArg(cmd: CommandNode) {
  return (cmd.args.find((a) => a.kind === 'alias') as Extract<ArgNode, { kind: 'alias' }> | undefined)?.name;
}

function getAssertionArg(cmd: CommandNode) {
  return cmd.args.find((a) => a.kind === 'assertion') as Extract<ArgNode, { kind: 'assertion' }> | undefined;
}

function walkCmd(cmd: CommandNode, ctx: WalkCtx): void {
  const d = ctx.depth;

  switch (cmd.name) {
    case 'visit': {
      const url = getStringArg(cmd) ?? '/';
      ctx.lines.push(`${ind(d)}await page.goto(${JSON.stringify(url)});`);
      ctx.locator = 'page';
      break;
    }
    case 'get': {
      const aliasName = getAliasArg(cmd);
      const sel = getSelectorArg(cmd);
      if (aliasName) {
        ctx.locator = aliasName;
      } else if (sel) {
        ctx.locator = buildLocatorExpr(sel, 'page');
      }
      break;
    }
    case 'find': {
      const sel = getSelectorArg(cmd);
      if (sel) ctx.locator = `${ctx.locator}.${selectorToLocatorMethod(sel)}`;
      break;
    }
    case 'contains': {
      const t = getStringArg(cmd) ?? '';
      ctx.locator = `${ctx.locator}.getByText(${JSON.stringify(t)}, { exact: false })`;
      break;
    }
    case 'click':
      ctx.lines.push(`${ind(d)}await ${ctx.locator}.click();`);
      break;
    case 'type': {
      const t = getStringArg(cmd) ?? '';
      ctx.lines.push(`${ind(d)}await ${ctx.locator}.fill(${JSON.stringify(t)});`);
      break;
    }
    case 'clear':
      ctx.lines.push(`${ind(d)}await ${ctx.locator}.clear();`);
      break;
    case 'select': {
      const v = getStringArg(cmd) ?? '';
      ctx.lines.push(`${ind(d)}await ${ctx.locator}.selectOption(${JSON.stringify(v)});`);
      break;
    }
    case 'check':
      ctx.lines.push(`${ind(d)}await ${ctx.locator}.check();`);
      break;
    case 'should':
    case 'and': {
      const a = getAssertionArg(cmd);
      if (a) ctx.lines.push(`${ind(d)}${assertionToMatcher(a.assertion, a.expected, ctx.locator)}`);
      break;
    }
    case 'url':
      ctx.locator = 'page';
      break;
    case 'title':
      ctx.locator = 'page';
      break;
    case 'wait': {
      const n = getNumberArg(cmd);
      if (n !== undefined) ctx.lines.push(`${ind(d)}await page.waitForTimeout(${n});`);
      break;
    }
    case 'fixture': {
      const name = getStringArg(cmd) ?? '';
      ctx.lines.push(`${ind(d)}// fixture: ${JSON.stringify(name)} — load via test.use() or JSON import`);
      break;
    }
    case 'env': {
      const key = getStringArg(cmd) ?? '';
      ctx.lines.push(`${ind(d)}// env: process.env[${JSON.stringify(key)}]`);
      break;
    }
    default:
      ctx.lines.push(`${ind(d)}// Unknown command: ${cmd.name}`);
  }

  // Alias: emit const and update locator reference
  if (cmd.alias) {
    ctx.lines.push(`${ind(d)}const ${cmd.alias} = ${ctx.locator};`);
    ctx.locator = cmd.alias;
  }

  // Recurse into chain
  for (const chained of cmd.chain) {
    walkCmd(chained, ctx);
  }
}

// ─── Step emitter ─────────────────────────────────────────────────────────────

function emitStep(step: StepNode, depth: number): string[] {
  if (step.disabled) return [];
  const ctx: WalkCtx = { locator: 'page', lines: [], depth };
  walkCmd(step.command, ctx);
  return ctx.lines;
}

// ─── Tree walkers ─────────────────────────────────────────────────────────────

function getNode(flow: Flow, id: string): TreeNode | null {
  return flow.nodes[id] ?? null;
}

function emitHook(flow: Flow, hookId: string, depth: number): string[] {
  const hook = getNode(flow, hookId) as HookTreeNode | null;
  if (!hook || hook.kind !== 'hook') return [];

  const fn =
    hook.hookKind === 'beforeAll'  ? 'test.beforeAll'
    : hook.hookKind === 'beforeEach' ? 'test.beforeEach'
    : hook.hookKind === 'afterEach'  ? 'test.afterEach'
    : 'test.afterAll';

  const inner = depth + 1;
  const stepLines = hook.steps.flatMap((s) => emitStep(s, inner + 1));
  return [
    `${'  '.repeat(inner)}${fn}(async ({ page }) => {`,
    ...stepLines,
    `${'  '.repeat(inner)}});`,
  ];
}

function emitTest(test: TestTreeNode, depth: number): string[] {
  const fn = test.skip ? 'test.skip' : test.only ? 'test.only' : 'test';
  const inner = depth + 1;
  const stepLines = test.steps.flatMap((s) => emitStep(s, inner));
  return [
    `${'  '.repeat(depth)}${fn}(${JSON.stringify(test.name)}, async ({ page }) => {`,
    ...stepLines,
    `${'  '.repeat(depth)}});`,
  ];
}

function emitSuite(flow: Flow, suiteId: string, depth: number): string[] {
  const suite = getNode(flow, suiteId) as SuiteTreeNode | null;
  if (!suite || suite.kind !== 'suite') return [];

  const inner = depth + 1;
  const lines: string[] = [];
  lines.push(`${'  '.repeat(depth)}test.describe(${JSON.stringify(suite.name)}, () => {`);

  for (const hid of suite.hooks.beforeAll)  lines.push(...emitHook(flow, hid, depth));
  for (const hid of suite.hooks.beforeEach) lines.push(...emitHook(flow, hid, depth));

  for (const childId of suite.children) {
    const child = getNode(flow, childId);
    if (!child) continue;
    if (child.kind === 'suite') lines.push(...emitSuite(flow, childId, inner));
    if (child.kind === 'test')  lines.push(...emitTest(child, inner));
  }

  for (const hid of suite.hooks.afterEach) lines.push(...emitHook(flow, hid, depth));
  for (const hid of suite.hooks.afterAll)  lines.push(...emitHook(flow, hid, depth));

  lines.push(`${'  '.repeat(depth)}});`);
  return lines;
}

// ─── Public entry ─────────────────────────────────────────────────────────────

export function emitPlaywright(flow: Flow): string {
  const header = [
    `import { test, expect } from '@playwright/test';`,
    '',
    `// Generated by Visual Test Builder`,
    `// Flow: ${flow.name}`,
    ...(flow.baseUrl ? [`// baseUrl: ${flow.baseUrl}`] : []),
    ...(flow.tags.length ? [`// Tags: ${flow.tags.join(', ')}`] : []),
    '',
  ];

  const body = emitSuite(flow, flow.rootSuiteId, 0);
  return [...header, ...body].join('\n');
}
