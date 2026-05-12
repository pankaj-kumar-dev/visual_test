import { z } from 'zod';
import type { SelectorNode, SelectorStrategy } from '../types.ts';

// ─── Zod schema ───────────────────────────────────────────────────────────────

export const SelectorStrategySchema = z.enum([
  'testId', 'role', 'label', 'placeholder', 'text', 'css', 'xpath',
]);

export const SelectorNodeSchema = z.object({
  strategy: SelectorStrategySchema,
  value:     z.string(),
  name:      z.string().optional(),
  exact:     z.boolean().optional(),
  attribute: z.string().optional(),
});

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createSelector(
  strategy: SelectorStrategy = 'testId',
  value = '',
): SelectorNode {
  return { strategy, value };
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export function displaySelector(sel: SelectorNode): string {
  switch (sel.strategy) {
    case 'testId': {
      const attr = sel.attribute ?? 'data-testid';
      return `[${attr}="${sel.value}"]`;
    }
    case 'role':
      return sel.name
        ? `role=${sel.value}[name="${sel.name}"]`
        : `role=${sel.value}`;
    case 'label':       return `label:${sel.value}`;
    case 'placeholder': return `placeholder:${sel.value}`;
    case 'text':        return `text:${sel.value}`;
    case 'css':         return sel.value;
    case 'xpath':       return `xpath:${sel.value}`;
  }
}

export const SELECTOR_STRATEGY_LABELS: Record<SelectorStrategy, string> = {
  testId:      'Test ID',
  role:        'ARIA Role',
  label:       'Label',
  placeholder: 'Placeholder',
  text:        'Text',
  css:         'CSS',
  xpath:       'XPath',
};
