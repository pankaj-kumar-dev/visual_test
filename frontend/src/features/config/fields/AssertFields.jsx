import { ASSERTIONS } from '../../../core/model/nodeSchema.js';
import { Field, SelectorRow } from './Shared.jsx';

export default function AssertFields({ params, onChange }) {
  const showValue = params.assertion !== 'be.visible';
  return (
    <>
      <SelectorRow params={params} onChange={onChange} />
      <Field label="Assertion">
        <select
          value={params.assertion}
          onChange={(e) => onChange({ assertion: e.target.value })}
        >
          {ASSERTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </Field>
      {showValue && (
        <Field label="Expected value">
          <input
            value={params.value}
            onChange={(e) => onChange({ value: e.target.value })}
          />
        </Field>
      )}
    </>
  );
}
