import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useFlowStore } from '../core/state/useFlowStore.js';
import { graphToLinear } from '../core/transformer/graphToLinear.js';
import ActionPalette from '../features/palette/ActionPalette.jsx';
import Canvas from '../features/canvas/Canvas.jsx';
import ConfigPanel from '../features/config/ConfigPanel.jsx';
import CodePanel from '../features/codegen/CodePanel.jsx';
import { NODE_TYPES } from '../core/model/nodeSchema.js';

export default function App() {
  const [activeType, setActiveType] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragStart = ({ active }) => {
    const data = active.data.current;
    if (data?.source === 'palette') setActiveType(data.type);
    else if (data?.source === 'canvas') {
      const flow = useFlowStore.getState().flow;
      const node = flow.nodes[data.nodeId];
      setActiveType(node?.type ?? null);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveType(null);
    if (!over) return;

    const aData = active.data.current;

    // Palette → canvas: always append to tail
    if (aData?.source === 'palette') {
      useFlowStore.getState().addNode(aData.type);
      return;
    }

    // Canvas → canvas: reorder using anchor-after semantics
    if (aData?.source === 'canvas' && active.id !== over.id) {
      const flow = useFlowStore.getState().flow;
      let ordered;
      try { ordered = graphToLinear(flow); } catch { return; }

      const fromIdx = ordered.findIndex((n) => n.id === active.id);
      const toIdx   = ordered.findIndex((n) => n.id === over.id);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;

      // Determine anchor: node active should appear AFTER in new order
      let anchorId;
      if (fromIdx < toIdx) {
        // Moving down: active lands after over
        anchorId = over.id;
      } else {
        // Moving up: active lands before over → after the element preceding over
        anchorId = toIdx === 0 ? null : ordered[toIdx - 1].id;
      }

      useFlowStore.getState().reorderNode(active.id, anchorId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="app-header">
          <h1>Cypress Test Builder</h1>
          <button
            className="reset-btn"
            onClick={() => useFlowStore.getState().resetFlow()}
          >
            Reset
          </button>
        </header>
        <main className="app-grid">
          <ActionPalette />
          <Canvas />
          <div className="right-stack">
            <ConfigPanel />
            <CodePanel />
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeType && (
          <div className={`step-card type-${activeType} drag-overlay`}>
            <div className="step-head">
              <span className={`step-icon icon-${activeType}`}>
                {NODE_TYPES[activeType]?.icon}
              </span>
              <span className="step-label">{NODE_TYPES[activeType]?.label}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
