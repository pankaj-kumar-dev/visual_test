import { resolveSelector, sq } from '../selector.js';

// Model uses 'contains'; Cypress assertion is 'contain' — map here, reverse in parser.
const ASSERTION_MAP = {
  contains: 'contain',
  'have.text': 'have.text',
  'be.visible': 'be.visible',
};

export function emitAssert(node) {
  const { selector, selectorType, assertion, value } = node.params;
  const cypressAssertion = ASSERTION_MAP[assertion] ?? assertion;
  const chain = resolveSelector(selector, selectorType);

  const needsValue = cypressAssertion === 'contain' || cypressAssertion === 'have.text';
  if (needsValue) {
    return `${chain}.should(${sq(cypressAssertion)}, ${sq(value ?? '')});`;
  }
  return `${chain}.should(${sq(cypressAssertion)});`;
}
