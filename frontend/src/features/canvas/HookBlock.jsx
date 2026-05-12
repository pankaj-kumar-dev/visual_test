import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFlowStore } from '../../core/state/useFlowStore.ts';
import { useFlowValidation } from '../../hooks/useFlowValidation.ts';
import StepRow from './StepRow.jsx';
import { commandRegistry } from '../../core/registry/commandRegistry.ts';
import '../../core/registry/builtinCommands.ts';

const HOOK_LABELS = {
  beforeAll:  'before all',
  beforeEach: 'before each',
  afterEach:  'after each',
  afterAll:   'after all',
};

export default function HookBlock({ hookId }) {
  const hook = useFlowStore((s) => s.flow.nodes[hookId]);
  const selection = useFlowStore((s) => s.selection);
  const setSelection = useFlowStore((s) => s.setSelection);
  const addStep = useFlowStore((s) => s.addStep);
  const removeHook = useFlowStore((s) => s.removeHook);
  const { errorsByStep } = useFlowValidation();

  const [collapsed, setCollapsed] = useState(false);

  if (!hook || hook.kind !== 'hook') return null;

  const isSelected = selection?.kind === 'node' && selection.nodeId === hookId;
  const stepIds = hook.steps.map((s) => s.id);

  const rootCmds = commandRegistry.rootCommands().slice(0, 6);

  return (
    <div className={`hook-block hook-${hook.hookKind} ${isSelected ? 'selected' : ''}`}>
      <div className="hook-head" onClick={() => setSelection({ kind: 'node', nodeId: hookId })}>
        <button className="collapse-btn" onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="hook-kind-label">{HOOK_LABELS[hook.hookKind] ?? hook.hookKind}</span>
        <span className="hook-step-count">{hook.steps.length} step{hook.steps.length !== 1 ? 's' : ''}</span>
        <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeHook(hookId); }} title="Remove hook">×</button>
      </div>

      {!collapsed && (
        <div className="hook-body">
          <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
            {hook.steps.map((step, i) => (
              <StepRow
                key={step.id}
                step={step}
                nodeId={hookId}
                index={i}
                errors={errorsByStep.get(`${hookId}::${step.id}`) ?? []}
              />
            ))}
          </SortableContext>

          <div className="add-step-row">
            {rootCmds.map((def) => (
              <button
                key={def.name}
                className="add-step-btn"
                title={def.label}
                onClick={() => addStep(hookId, def.name)}
              >
                {def.icon} {def.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
