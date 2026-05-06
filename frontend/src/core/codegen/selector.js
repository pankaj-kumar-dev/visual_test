/**
 * Single-quote wrapping for generated Cypress string args.
 * Matches idiomatic Cypress style: cy.get('[data-cy="val"]').type('text')
 * Parser can reliably extract with regex: '[^'\\]*(?:\\.[^'\\]*)*'
 */
export const sq = (s) => `'${String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/**
 * Returns the Cypress chain-start expression for a given selector.
 *
 * data-cy  → cy.get('[data-cy="val"]')
 * css      → cy.get('.my-class')
 * text     → cy.contains('some text')
 *
 * Emitters append .click(), .type(), .should(), etc.
 * Parser matches these exact prefixes — keep output stable.
 */
export function resolveSelector(selector, selectorType) {
  const s = String(selector ?? '').trim();
  switch (selectorType) {
    case 'data-cy':
      return `cy.get('[data-cy="${s}"]')`;
    case 'css':
      return `cy.get(${sq(s)})`;
    case 'text':
      return `cy.contains(${sq(s)})`;
    default:
      throw new Error(`Unknown selectorType: "${selectorType}"`);
  }
}
