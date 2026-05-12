import { z } from 'zod';
import { newId } from '../../utils/id.ts';
import { SelectorNodeSchema } from './selectorSchema.ts';
import type {
  ArgNode,
  AssertionKind,
  CommandNode,
  HookKind,
  HookTreeNode,
  StepNode,
  SuiteTreeNode,
  TestTreeNode,
} from '../types.ts';

// ─── ArgNode Zod schema ───────────────────────────────────────────────────────

const AssertionKindSchema = z.enum([
  'be.visible', 'be.hidden', 'be.enabled', 'be.disabled', 'be.checked',
  'exist', 'not.exist',
  'have.text', 'contain.text', 'have.value',
  'have.class', 'have.attr',
  'include', 'equal',
  'be.gt', 'be.gte', 'be.lt', 'be.lte',
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArgNodeSchema: z.ZodType<ArgNode, any, any> = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('selector'),  value: SelectorNodeSchema }),
  z.object({ kind: z.literal('string'),    value: z.string() }),
  z.object({ kind: z.literal('number'),    value: z.number() }),
  z.object({ kind: z.literal('boolean'),   value: z.boolean() }),
  z.object({
    kind:      z.literal('assertion'),
    assertion: AssertionKindSchema,
    expected:  z.string().optional(),
  }),
  z.object({ kind: z.literal('options'), value: z.record(z.string(), z.unknown()) }),
  z.object({ kind: z.literal('alias'),   name: z.string() }),
]);

// ─── CommandNode Zod schema (recursive via z.lazy) ────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CommandNodeSchema: z.ZodType<CommandNode, any, any> = z.lazy(() =>
  z.object({
    id:    z.string(),
    name:  z.string(),
    args:  z.array(ArgNodeSchema),
    alias: z.string().optional(),
    chain: z.array(CommandNodeSchema),
  }),
);

// ─── StepNode Zod schema ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StepNodeSchema: z.ZodType<StepNode, any, any> = z.object({
  id:       z.string(),
  command:  CommandNodeSchema,
  label:    z.string().optional(),
  disabled: z.boolean().optional(),
});

// ─── Tree node Zod schemas ────────────────────────────────────────────────────

const HookKindSchema = z.enum(['beforeAll', 'beforeEach', 'afterEach', 'afterAll']);

export const SuiteTreeNodeSchema = z.object({
  id:       z.string(),
  kind:     z.literal('suite'),
  name:     z.string(),
  parentId: z.string().nullable(),
  children: z.array(z.string()),
  hooks:    z.object({
    beforeAll:  z.array(z.string()),
    beforeEach: z.array(z.string()),
    afterEach:  z.array(z.string()),
    afterAll:   z.array(z.string()),
  }),
  parallel: z.boolean().optional(),
});

export const TestTreeNodeSchema = z.object({
  id:       z.string(),
  kind:     z.literal('test'),
  name:     z.string(),
  parentId: z.string(),
  steps:    z.array(StepNodeSchema),
  tags:     z.array(z.string()).optional(),
  skip:     z.boolean().optional(),
  only:     z.boolean().optional(),
});

export const HookTreeNodeSchema = z.object({
  id:       z.string(),
  kind:     z.literal('hook'),
  hookKind: HookKindSchema,
  parentId: z.string(),
  steps:    z.array(StepNodeSchema),
});

export const TreeNodeSchema = z.discriminatedUnion('kind', [
  SuiteTreeNodeSchema,
  TestTreeNodeSchema,
  HookTreeNodeSchema,
]);

// ─── Factories ────────────────────────────────────────────────────────────────

export function createSuiteNode(
  name: string,
  parentId: string | null,
): SuiteTreeNode {
  return {
    id: newId(),
    kind: 'suite',
    name,
    parentId,
    children: [],
    hooks: { beforeAll: [], beforeEach: [], afterEach: [], afterAll: [] },
  };
}

export function createTestNode(name: string, parentId: string): TestTreeNode {
  return {
    id:       newId(),
    kind:     'test',
    name,
    parentId,
    steps:    [],
  };
}

export function createHookNode(hookKind: HookKind, parentId: string): HookTreeNode {
  return {
    id: newId(),
    kind: 'hook',
    hookKind,
    parentId,
    steps: [],
  };
}

export function createStep(commandName = 'get'): StepNode {
  return {
    id:      newId(),
    command: createCommand(commandName),
  };
}

export function createCommand(name: string, args: ArgNode[] = []): CommandNode {
  return { id: newId(), name, args, chain: [] };
}

// ─── Command path helpers ─────────────────────────────────────────────────────

/** Resolve command at path [] = root, [0] = chain[0], [0,1] = chain[0].chain[1] */
export function getCommandAtPath(
  root: CommandNode,
  path: number[],
): CommandNode | null {
  let curr: CommandNode = root;
  for (const idx of path) {
    const next = curr.chain[idx];
    if (!next) return null;
    curr = next;
  }
  return curr;
}

/** Immutably update command at path, returns new root */
export function patchCommandAtPath(
  root: CommandNode,
  path: number[],
  patch: Partial<Omit<CommandNode, 'chain' | 'id'>>,
): CommandNode {
  if (path.length === 0) return { ...root, ...patch };
  const [head, ...rest] = path as [number, ...number[]];
  const newChain = [...root.chain];
  const child = newChain[head];
  if (!child) return root;
  newChain[head] = patchCommandAtPath(child, rest, patch);
  return { ...root, chain: newChain };
}

/** Immutably append a child command at path */
export function appendCommandAtPath(
  root: CommandNode,
  path: number[],
  child: CommandNode,
): CommandNode {
  if (path.length === 0) {
    return { ...root, chain: [...root.chain, child] };
  }
  const [head, ...rest] = path as [number, ...number[]];
  const newChain = [...root.chain];
  const node = newChain[head];
  if (!node) return root;
  newChain[head] = appendCommandAtPath(node, rest, child);
  return { ...root, chain: newChain };
}

/** Immutably remove command at path (removes the node, not its children) */
export function removeCommandAtPath(
  root: CommandNode,
  path: number[],
): CommandNode {
  if (path.length === 0) return root; // can't remove root via this fn
  const [head, ...rest] = path as [number, ...number[]];
  const newChain = [...root.chain];
  if (rest.length === 0) {
    newChain.splice(head, 1);
    return { ...root, chain: newChain };
  }
  const child = newChain[head];
  if (!child) return root;
  newChain[head] = removeCommandAtPath(child, rest);
  return { ...root, chain: newChain };
}

// ─── Exported re-exports ──────────────────────────────────────────────────────

export { AssertionKindSchema };
export type { AssertionKind };
