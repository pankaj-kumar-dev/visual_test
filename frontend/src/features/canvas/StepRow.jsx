import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFlowStore } from '../../core/state/useFlowStore.ts';
import { displaySelector } from '../../core/model/selectorSchema.ts';

function describeCommand(cmd) {
  if (!cmd) return '—';
  switch (cmd.name) {
    case 'visit': {
      const url = cmd.args.find((a) => a.kind === 'string')?.value ?? '';
      return `visit ${url || '(url)'}`;
    }
    case 'get': {
      const s = cmd.args.find((a) => a.kind === 'selector');
      const alias = cmd.args.find((a) => a.kind === 'alias');
      if (alias) return `get @${alias.name}`;
      if (s) return `get ${displaySelector(s.value)}`;
      return 'get';
    }
    case 'contains': {
      const t = cmd.args.find((a) => a.kind === 'string')?.value ?? '';
      return `contains "${t}"`;
    }
    case 'url':   return 'url()';
    case 'title': return 'title()';
    case 'wait': {
      const n = cmd.args.find((a) => a.kind === 'number')?.value;
      return `wait ${n ?? ''}ms`;
    }
    case 'fixture': {
      const name = cmd.args.find((a) => a.kind === 'string')?.value ?? '';
      return `fixture "${name}"`;
    }
    default:
      return cmd.name;
  }
}

function ChainBadge({ cmd }) {
  const label =
    cmd.name === 'click'   ? 'click'
  : cmd.name === 'type'    ? `type "${cmd.args.find((a) => a.kind === 'string')?.value ?? ''}"`
  : cmd.name === 'clear'   ? 'clear'
  : cmd.name === 'select'  ? `select "${cmd.args.find((a) => a.kind === 'string')?.value ?? ''}"`
  : cmd.name === 'check'   ? 'check'
  : cmd.name === 'should'  ? (() => {
      const a = cmd.args.find((x) => x.kind === 'assertion');
      return a ? `should(${a.assertion}${a.expected ? `, ${a.expected}` : ''})` : 'should';
    })()
  : cmd.name === 'and'     ? (() => {
      const a = cmd.args.find((x) => x.kind === 'assertion');
      return a ? `and(${a.assertion}${a.expected ? `, ${a.expected}` : ''})` : 'and';
    })()
  : cmd.name === 'find'    ? `find ${displaySelector(cmd.args.find((a) => a.kind === 'selector')?.value ?? { strategy: 'css', value: '' })}`
  : cmd.name === 'contains' ? `contains "${cmd.args.find((a) => a.kind === 'string')?.value ?? ''}"`
  : cmd.name;

  return <span className="chain-badge">.{label}</span>;
}

function flattenChain(cmd, depth = 0) {
  const result = [{ cmd, depth }];
  for (const c of cmd.chain ?? []) {
    result.push(...flattenChain(c, depth + 1));
  }
  return result;
}

export default function StepRow({ step, nodeId, index, errors }) {
  const selection = useFlowStore((s) => s.selection);
  const setSelection = useFlowStore((s) => s.setSelection);
  const removeStep = useFlowStore((s) => s.removeStep);

  const isSelected =
    selection?.kind === 'step' &&
    selection.nodeId === nodeId &&
    selection.stepId === step.id;

  const hasError = errors?.some((e) => e.severity === 'error');
  const hasWarn  = errors?.some((e) => e.severity === 'warn');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id, data: { source: 'step', nodeId, stepId: step.id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : step.disabled ? 0.45 : 1,
  };

  const chainItems = flattenChain(step.command).slice(1); // skip root

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`step-row ${isSelected ? 'selected' : ''} ${hasError ? 'has-error' : ''} ${hasWarn ? 'has-warn' : ''} ${step.disabled ? 'disabled' : ''}`}
      onClick={() => setSelection({ kind: 'step', nodeId, stepId: step.id })}
    >
      <span className="step-drag-handle" {...attributes} {...listeners} title="Drag to reorder">⠿</span>
      <span className="step-index">{index + 1}</span>
      <span className="step-root-label">{describeCommand(step.command)}</span>
      <span className="step-chain">
        {chainItems.slice(0, 4).map(({ cmd }, i) => (
          <ChainBadge key={i} cmd={cmd} />
        ))}
        {chainItems.length > 4 && <span className="chain-badge chain-more">+{chainItems.length - 4}</span>}
      </span>
      {(hasError || hasWarn) && (
        <span className="step-err-icon" title={errors?.map((e) => e.message).join('\n')}>
          {hasError ? '⚠' : '●'}
        </span>
      )}
      <button
        className="step-remove"
        onClick={(e) => { e.stopPropagation(); removeStep(nodeId, step.id); }}
        title="Remove step"
      >
        ×
      </button>
    </div>
  );
}
