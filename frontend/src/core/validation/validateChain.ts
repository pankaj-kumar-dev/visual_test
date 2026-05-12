import { commandRegistry } from '../registry/commandRegistry.ts';
import type { CommandNode, ValidationError } from '../types.ts';

/**
 * Walk a CommandNode chain and collect chain-compatibility errors.
 * Returns errors with commandPath[] indicating where in the chain the error is.
 */
export function validateChain(
  root: CommandNode,
  nodeId: string,
  stepId: string,
): ValidationError[] {
  const errors: ValidationError[] = [];
  walkChain(root, nodeId, stepId, [], null, errors);
  return errors;
}

function walkChain(
  cmd: CommandNode,
  nodeId: string,
  stepId: string,
  path: number[],
  producerName: string | null,
  errors: ValidationError[],
): void {
  const def = commandRegistry.get(cmd.name);

  // Unknown command
  if (!def) {
    errors.push({
      severity:    'error',
      nodeId,
      stepId,
      commandPath: path,
      field:       'command',
      message:     `Unknown command "${cmd.name}"`,
    });
    return; // can't validate chain compatibility without def
  }

  // Chain compatibility: check this command can follow the producer
  if (producerName !== null && path.length > 0) {
    if (!def.isChainable) {
      errors.push({
        severity:    'error',
        nodeId,
        stepId,
        commandPath: path,
        field:       'chain',
        message:     `"${cmd.name}" cannot be chained (root-only command)`,
      });
    } else if (!commandRegistry.canChain(producerName, cmd.name)) {
      const producer = commandRegistry.get(producerName);
      errors.push({
        severity:    'warn',
        nodeId,
        stepId,
        commandPath: path,
        field:       'chain',
        message:     `"${cmd.name}" requires subject "${def.requires}" but "${producerName}" yields "${producer?.yields}"`,
      });
    }
  }

  // Root command must be a root command
  if (path.length === 0 && !def.isRoot) {
    errors.push({
      severity:    'error',
      nodeId,
      stepId,
      commandPath: path,
      field:       'command',
      message:     `"${cmd.name}" cannot start a step (not a root command)`,
    });
  }

  // Arg validation
  const argErrors = commandRegistry.validateArgs(cmd.name, cmd.args);
  for (const e of argErrors) {
    errors.push({
      severity:    'error',
      nodeId,
      stepId,
      commandPath: path,
      field:       e.field,
      message:     e.message,
    });
  }

  // Recurse into chain
  for (let i = 0; i < cmd.chain.length; i++) {
    walkChain(cmd.chain[i]!, nodeId, stepId, [...path, i], cmd.name, errors);
  }
}
