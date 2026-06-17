import { create } from 'zustand';
import { createFlow, nowIso } from '../model/flowSchema.ts';
import {
  createSuiteNode,
  createTestNode,
  createHookNode,
  createStep,
  createCommand,
  patchCommandAtPath,
  appendCommandAtPath,
  removeCommandAtPath,
} from '../model/treeSchema.ts';
import { parseFlow } from '../model/flowSchema.ts';
import { commandRegistry } from '../registry/commandRegistry.ts';
import '../registry/builtinCommands.ts';
import type {
  ArgNode,
  CommandNode,
  Flow,
  FlowMeta,
  HookKind,
  HookTreeNode,
  Selection,
  StepNode,
  SuiteTreeNode,
  TestTreeNode,
  TreeNode,
} from '../types.ts';

// ─── History ──────────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

function pushPast(past: Flow[], current: Flow): Flow[] {
  return [...past, current].slice(-MAX_HISTORY);
}

// ─── Store types ──────────────────────────────────────────────────────────────

export interface FlowState {
  flow:      Flow;
  selection: Selection;
  past:      Flow[];
  future:    Flow[];
}

export interface FlowActions {
  // Suite
  addSuite(name: string, parentId: string): string;
  renameSuite(id: string, name: string): void;
  removeSuite(id: string): void;

  // Test
  addTest(name: string, parentId: string): string;
  renameTest(id: string, name: string): void;
  removeTest(id: string): void;
  setTestMeta(id: string, patch: Partial<Pick<TestTreeNode, 'tags' | 'skip' | 'only'>>): void;

  // Hook
  addHook(hookKind: HookKind, parentId: string): string;
  removeHook(id: string): void;

  // Step (targetId = test or hook id)
  addStep(targetId: string, commandName?: string, afterIndex?: number): string;
  removeStep(targetId: string, stepId: string): void;
  reorderStep(targetId: string, fromIdx: number, toIdx: number): void;
  updateStepLabel(targetId: string, stepId: string, label: string): void;
  toggleStepDisabled(targetId: string, stepId: string): void;

  // Command / chain
  updateCommand(targetId: string, stepId: string, commandPath: number[], patch: Partial<Omit<CommandNode, 'chain' | 'id'>>): void;
  appendChainCommand(targetId: string, stepId: string, commandPath: number[], commandName: string): void;
  removeChainCommand(targetId: string, stepId: string, commandPath: number[]): void;

  // Flow meta
  setFlowMeta(patch: Partial<FlowMeta>): void;
  setSelection(selection: Selection): void;
  resetFlow(): void;
  loadFlow(raw: unknown): void;
  undo(): void;
  redo(): void;
}

export type FlowStore = FlowState & FlowActions;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stamp(flow: Flow): Flow {
  return { ...flow, updatedAt: nowIso() };
}

function mutate(
  get: () => FlowStore,
  set: (s: Partial<FlowStore>) => void,
  updater: (flow: Flow) => Partial<Flow> | Flow,
): void {
  const { flow, past } = get();
  const patch = updater(flow);
  const next = stamp({ ...flow, ...patch });
  set({ flow: next, past: pushPast(past, flow), future: [] });
}

/** Collect all descendant node IDs from a suite (inclusive) */
function collectDescendants(nodes: Record<string, TreeNode>, suiteId: string): Set<string> {
  const ids = new Set<string>();
  const queue = [suiteId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    ids.add(id);
    const node = nodes[id];
    if (!node) continue;
    if (node.kind === 'suite') {
      queue.push(...node.children);
      for (const hookIds of Object.values(node.hooks)) queue.push(...hookIds as string[]);
    }
  }
  return ids;
}

function getSteps(node: TreeNode): StepNode[] {
  if (node.kind === 'test' || node.kind === 'hook') return node.steps;
  return [];
}

function withSteps(node: TestTreeNode | HookTreeNode, steps: StepNode[]): TreeNode {
  return { ...node, steps };
}

function mutateSuiteChildren(
  nodes: Record<string, TreeNode>,
  parentId: string,
  updater: (children: string[]) => string[],
): Record<string, TreeNode> {
  const parent = nodes[parentId];
  if (!parent || parent.kind !== 'suite') return nodes;
  return { ...nodes, [parentId]: { ...parent, children: updater(parent.children) } };
}

function mutateSuiteHooks(
  nodes: Record<string, TreeNode>,
  parentId: string,
  hookKind: HookKind,
  updater: (ids: string[]) => string[],
): Record<string, TreeNode> {
  const parent = nodes[parentId];
  if (!parent || parent.kind !== 'suite') return nodes;
  return {
    ...nodes,
    [parentId]: {
      ...parent,
      hooks: { ...parent.hooks, [hookKind]: updater(parent.hooks[hookKind]) },
    },
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFlowStore = create<FlowStore>((set, get) => ({
  flow:      createFlow(),
  selection: null,
  past:      [],
  future:    [],

  // ── Suite ────────────────────────────────────────────────────────────────

  addSuite(name, parentId) {
    const suite = createSuiteNode(name, parentId);
    mutate(get, set, (flow) => {
      const nodes = mutateSuiteChildren(
        { ...flow.nodes, [suite.id]: suite },
        parentId,
        (ch) => [...ch, suite.id],
      );
      return { nodes };
    });
    set({ selection: { kind: 'node', nodeId: suite.id } });
    return suite.id;
  },

  renameSuite(id, name) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[id];
      if (!node || node.kind !== 'suite') return {};
      return { nodes: { ...flow.nodes, [id]: { ...node, name } } };
    });
  },

  removeSuite(id) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[id];
      if (!node || node.kind !== 'suite' || node.parentId === null) return {};
      const toRemove = collectDescendants(flow.nodes, id);
      const nodes = { ...flow.nodes };
      for (const rid of toRemove) delete nodes[rid];
      return {
        nodes: mutateSuiteChildren(nodes, node.parentId, (ch) => ch.filter((c) => c !== id)),
      };
    });
    const { selection } = get();
    if (selection?.kind === 'node') set({ selection: null });
  },

  // ── Test ─────────────────────────────────────────────────────────────────

  addTest(name, parentId) {
    const test = createTestNode(name, parentId);
    mutate(get, set, (flow) => {
      const nodes = mutateSuiteChildren(
        { ...flow.nodes, [test.id]: test },
        parentId,
        (ch) => [...ch, test.id],
      );
      return { nodes };
    });
    set({ selection: { kind: 'node', nodeId: test.id } });
    return test.id;
  },

  renameTest(id, name) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[id];
      if (!node || node.kind !== 'test') return {};
      return { nodes: { ...flow.nodes, [id]: { ...node, name } } };
    });
  },

  removeTest(id) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[id];
      if (!node || node.kind !== 'test') return {};
      const nodes = { ...flow.nodes };
      delete nodes[id];
      return {
        nodes: mutateSuiteChildren(nodes, node.parentId, (ch) => ch.filter((c) => c !== id)),
      };
    });
    const { selection } = get();
    if (selection?.kind === 'node' && selection.nodeId === id) set({ selection: null });
  },

  setTestMeta(id, patch) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[id];
      if (!node || node.kind !== 'test') return {};
      return { nodes: { ...flow.nodes, [id]: { ...node, ...patch } } };
    });
  },

  // ── Hook ─────────────────────────────────────────────────────────────────

  addHook(hookKind, parentId) {
    const hook = createHookNode(hookKind, parentId);
    mutate(get, set, (flow) => {
      const nodes = mutateSuiteHooks(
        { ...flow.nodes, [hook.id]: hook },
        parentId,
        hookKind,
        (ids) => [...ids, hook.id],
      );
      return { nodes };
    });
    set({ selection: { kind: 'node', nodeId: hook.id } });
    return hook.id;
  },

  removeHook(id) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[id];
      if (!node || node.kind !== 'hook') return {};
      const nodes = { ...flow.nodes };
      delete nodes[id];
      return {
        nodes: mutateSuiteHooks(nodes, node.parentId, node.hookKind, (ids) => ids.filter((i) => i !== id)),
      };
    });
    const { selection } = get();
    if (selection?.kind === 'node' && selection.nodeId === id) set({ selection: null });
  },

  // ── Step ─────────────────────────────────────────────────────────────────

  addStep(targetId, commandName = 'get', afterIndex) {
    const def = commandRegistry.get(commandName);
    const step = createStep(commandName, def?.defaultArgs() ?? []);
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      const steps = [...node.steps];
      const insertAt = afterIndex !== undefined ? afterIndex + 1 : steps.length;
      steps.splice(insertAt, 0, step);
      return { nodes: { ...flow.nodes, [targetId]: withSteps(node, steps) } };
    });
    set({ selection: { kind: 'step', nodeId: targetId, stepId: step.id } });
    return step.id;
  },

  removeStep(targetId, stepId) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      return {
        nodes: {
          ...flow.nodes,
          [targetId]: withSteps(node, node.steps.filter((s) => s.id !== stepId)),
        },
      };
    });
    const { selection } = get();
    if (selection?.kind === 'step' && selection.stepId === stepId) {
      set({ selection: { kind: 'node', nodeId: targetId } });
    }
  },

  reorderStep(targetId, fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      const steps = [...node.steps];
      const [moved] = steps.splice(fromIdx, 1);
      if (!moved) return {};
      steps.splice(toIdx, 0, moved);
      return { nodes: { ...flow.nodes, [targetId]: withSteps(node, steps) } };
    });
  },

  updateStepLabel(targetId, stepId, label) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      const steps = node.steps.map((s) => s.id === stepId ? { ...s, label } : s);
      return { nodes: { ...flow.nodes, [targetId]: withSteps(node, steps) } };
    });
  },

  toggleStepDisabled(targetId, stepId) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      const steps = node.steps.map((s) =>
        s.id === stepId ? { ...s, disabled: !s.disabled } : s,
      );
      return { nodes: { ...flow.nodes, [targetId]: withSteps(node, steps) } };
    });
  },

  // ── Command ───────────────────────────────────────────────────────────────

  updateCommand(targetId, stepId, commandPath, patch) {
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      const steps = node.steps.map((s) => {
        if (s.id !== stepId) return s;
        return { ...s, command: patchCommandAtPath(s.command, commandPath, patch) };
      });
      return { nodes: { ...flow.nodes, [targetId]: withSteps(node, steps) } };
    });
  },

  appendChainCommand(targetId, stepId, commandPath, commandName) {
    const cmd = createCommand(commandName);
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      const steps = node.steps.map((s) => {
        if (s.id !== stepId) return s;
        return { ...s, command: appendCommandAtPath(s.command, commandPath, cmd) };
      });
      return { nodes: { ...flow.nodes, [targetId]: withSteps(node, steps) } };
    });
  },

  removeChainCommand(targetId, stepId, commandPath) {
    if (commandPath.length === 0) return; // can't remove root via this action
    mutate(get, set, (flow) => {
      const node = flow.nodes[targetId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return {};
      const steps = node.steps.map((s) => {
        if (s.id !== stepId) return s;
        return { ...s, command: removeCommandAtPath(s.command, commandPath) };
      });
      return { nodes: { ...flow.nodes, [targetId]: withSteps(node, steps) } };
    });
  },

  // ── Flow meta ─────────────────────────────────────────────────────────────

  setFlowMeta(patch) {
    mutate(get, set, (flow) => {
      const next: Partial<Flow> = {};
      if (patch.name              !== undefined) { next.name              = patch.name;              }
      if (patch.target            !== undefined) { next.target            = patch.target;            }
      if (patch.baseUrl           !== undefined) { next.baseUrl           = patch.baseUrl;           }
      if (patch.tags              !== undefined) { next.tags              = patch.tags;              }
      if (patch.environments      !== undefined) { next.environments      = patch.environments;      }
      if (patch.activeEnvironment !== undefined) { next.activeEnvironment = patch.activeEnvironment; }
      // Keep root suite name in sync with flow name
      if (patch.name !== undefined) {
        const root = flow.nodes[flow.rootSuiteId];
        if (root && root.kind === 'suite') {
          next.nodes = { ...flow.nodes, [flow.rootSuiteId]: { ...root, name: patch.name } };
        }
      }
      return next;
    });
  },

  setSelection(selection) {
    set({ selection }); // does NOT push to undo history
  },

  resetFlow() {
    set({ flow: createFlow(), selection: null, past: [], future: [] });
  },

  loadFlow(raw) {
    const flow = parseFlow(raw);
    set({ flow, selection: null, past: [], future: [] });
  },

  undo() {
    const { past, flow, future } = get();
    if (!past.length) return;
    const prev = past[past.length - 1]!;
    set({
      flow:      prev,
      past:      past.slice(0, -1),
      future:    [flow, ...future].slice(0, MAX_HISTORY),
      selection: null,
    });
  },

  redo() {
    const { future, flow, past } = get();
    if (!future.length) return;
    const next = future[0]!;
    set({
      flow:      next,
      future:    future.slice(1),
      past:      pushPast(past, flow),
      selection: null,
    });
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCanUndo = (s: FlowStore): boolean => s.past.length > 0;
export const selectCanRedo = (s: FlowStore): boolean => s.future.length > 0;

export const selectRootSuite = (s: FlowStore): SuiteTreeNode | null => {
  const node = s.flow.nodes[s.flow.rootSuiteId];
  return node?.kind === 'suite' ? node : null;
};

export const selectSelectedNode = (s: FlowStore): TreeNode | null => {
  if (s.selection?.kind !== 'node') return null;
  return s.flow.nodes[s.selection.nodeId] ?? null;
};

export const selectSelectedStep = (s: FlowStore): { node: TestTreeNode | HookTreeNode; step: StepNode } | null => {
  if (s.selection?.kind !== 'step') return null;
  const { nodeId, stepId } = s.selection;
  const node = s.flow.nodes[nodeId];
  if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return null;
  const step = node.steps.find((st) => st.id === stepId);
  return step ? { node: node as TestTreeNode | HookTreeNode, step } : null;
};
