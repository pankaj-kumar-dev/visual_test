import { PALETTE_ACTIONS } from './actionDefinitions.js';
import { useFlowStore } from '../../core/state/useFlowStore.ts';

const CATEGORY_ORDER = ['query', 'action', 'assertion', 'utility'];
const CATEGORY_LABELS = {
  query:     'Query',
  action:    'Action',
  assertion: 'Assert',
  utility:   'Utility',
};

export default function ActionPalette() {
  const selection = useFlowStore((s) => s.selection);
  const addStep   = useFlowStore((s) => s.addStep);

  // Determine target: selected test or hook node
  const targetId = (() => {
    if (!selection) return null;
    if (selection.kind === 'step') return selection.nodeId;
    if (selection.kind === 'node') {
      const node = useFlowStore.getState().flow.nodes[selection.nodeId];
      if (node && (node.kind === 'test' || node.kind === 'hook')) return selection.nodeId;
    }
    return null;
  })();

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: PALETTE_ACTIONS.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  const handleClick = (commandName) => {
    if (!targetId) return;
    addStep(targetId, commandName);
  };

  return (
    <aside className="palette">
      <h3 className="panel-title">Commands</h3>
      {!targetId && (
        <p className="panel-hint">Select a test or hook to add steps.</p>
      )}
      {targetId && (
        <p className="panel-hint">Click to add step →</p>
      )}
      <div className="palette-list">
        {grouped.map(({ cat, items }) => (
          <div key={cat} className="palette-group">
            <div className="palette-group-label">{CATEGORY_LABELS[cat]}</div>
            {items.map((a) => (
              <button
                key={a.name}
                className={`palette-item ${!targetId ? 'palette-item-disabled' : ''}`}
                title={targetId ? `Add .${a.name}() step` : 'Select a test or hook first'}
                onClick={() => handleClick(a.name)}
                disabled={!targetId}
              >
                <span className="palette-icon">{a.icon}</span>
                <span className="palette-label">{a.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
