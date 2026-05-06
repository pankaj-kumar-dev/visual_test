import { newId } from '../../utils/id.js';

export const SELECTOR_TYPES = ['data-cy', 'css', 'text'];
export const ASSERTIONS = ['be.visible', 'contains', 'have.text'];

export const NODE_TYPES = {
  visit: {
    label: 'Visit URL',
    icon: 'V',
    defaultParams: { url: '' },
  },
  click: {
    label: 'Click',
    icon: 'C',
    defaultParams: { selector: '', selectorType: 'data-cy' },
  },
  type: {
    label: 'Type',
    icon: 'T',
    defaultParams: { selector: '', selectorType: 'data-cy', text: '', clearFirst: true },
  },
  assert: {
    label: 'Assert',
    icon: 'A',
    defaultParams: {
      selector: '',
      selectorType: 'data-cy',
      assertion: 'be.visible',
      value: '',
    },
  },
};

export function createNode(type, overrides = {}) {
  if (!NODE_TYPES[type]) throw new Error(`Unknown node type: "${type}"`);
  return {
    id: newId(),
    type,
    params: { ...NODE_TYPES[type].defaultParams },
    position: { x: 0, y: 0 },
    ...overrides,
  };
}
