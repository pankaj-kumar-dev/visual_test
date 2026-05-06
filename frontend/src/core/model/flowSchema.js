export function createFlow(name = 'Untitled Flow', baseUrl = '') {
  return {
    version: '1.0',
    name,
    baseUrl,
    rootNodeId: null,
    nodes: {},
    edges: {},
  };
}
