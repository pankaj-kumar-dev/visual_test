import { validateChain } from './validateChain.ts';
import type {
  Flow,
  HookTreeNode,
  TestTreeNode,
  ValidationError,
  ValidationResult,
} from '../types.ts';

// ─── Main entry ───────────────────────────────────────────────────────────────

export function validateFlow(flow: Flow): ValidationResult {
  if (!flow.rootSuiteId || !flow.nodes[flow.rootSuiteId]) {
    return { valid: false, errors: [] };
  }

  const errors: ValidationError[] = [];

  for (const node of Object.values(flow.nodes)) {
    if (node.kind === 'test') {
      collectTestErrors(node, errors);
    } else if (node.kind === 'hook') {
      collectHookErrors(node, errors);
    }
  }

  // Warn on any test with only: true
  for (const node of Object.values(flow.nodes)) {
    if (node.kind === 'test' && node.only) {
      errors.push({
        severity: 'warn',
        nodeId:   node.id,
        field:    'only',
        message:  'test.only will skip all other tests — remove before committing',
      });
    }
  }

  const hasErrors = errors.some((e) => e.severity === 'error');
  return { valid: !hasErrors, errors };
}

function collectTestErrors(node: TestTreeNode, errors: ValidationError[]): void {
  if (!node.name.trim()) {
    errors.push({
      severity: 'error',
      nodeId:   node.id,
      field:    'name',
      message:  'Test name is required',
    });
  }
  for (const step of node.steps) {
    const chainErrors = validateChain(step.command, node.id, step.id);
    errors.push(...chainErrors);
  }
}

function collectHookErrors(node: HookTreeNode, errors: ValidationError[]): void {
  for (const step of node.steps) {
    const chainErrors = validateChain(step.command, node.id, step.id);
    errors.push(...chainErrors);
  }
}

// ─── Index by nodeId for O(1) UI lookup ──────────────────────────────────────

export function indexErrors(
  result: ValidationResult,
): Map<string, ValidationError[]> {
  const map = new Map<string, ValidationError[]>();
  for (const err of result.errors) {
    const existing = map.get(err.nodeId) ?? [];
    existing.push(err);
    map.set(err.nodeId, existing);
  }
  return map;
}

/** Index by nodeId+stepId for step-level lookup */
export function indexStepErrors(
  result: ValidationResult,
): Map<string, ValidationError[]> {
  const map = new Map<string, ValidationError[]>();
  for (const err of result.errors) {
    if (!err.stepId) continue;
    const key = `${err.nodeId}::${err.stepId}`;
    const existing = map.get(key) ?? [];
    existing.push(err);
    map.set(key, existing);
  }
  return map;
}
