import { useFlowStore, selectSelectedNode } from '../../core/state/useFlowStore.js';
import { NODE_TYPES } from '../../core/model/nodeSchema.js';
import VisitFields from './fields/VisitFields.jsx';
import ClickFields from './fields/ClickFields.jsx';
import TypeFields from './fields/TypeFields.jsx';
import AssertFields from './fields/AssertFields.jsx';

const FIELDS = {
  visit:  VisitFields,
  click:  ClickFields,
  type:   TypeFields,
  assert: AssertFields,
};

export default function ConfigPanel() {
  const node       = useFlowStore(selectSelectedNode);
  const updateNode = useFlowStore((s) => s.updateNode);

  if (!node) {
    return (
      <aside className="config">
        <h3 className="panel-title">Config</h3>
        <p className="panel-hint">Select a node to edit its parameters.</p>
      </aside>
    );
  }

  const def    = NODE_TYPES[node.type];
  const Fields = FIELDS[node.type];

  return (
    <aside className="config">
      <h3 className="panel-title">
        <span className={`step-icon icon-${node.type}`}>{def?.icon}</span>
        {' '}{def?.label}
      </h3>
      <div className="config-form">
        {Fields ? (
          <Fields params={node.params} onChange={(patch) => updateNode(node.id, patch)} />
        ) : (
          <p>No editor for type "{node.type}"</p>
        )}
      </div>
    </aside>
  );
}
