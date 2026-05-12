import type { SelectorNode } from '../types.ts';

// ─── Escape helpers ───────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function sq(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
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
    case 'xpath':
      return sel.value;
  }
}

/**
 * Returns the full Cypress expression for a selector:
 * - Most strategies → cy.get('...')
 * - text strategy   → cy.contains('...')
 * - xpath strategy  → cy.get('...') using xpath= prefix (needs cypress-xpath)
 */
export function selectorToExpression(sel: SelectorNode): string {
  if (sel.strategy === 'text') {
    const exact = sel.exact !== false; // default true
    return exact
      ? `cy.contains(${sq(sel.value)})`
      : `cy.contains(${sq(sel.value)})`;
  }
  return `cy.get(${sq(selectorToCss(sel))})`;
}

/**
 * Inline selector string for use inside cy.get() or cy.find().
 * Callers pass this to cy.get(selectorInline(sel)).
 */
export function selectorInline(sel: SelectorNode): string {
  return sq(selectorToCss(sel));
}
