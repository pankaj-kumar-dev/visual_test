import { Field } from './Shared.jsx';

export default function VisitFields({ params, onChange }) {
  return (
    <Field label="URL">
      <input
        value={params.url}
        placeholder="/login or https://..."
        onChange={(e) => onChange({ url: e.target.value })}
      />
    </Field>
  );
}
