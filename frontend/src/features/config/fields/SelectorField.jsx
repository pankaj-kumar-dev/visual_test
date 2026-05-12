import { SELECTOR_STRATEGY_LABELS } from '../../../core/model/selectorSchema.ts';

const STRATEGIES = Object.entries(SELECTOR_STRATEGY_LABELS);

export default function SelectorField({ value, onChange }) {
  if (!value) return null;

  const handleStrategy = (strategy) => {
    onChange({ ...value, strategy });
  };

  return (
    <div className="field-group">
      <div className="field-row">
        <label className="field-label">Strategy</label>
        <select
          className="field-select"
          value={value.strategy}
          onChange={(e) => handleStrategy(e.target.value)}
        >
          {STRATEGIES.map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
      </div>

      <div className="field-row">
        <label className="field-label">
          {value.strategy === 'role' ? 'Role' : 'Value'}
        </label>
        <input
          className="field-input"
          value={value.value}
          placeholder={placeholderFor(value.strategy)}
          onChange={(e) => onChange({ ...value, value: e.target.value })}
        />
      </div>

      {value.strategy === 'role' && (
        <div className="field-row">
          <label className="field-label">Name (optional)</label>
          <input
            className="field-input"
            value={value.name ?? ''}
            placeholder="Accessible name"
            onChange={(e) => onChange({ ...value, name: e.target.value || undefined })}
          />
        </div>
      )}

      {value.strategy === 'text' && (
        <div className="field-row">
          <label className="field-label">Exact match</label>
          <input
            type="checkbox"
            checked={value.exact !== false}
            onChange={(e) => onChange({ ...value, exact: e.target.checked })}
          />
        </div>
      )}

      {value.strategy === 'testId' && (
        <div className="field-row">
          <label className="field-label">Attribute</label>
          <input
            className="field-input"
            value={value.attribute ?? ''}
            placeholder="data-testid"
            onChange={(e) => onChange({ ...value, attribute: e.target.value || undefined })}
          />
        </div>
      )}
    </div>
  );
}

function placeholderFor(strategy) {
  switch (strategy) {
    case 'testId':      return 'submit-btn';
    case 'role':        return 'button';
    case 'label':       return 'Email';
    case 'placeholder': return 'Enter email';
    case 'text':        return 'Sign in';
    case 'css':         return '.submit-btn';
    case 'xpath':       return '//button[@type="submit"]';
    default:            return '';
  }
}
