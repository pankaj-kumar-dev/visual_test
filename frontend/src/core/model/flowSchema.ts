import { z } from 'zod';
import { newId } from '../../utils/id.ts';
import { TreeNodeSchema, createSuiteNode } from './treeSchema.ts';
import { migrateV1 } from '../migration/v1ToV2.ts';
import type { Flow, FlowMeta, SuiteTreeNode, TreeNode } from '../types.ts';

// ─── Zod schema (v2) ──────────────────────────────────────────────────────────

const EnvironmentSchema = z.object({
  name:    z.string(),
  baseUrl: z.string(),
});

const FrameworkTargetSchema = z.enum(['cypress', 'playwright']);

export const FlowSchema = z.object({
  version:           z.literal('2.0'),
  name:              z.string(),
  target:            FrameworkTargetSchema.default('cypress'),
  baseUrl:           z.string().default(''),
  environments:      z.array(EnvironmentSchema).default([]),
  activeEnvironment: z.string().nullable().default(null),
  tags:              z.array(z.string()).default([]),
  rootSuiteId:       z.string(),
  nodes:             z.record(z.string(), TreeNodeSchema),
  createdAt:         z.string().default(() => nowIso()),
  updatedAt:         z.string().default(() => nowIso()),
});

// ─── Referential integrity check ──────────────────────────────────────────────

function checkIntegrity(flow: Flow): string[] {
  const errs: string[] = [];
  const { nodes } = flow;

  if (!nodes[flow.rootSuiteId]) {
    errs.push(`rootSuiteId "${flow.rootSuiteId}" not found`);
  }

  for (const [id, node] of Object.entries(nodes)) {
    if (node.parentId !== null && !nodes[node.parentId]) {
      errs.push(`node "${id}" parentId "${node.parentId}" not found`);
    }
    if (node.kind === 'suite') {
      for (const childId of node.children) {
        if (!nodes[childId]) errs.push(`suite "${id}" child "${childId}" not found`);
      }
      for (const hookIds of Object.values(node.hooks)) {
        for (const hid of hookIds) {
          if (!nodes[hid]) errs.push(`suite "${id}" hook "${hid}" not found`);
        }
      }
    }
  }

  return errs;
}

// ─── parseFlow — version-aware, validates, checks integrity ──────────────────

export function parseFlow(raw: unknown): Flow {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid flow: not an object');

  const obj = raw as Record<string, unknown>;

  // Auto-migrate v1
  let candidate: unknown = raw;
  if (obj['version'] === '1.0') {
    candidate = migrateV1(raw);
  }

  const result = FlowSchema.safeParse(candidate);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(
      `Invalid flow: ${first?.path.join('.') ?? '?'} — ${first?.message ?? 'unknown'}`,
    );
  }

  const flow = result.data as Flow;

  const integrity = checkIntegrity(flow);
  if (integrity.length > 0) {
    throw new Error(`Flow integrity: ${integrity[0]}`);
  }

  return flow;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createFlow(meta: Partial<FlowMeta> = {}): Flow {
  const root: SuiteTreeNode = {
    ...createSuiteNode(meta.name ?? 'New Flow', null),
  };
  const nodes: Record<string, TreeNode> = { [root.id]: root };
  const now = nowIso();

  return {
    version:           '2.0',
    name:              meta.name              ?? 'New Flow',
    target:            meta.target            ?? 'cypress',
    baseUrl:           meta.baseUrl           ?? '',
    environments:      meta.environments      ?? [],
    activeEnvironment: meta.activeEnvironment ?? null,
    tags:              meta.tags              ?? [],
    rootSuiteId:       root.id,
    nodes,
    createdAt: now,
    updatedAt: now,
  };
}

export const nowIso = (): string => new Date().toISOString();
