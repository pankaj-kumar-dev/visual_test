import { parseChainStart, unescapeSq } from '../matcherUtils.js';

// Try clearFirst first — more specific. Falls back to plain type.
const RE_CLEAR = /^(.+?)\.clear\(\)\.type\('((?:[^'\\]|\\.)*)'\);?$/;
const RE_TYPE  = /^(.+?)\.type\('((?:[^'\\]|\\.)*)'\);?$/;

export function matchType(line) {
  let m = line.match(RE_CLEAR);
  const clearFirst = !!m;
  if (!m) m = line.match(RE_TYPE);
  if (!m) return null;

  const sel = parseChainStart(m[1]);
  if (!sel || sel.selectorType === 'text') return null; // cy.contains().type() doesn't exist

  return {
    type: 'type',
    params: {
      selector: sel.selector,
      selectorType: sel.selectorType,
      text: unescapeSq(m[2]),
      clearFirst,
    },
  };
}
