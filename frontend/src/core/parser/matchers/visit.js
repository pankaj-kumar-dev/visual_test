import { unescapeSq } from '../matcherUtils.js';

// Matches: cy.visit('url');
const RE = /^cy\.visit\('((?:[^'\\]|\\.)*)'\);?$/;

export function matchVisit(line) {
  const m = line.match(RE);
  if (!m) return null;
  return { type: 'visit', params: { url: unescapeSq(m[1]) } };
}
