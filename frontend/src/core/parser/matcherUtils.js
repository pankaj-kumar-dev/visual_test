/**
 * Shared utilities for all matchers.
 * Knows the exact output format produced by selector.js + emitters.
 */

// Reverses sq() escaping: \' → '  and  \\ → \
export const unescapeSq = (s) => s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');

// data-cy:  cy.get('[data-cy="val"]')
const RE_DATA_CY = /^cy\.get\('\[data-cy="([^"]+)"\]'\)$/;
// text:     cy.contains('val')
const RE_TEXT    = /^cy\.contains\('((?:[^'\\]|\\.)*)'\)$/;
// css:      cy.get('val')  — checked last to avoid matching data-cy pattern
const RE_CSS     = /^cy\.get\('((?:[^'\\]|\\.)*)'\)$/;

/**
 * Parse the chain-start expression and return selector metadata.
 * Returns null if str doesn't match any known chain-start form.
 *
 * @param {string} str  e.g. "cy.get('[data-cy=\"submit\"]')"
 * @returns {{ selector: string, selectorType: string } | null}
 */
export function parseChainStart(str) {
  let m;
  if ((m = str.match(RE_DATA_CY))) return { selector: m[1], selectorType: 'data-cy' };
  if ((m = str.match(RE_TEXT)))    return { selector: unescapeSq(m[1]), selectorType: 'text' };
  if ((m = str.match(RE_CSS)))     return { selector: unescapeSq(m[1]), selectorType: 'css' };
  return null;
}
