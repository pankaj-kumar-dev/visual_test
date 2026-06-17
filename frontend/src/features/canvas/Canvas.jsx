import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useFlowStore, selectRootSuite } from '../../core/state/useFlowStore.ts';
import SuiteBlock from './SuiteBlock.jsx';
import loginFlow    from '../../../examples/login-flow.json';
import tasksFlow    from '../../../examples/taskflow-tasks.json';

export default function Canvas() {
  const flow       = useFlowStore((s) => s.flow);
  const rootSuite  = useFlowStore(selectRootSuite);
  const reorderStep = useFlowStore((s) => s.reorderStep);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const aData = active.data.current;
    const oData = over.data.current;
    // Only handle step reorder within same parent
    if (aData?.source === 'step' && oData?.source === 'step' && aData.nodeId === oData.nodeId) {
      const nodeId = aData.nodeId;
      const node = useFlowStore.getState().flow.nodes[nodeId];
      if (!node || (node.kind !== 'test' && node.kind !== 'hook')) return;
      const fromIdx = node.steps.findIndex((s) => s.id === aData.stepId);
      const toIdx   = node.steps.findIndex((s) => s.id === oData.stepId);
      if (fromIdx >= 0 && toIdx >= 0) reorderStep(nodeId, fromIdx, toIdx);
    }
  };

  return (
    <section className="canvas">
      <header className="canvas-head">
        <input
          className="flow-name"
          value={flow.name}
          placeholder="Flow name"
          aria-label="Flow name"
          onChange={(e) => useFlowStore.getState().setFlowMeta({ name: e.target.value })}
        />
        <input
          className="flow-baseurl"
          placeholder="baseUrl"
          aria-label="Base URL"
          value={flow.baseUrl}
          onChange={(e) => useFlowStore.getState().setFlowMeta({ baseUrl: e.target.value })}
        />
        <select
          className="flow-target"
          value={flow.target}
          onChange={(e) => useFlowStore.getState().setFlowMeta({ target: e.target.value })}
        >
          <option value="cypress">Cypress</option>
          <option value="playwright">Playwright</option>
        </select>
        {flow.environments.length > 0 && (
          <select
            className="flow-target"
            value={flow.activeEnvironment ?? ''}
            onChange={(e) => useFlowStore.getState().setFlowMeta({ activeEnvironment: e.target.value || null })}
          >
            <option value="">Default env</option>
            {flow.environments.map((env) => (
              <option key={env.name} value={env.name}>{env.name}</option>
            ))}
          </select>
        )}
        <select
          className="flow-target"
          defaultValue=""
          onChange={(e) => {
            try {
              if (e.target.value === 'login')  useFlowStore.getState().loadFlow(loginFlow);
              if (e.target.value === 'tasks')  useFlowStore.getState().loadFlow(tasksFlow);
            } catch {
              window.alert('Could not load the example flow.');
            }
            e.target.value = '';
          }}
          title="Load example flow"
        >
          <option value="" disabled>Examples…</option>
          <option value="login">Login flow</option>
          <option value="tasks">Create task flow</option>
        </select>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="canvas-drop">
          {rootSuite ? (
            <SuiteBlock suiteId={rootSuite.id} depth={0} />
          ) : (
            <div className="canvas-empty-msg">Select a test or hook, then click a command in the left panel to add steps — or load an example above.</div>
          )}
        </div>
      </DndContext>
    </section>
  );
}
