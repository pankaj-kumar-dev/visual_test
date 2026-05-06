import { SELECTOR_TYPES } from '../../../core/model/nodeSchema.js';

export const Field = ({ label, children }) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
  </label>
);

export const SelectorRow = ({ params, onChange }) => (
  <>
    <Field label="Selector type">
      <select
        value={params.selectorType}
        onChange={(e) => onChange({ selectorType: e.target.value })}
      >
        {SELECTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </Field>
    <Field label="Selector">
      <input
        value={params.selector}
        placeholder={
          params.selectorType === 'data-cy' ? 'submit-btn' :
          params.selectorType === 'css'     ? '.btn-primary' :
                                              'Submit'
        }
        onChange={(e) => onChange({ selector: e.target.value })}
      />
    </Field>
  </>
);
