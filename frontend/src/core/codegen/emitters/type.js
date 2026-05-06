import { resolveSelector, sq } from '../selector.js';

export function emitType(node) {
  const { selector, selectorType, text, clearFirst } = node.params;
  if (selectorType === 'text') {
    throw new Error('type node does not support selectorType "text"');
  }
  const chain = clearFirst
    ? `.clear().type(${sq(text ?? '')})`
    : `.type(${sq(text ?? '')})`;
  return `${resolveSelector(selector, selectorType)}${chain};`;
}
