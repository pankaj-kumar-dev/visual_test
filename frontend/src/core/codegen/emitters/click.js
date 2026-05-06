import { resolveSelector } from '../selector.js';

export function emitClick(node) {
  const { selector, selectorType } = node.params;
  return `${resolveSelector(selector, selectorType)}.click();`;
}
