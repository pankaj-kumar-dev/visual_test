import { newId } from '../../utils/id.js';

export function createEdge(fromId, toId, condition = 'success') {
  return { id: newId(), from: fromId, to: toId, condition };
}
