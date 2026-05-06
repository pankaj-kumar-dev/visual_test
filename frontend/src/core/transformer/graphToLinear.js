/**
 * Traverse a flow graph from rootNodeId following 'success' edges.
 * Returns an ordered array of Node objects ready for codegen.
 *
 * Throws if:
 *   - flow has no rootNodeId
 *   - a cycle is detected
 *   - an edge points to a node that doesn't exist in flow.nodes
 */
export function graphToLinear(flow) {
  if (!flow.rootNodeId) throw new Error('Flow has no rootNodeId');

  const ordered = [];
  const visited = new Set();
  let curr = flow.rootNodeId;

  while (curr) {
    if (visited.has(curr)) {
      throw new Error(`Cycle detected at node "${curr}"`);
    }
    const node = flow.nodes[curr];
    if (!node) {
      throw new Error(`Edge references missing node "${curr}"`);
    }
    visited.add(curr);
    ordered.push(node);

    const outEdge = Object.values(flow.edges).find((e) => e.from === curr) ?? null;
    curr = outEdge ? outEdge.to : null;
  }

  return ordered;
}
