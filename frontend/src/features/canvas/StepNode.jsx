import { NODE_TYPES } from '../../core/model/nodeSchema.js';

const summarize = (node) => {
  const p = node.params;
  switch (node.type) {
    case 'visit':  return p.url || '(no URL)';
    case 'click':  return p.selector ? `${p.selectorType}: ${p.selector}` : '(no selector)';
    case 'type':   return p.selector ? `${p.selector} <- "${p.text || ''}"` : '(no selector)';
    case 'assert': {
      if (p.assertion === 'be.visible') return `${p.selector} is visible`;
      return `${p.selector} ${p.assertion} "${p.value || ''}"`;
    }
    default: return '';
  }
};

export default function StepNode({ node, index, selected, onSelect, onRemove }) {
  const def = NODE_TYPES[node.type];
  return (
    <div
      className={`step-card type-${node.type} ${selected ? 'is-selected' : ''}`}
      onClick={onSelect}
    >
      <div className="step-head">
        <span className="step-index">{index + 1}</span>
        <span className={`step-icon icon-${node.type}`}>{def?.icon}</span>
        <span className="step-label">{def?.label}</span>
        <button
          className="step-remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Remove"
        >×</button>
      </div>
      <div className="step-summary">{summarize(node)}</div>
    </div>
  );
}
