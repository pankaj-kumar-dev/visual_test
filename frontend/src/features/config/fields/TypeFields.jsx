import { Field, SelectorRow } from './Shared.jsx';

export default function TypeFields({ params, onChange }) {
  return (
    <>
      <SelectorRow params={params} onChange={onChange} />
      <Field label="Text">
        <input
          value={params.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </Field>
      <Field label="Clear before typing">
        <input
          type="checkbox"
          checked={params.clearFirst}
          onChange={(e) => onChange({ clearFirst: e.target.checked })}
        />
      </Field>
    </>
  );
}
