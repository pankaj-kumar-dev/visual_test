import { createEdge } from '../model/edgeSchema.js';
import { createFlow } from '../model/flowSchema.js';

/**
 * Convert an ordered Node array back into a Flow graph.
 * Used by the parser after it has matched nodes from Cypress code.
 *
 * @param {Node[]} nodes  - ordered array, index 0 is root
 * @param {object} meta   - { name?, baseUrl? } merged into the flow
 * @returns {Flow}
 */
export function linearToGraph(nodes, meta = {}) {
  if (!nodes.length) {
    return { ...createFlow(meta.name, meta.baseUrl) };
  }

  const nodesMap = {};
  const edges = {};

  for (const node of nodes) {
    nodesMap[node.id] = node;
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const edge = createEdge(nodes[i].id, nodes[i + 1].id);
    edges[edge.id] = edge;
  }

  return {
    ...createFlow(meta.name, meta.baseUrl),
    rootNodeId: nodes[0].id,
    nodes: nodesMap,
    edges,
  };
}
