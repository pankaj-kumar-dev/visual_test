import { parseChainStart } from '../matcherUtils.js';

// Matches: <chain>.click();
const RE = /^(.+)\.click\(\);?$/;

export function matchClick(line) {
  const m = line.match(RE);
  if (!m) return null;
  const sel = parseChainStart(m[1]);
  if (!sel) return null;
  return { type: 'click', params: { selector: sel.selector, selectorType: sel.selectorType } };
}
