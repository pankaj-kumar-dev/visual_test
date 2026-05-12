const ASSERTION_OPTIONS = [
  { value: 'be.visible',   label: 'be.visible',   needsValue: false },
  { value: 'be.hidden',    label: 'be.hidden',    needsValue: false },
  { value: 'be.enabled',   label: 'be.enabled',   needsValue: false },
  { value: 'be.disabled',  label: 'be.disabled',  needsValue: false },
  { value: 'be.checked',   label: 'be.checked',   needsValue: false },
  { value: 'exist',        label: 'exist',        needsValue: false },
  { value: 'not.exist',    label: 'not.exist',    needsValue: false },
  { value: 'have.text',    label: 'have.text',    needsValue: true  },
  { value: 'contain.text', label: 'contain.text', needsValue: true  },
  { value: 'have.value',   label: 'have.value',   needsValue: true  },
  { value: 'have.class',   label: 'have.class',   needsValue: true  },
  { value: 'have.attr',    label: 'have.attr',    needsValue: true  },
  { value: 'include',      label: 'include',      needsValue: true  },
  { value: 'equal',        label: 'equal',        needsValue: true  },
];

export default function AssertionField({ assertion, expected, onChange }) {
  const opt = ASSERTION_OPTIONS.find((o) => o.value === assertion) ?? ASSERTION_OPTIONS[0];

  return (
    <div className="field-group">
      <div className="field-row">
        <label className="field-label">Assertion</label>
        <select
          className="field-select"
          value={assertion ?? 'be.visible'}
          onChange={(e) => onChange({ assertion: e.target.value, expected: undefined })}
        >
          {ASSERTION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {opt.needsValue && (
        <div className="field-row">
          <label className="field-label">Expected</label>
          <input
            className="field-input"
            value={expected ?? ''}
            placeholder="expected value"
            onChange={(e) => onChange({ assertion, expected: e.target.value || undefined })}
          />
        </div>
      )}
    </div>
  );
}
