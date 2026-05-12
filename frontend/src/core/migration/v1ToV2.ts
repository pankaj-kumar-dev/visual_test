import { newId } from '../../utils/id.ts';
import { createSuiteNode, createTestNode, createCommand, createStep } from '../model/treeSchema.ts';
import { createSelector } from '../model/selectorSchema.ts';
import type {
  ArgNode,
  AssertionKind,
  CommandNode,
  Flow,
  FlowMeta,
  SelectorNode,
  StepNode,
  SuiteTreeNode,
  TestTreeNode,
  TreeNode,
} from '../types.ts';

// ─── Loose v1 types (accepts missing fields) ──────────────────────────────────

interface V1Params {
  url?: string;
  selector?: string;
  selectorType?: string;
  text?: string;
  clearFirst?: boolean;
  assertion?: string;
  value?: string;
}

interface V1Node {
  id: string;
  type: 'visit' | 'click' | 'type' | 'assert';
  params: V1Params;
}

interface V1Edge {
  id: string;
  from: string;
  to: string;
  condition: 'success' | 'failure';
}

interface V1TestCase {
  id: string;
  name: string;
  startNodeId: string;
}

interface V1Flow {
  name?: string;
  baseUrl?: string;
  target?: string;
  rootNodeId?: string | null;
  nodes?: Record<string, V1Node>;
  edges?: Record<string, V1Edge>;
  testCases?: V1TestCase[];
  tags?: string[];
  environments?: Array<{ name: string; baseUrl: string }>;
  activeEnvironment?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ─── v1 linear traversal (mirrors old graphToLinear) ─────────────────────────

function v1Linearise(v1: V1Flow): V1Node[] {
  if (!v1.rootNodeId || !v1.nodes) return [];

  const outIndex = new Map<string, string>();
  for (const edge of Object.values(v1.edges ?? {})) {
    if (edge.condition === 'success') outIndex.set(edge.from, edge.to);
  }

  const ordered: V1Node[] = [];
  const visited = new Set<string>();
  let curr: string | null = v1.rootNodeId;

  while (curr) {
    if (visited.has(curr)) break;
    const node = v1.nodes![curr];
    if (!node) break;
    visited.add(curr);
    ordered.push(node);
    curr = outIndex.get(curr) ?? null;
  }

  return ordered;
}

function sliceNodes(
  ordered: V1Node[],
  startId: string,
  stopId: string | null,
): V1Node[] {
  const startIdx = ordered.findIndex((n) => n.id === startId);
  if (startIdx < 0) return [];
  const stopIdx = stopId ? ordered.findIndex((n) => n.id === stopId) : -1;
  return stopIdx >= 0 ? ordered.slice(startIdx, stopIdx) : ordered.slice(startIdx);
}

// ─── v1 selector → v2 SelectorNode ───────────────────────────────────────────

function v1SelectorToNode(params: V1Params): SelectorNode {
  const value = params.selector ?? '';
  switch (params.selectorType) {
    case 'data-cy':
      return createSelector('testId', value);
      // createSelector doesn't set attribute; set it manually:
    case 'text':
      return { strategy: 'text', value, exact: false };
    case 'css':
    default:
      return { strategy: 'css', value };
  }
}

// Special case for data-cy: preserve attribute
function v1DataCySelector(params: V1Params): SelectorNode {
  if (params.selectorType === 'data-cy') {
    return { strategy: 'testId', value: params.selector ?? '', attribute: 'data-cy' };
  }
  return v1SelectorToNode(params);
}

// ─── v1 AppNode → v2 StepNode ─────────────────────────────────────────────────

function v1NodeToStep(v1Node: V1Node): StepNode {
  const step = createStep();

  switch (v1Node.type) {
    case 'visit': {
      step.command = createCommand('visit', [
        { kind: 'string', value: v1Node.params.url ?? '' },
      ]);
      break;
    }

    case 'click': {
      step.command = createCommand('get', [
        { kind: 'selector', value: v1DataCySelector(v1Node.params) },
      ]);
      step.command.chain = [createCommand('click', [])];
      break;
    }

    case 'type': {
      step.command = createCommand('get', [
        { kind: 'selector', value: v1DataCySelector(v1Node.params) },
      ]);
      const typeCmd = createCommand('type', [
        { kind: 'string', value: v1Node.params.text ?? '' },
      ]);
      step.command.chain = v1Node.params.clearFirst === true
        ? [createCommand('clear', []), typeCmd]
        : [typeCmd];
      break;
    }

    case 'assert': {
      step.command = createCommand('get', [
        { kind: 'selector', value: v1DataCySelector(v1Node.params) },
      ]);
      const assertionVal = v1Node.params.value?.trim() || undefined;
      const assertArg: ArgNode = assertionVal
        ? { kind: 'assertion', assertion: (v1Node.params.assertion ?? 'be.visible') as AssertionKind, expected: assertionVal }
        : { kind: 'assertion', assertion: (v1Node.params.assertion ?? 'be.visible') as AssertionKind };
      step.command.chain = [createCommand('should', [assertArg])];
      break;
    }
  }

  return step;
}

// ─── Main migration ───────────────────────────────────────────────────────────

export function migrateV1(raw: unknown): Flow {
  const v1 = raw as V1Flow;

  const rootSuiteId = newId();
  const nodes: Record<string, TreeNode> = {};

  const rootSuite: SuiteTreeNode = {
    id:       rootSuiteId,
    kind:     'suite',
    name:     v1.name ?? 'Migrated Flow',
    parentId: null,
    children: [],
    hooks:    { beforeAll: [], beforeEach: [], afterEach: [], afterAll: [] },
  };
  nodes[rootSuiteId] = rootSuite;

  const ordered = v1Linearise(v1);
  const testCases = v1.testCases ?? [];

  if (testCases.length === 0 || !v1.rootNodeId) {
    // All nodes → one default test
    const test = createTestNode(v1.name ?? 'Test', rootSuiteId);
    test.steps = ordered.map(v1NodeToStep);
    nodes[test.id] = test;
    rootSuite.children.push(test.id);
  } else {
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i]!;
      if (!tc.startNodeId) continue; // degenerate: skip
      const nextStartId = testCases[i + 1]?.startNodeId ?? null;
      const slice = sliceNodes(ordered, tc.startNodeId, nextStartId);
      const test = createTestNode(tc.name, rootSuiteId);
      test.steps = slice.map(v1NodeToStep);
      nodes[test.id] = test;
      rootSuite.children.push(test.id);
    }
  }

  const now = new Date().toISOString();

  return {
    version:           '2.0',
    name:              v1.name              ?? 'Migrated Flow',
    target:            (v1.target as 'cypress' | 'playwright') ?? 'cypress',
    baseUrl:           v1.baseUrl           ?? '',
    environments:      v1.environments      ?? [],
    activeEnvironment: v1.activeEnvironment ?? null,
    tags:              v1.tags              ?? [],
    rootSuiteId,
    nodes,
    createdAt: v1.createdAt ?? now,
    updatedAt: now,
  };
}
