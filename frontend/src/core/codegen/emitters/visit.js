import { sq } from '../selector.js';

export function emitVisit(node) {
  const url = String(node.params.url ?? '').trim() || '/';
  return `cy.visit(${sq(url)});`;
}
