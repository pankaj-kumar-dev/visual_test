import type { SelectorNode } from '../types.ts';

// ─── Escape helper ────────────────────────────────────────────────────────────

function dq(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

// ─── SelectorNode → Playwright locator method ─────────────────────────────────
// Returns the method fragment: getByTestId("x") (without "page.")

export function selectorToLocatorMethod(sel: SelectorNode): string {
  switch (sel.strategy) {
    case 'testId':
      return `getByTestId(${dq(sel.value)})`;
    case 'role': {
      const opts = sel.name ? `, { name: ${dq(sel.name)} }` : '';
      return `getByRole(${dq(sel.value)}${opts})`;
    }
    case 'label':
      return `getByLabel(${dq(sel.value)})`;
    case 'placeholder':
      return `getByPlaceholder(${dq(sel.value)})`;
    case 'text': {
      const exact = sel.exact !== false; // default true
      return `getByText(${dq(sel.value)}, { exact: ${exact} })`;
    }
    case 'css':
      return `locator(${dq(sel.value)})`;
  }
}

/** Full locator expression: page.getByTestId("x") */
export function buildLocatorExpr(sel: SelectorNode, base = 'page'): string {
  return `${base}.${selectorToLocatorMethod(sel)}`;
}
