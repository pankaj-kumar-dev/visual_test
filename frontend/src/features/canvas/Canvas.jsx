import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFlowStore } from '../../core/state/useFlowStore.js';
import { graphToLinear } from '../../core/transformer/graphToLinear.js';
import SortableStep from './SortableStep.jsx';
import loginFlow from '../../../examples/login-flow.json';

export default function Canvas() {
  const flow          = useFlowStore((s) => s.flow);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const setSelected   = useFlowStore((s) => s.setSelected);
  const removeNode    = useFlowStore((s) => s.removeNode);

  const orderedNodes = useMemo(() => {
    try { return graphToLinear(flow); } catch { return []; }
  }, [flow]);

  const nodeIds = orderedNodes.map((n) => n.id);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-dropzone',
    data: { source: 'canvas-empty' },
  });

  return (
    <section className="canvas">
      <header className="canvas-head">
        <input
          className="flow-name"
          value={flow.name}
          placeholder="Flow name"
          onChange={(e) => useFlowStore.getState().setFlowMeta({ name: e.target.value })}
        />
        <input
          className="flow-baseurl"
          placeholder="baseUrl (optional)"
          value={flow.baseUrl}
          onChange={(e) => useFlowStore.getState().setFlowMeta({ baseUrl: e.target.value })}
        />
        <button
          className="example-btn"
          title="Load the built-in login flow example"
          onClick={() => useFlowStore.getState().loadFlow(loginFlow)}
        >
          Example
        </button>
      </header>

      <div
        ref={setNodeRef}
        className={`canvas-drop ${isOver ? 'is-over' : ''} ${orderedNodes.length === 0 ? 'is-empty' : ''}`}
      >
        {orderedNodes.length === 0 && (
          <div className="canvas-empty-msg">Drag actions here to build a test</div>
        )}

        <SortableContext items={nodeIds} strategy={verticalListSortingStrategy}>
          {orderedNodes.map((node, i) => (
            <div key={node.id}>
              <SortableStep
                node={node}
                index={i}
                selected={node.id === selectedNodeId}
                onSelect={() => setSelected(node.id)}
                onRemove={() => removeNode(node.id)}
              />
              {i < orderedNodes.length - 1 && (
                <div className="node-connector" />
              )}
            </div>
          ))}
        </SortableContext>
      </div>
    </section>
  );
}
