import { create } from 'zustand';
import { createFlow } from '../model/flowSchema.js';
import { createNode } from '../model/nodeSchema.js';
import { createEdge } from '../model/edgeSchema.js';

// --- internal graph helpers (no React, pure functions) ---

function getOutEdge(flow, nodeId) {
  return Object.values(flow.edges).find((e) => e.from === nodeId) ?? null;
}

function getInEdge(flow, nodeId) {
  return Object.values(flow.edges).find((e) => e.to === nodeId) ?? null;
}

function findTail(flow) {
  if (!flow.rootNodeId) return null;
  let curr = flow.rootNodeId;
  const visited = new Set();
  while (true) {
    if (visited.has(curr)) throw new Error('Cycle detected in flow');
    visited.add(curr);
    const out = getOutEdge(flow, curr);
    if (!out) return curr;
    curr = out.to;
  }
}

// Splice nodeId out of the chain and repair the gap. Returns { edges, rootNodeId }.
function spliceOut(flow, nodeId) {
  const edges = { ...flow.edges };
  const inEdge = getInEdge(flow, nodeId);
  const outEdge = getOutEdge(flow, nodeId);
  if (inEdge) delete edges[inEdge.id];
  if (outEdge) delete edges[outEdge.id];
  if (inEdge && outEdge) {
    const bridge = createEdge(inEdge.from, outEdge.to);
    edges[bridge.id] = bridge;
  }
  const rootNodeId =
    flow.rootNodeId === nodeId ? (outEdge ? outEdge.to : null) : flow.rootNodeId;
  return { edges, rootNodeId };
}

// Insert nodeId after anchorId in an already-mutated edges dict.
function insertAfter(edges, anchorId, nodeId) {
  const result = { ...edges };
  const anchorOut = Object.values(result).find((e) => e.from === anchorId) ?? null;
  if (anchorOut) {
    delete result[anchorOut.id];
    const toNew = createEdge(anchorId, nodeId);
    const fromNew = createEdge(nodeId, anchorOut.to);
    result[toNew.id] = toNew;
    result[fromNew.id] = fromNew;
  } else {
    const toNew = createEdge(anchorId, nodeId);
    result[toNew.id] = toNew;
  }
  return result;
}

// --- store ---

export const useFlowStore = create((set, get) => ({
  flow: createFlow(),
  selectedNodeId: null,

  addNode(type, afterNodeId) {
    const flow = get().flow;
    const node = createNode(type);
    const nodes = { ...flow.nodes, [node.id]: node };

    if (!flow.rootNodeId) {
      set({ flow: { ...flow, nodes, rootNodeId: node.id }, selectedNodeId: node.id });
      return node.id;
    }

    const anchor = afterNodeId ?? findTail(flow);
    const edges = insertAfter({ ...flow.edges }, anchor, node.id);
    set({ flow: { ...flow, nodes, edges }, selectedNodeId: node.id });
    return node.id;
  },

  removeNode(id) {
    const flow = get().flow;
    if (!flow.nodes[id]) return;
    const { edges, rootNodeId } = spliceOut(flow, id);
    const nodes = { ...flow.nodes };
    delete nodes[id];
    const selectedNodeId = get().selectedNodeId === id ? null : get().selectedNodeId;
    set({ flow: { ...flow, nodes, edges, rootNodeId }, selectedNodeId });
  },

  // Move fromId to appear immediately after toId.
  // toId === null means "move to front" (become new root).
  reorderNode(fromId, toId) {
    if (fromId === toId) return;
    const flow = get().flow;

    if (toId === null) {
      if (flow.rootNodeId === fromId) return;
      const { edges, rootNodeId: existingRoot } = spliceOut(flow, fromId);
      const finalEdges = { ...edges };
      if (existingRoot) {
        const e = createEdge(fromId, existingRoot);
        finalEdges[e.id] = e;
      }
      set({ flow: { ...flow, edges: finalEdges, rootNodeId: fromId } });
      return;
    }

    const toOut = getOutEdge(flow, toId);
    if (toOut && toOut.to === fromId) return; // already in position

    const { edges: splicedEdges, rootNodeId } = spliceOut(flow, fromId);
    const edges = insertAfter(splicedEdges, toId, fromId);
    set({ flow: { ...flow, edges, rootNodeId } });
  },

  updateNode(id, partialParams) {
    const flow = get().flow;
    const node = flow.nodes[id];
    if (!node) return;
    set({
      flow: {
        ...flow,
        nodes: { ...flow.nodes, [id]: { ...node, params: { ...node.params, ...partialParams } } },
      },
    });
  },

  setFlowMeta(patch) {
    set((s) => ({ flow: { ...s.flow, ...patch } }));
  },

  setSelected(id) {
    set({ selectedNodeId: id });
  },

  resetFlow() {
    set({ flow: createFlow(), selectedNodeId: null });
  },

  loadFlow(json) {
    set({ flow: json, selectedNodeId: null });
  },
}));

// Selector helpers
export const selectSelectedNode = (s) => s.flow.nodes[s.selectedNodeId] ?? null;
