import type { SelectorNode } from '../types.ts';

// ─── Escape helpers ───────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ─── Selector → CSS attribute string (used inside cy.get()) ──────────────────

export function selectorToCss(sel: SelectorNode): string {
  switch (sel.strategy) {
    case 'testId': {
      const attr = sel.attribute ?? 'data-testid';
      return `[${attr}="${esc(sel.value)}"]`;
    }
    case 'role': {
      let expr = `[role="${esc(sel.value)}"]`;
      if (sel.name) expr += `[aria-label="${esc(sel.name)}"]`;
      return expr;
    }
    case 'label':
      return `[for="${esc(sel.value)}"]`;
    case 'placeholder':
      return `[placeholder="${esc(sel.value)}"]`;
    case 'css':
      return sel.value;
    case 'text':
      // text strategy must use cy.contains(), not cy.get()
      // return value raw — emitter decides which Cypress API to use
      return sel.value;
  }
}
