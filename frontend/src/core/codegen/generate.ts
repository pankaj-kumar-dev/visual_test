import '../registry/builtinCommands.ts';
import { emitCypress } from './emitters/cypressEmitter.ts';
import { emitPlaywright } from './emitters/playwrightEmitter.ts';
import type { Flow } from '../types.ts';

export function generate(flow: Flow): string {
  if (!flow.rootSuiteId || !flow.nodes[flow.rootSuiteId]) {
    return '// Add steps to the canvas to generate code.';
  }
  return flow.target === 'playwright'
    ? emitPlaywright(flow)
    : emitCypress(flow);
}
