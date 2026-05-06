import { parseChainStart, unescapeSq } from '../matcherUtils.js';

// Cypress 'contain' → model 'contains' (reverse of emitter's ASSERTION_MAP)
const REVERSE_MAP = { contain: 'contains', 'have.text': 'have.text', 'be.visible': 'be.visible' };

// <chain>.should('assertion', 'value');   — value optional
const RE_WITH_VAL = /^(.+)\.should\('([^']+)',\s*'((?:[^'\\]|\\.)*)'\);?$/;
const RE_NO_VAL   = /^(.+)\.should\('([^']+)'\);?$/;

export function matchAssert(line) {
  let m = line.match(RE_WITH_VAL);
  let value = '';
  let cypressAssertion;

  if (m) {
    cypressAssertion = m[2];
    value = unescapeSq(m[3]);
  } else {
    m = line.match(RE_NO_VAL);
    if (!m) return null;
    cypressAssertion = m[2];
  }

  const sel = parseChainStart(m[1]);
  if (!sel) return null;

  const assertion = REVERSE_MAP[cypressAssertion] ?? cypressAssertion;

  return {
    type: 'assert',
    params: { selector: sel.selector, selectorType: sel.selectorType, assertion, value },
  };
}
