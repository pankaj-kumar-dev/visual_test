import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useFlowStore } from '../../core/state/useFlowStore.ts';
import { useFlowValidation } from '../../hooks/useFlowValidation.ts';
import StepRow from './StepRow.jsx';
import { commandRegistry } from '../../core/registry/commandRegistry.ts';
import '../../core/registry/builtinCommands.ts';

export default function TestBlock({ testId }) {
  const test = useFlowStore((s) => s.flow.nodes[testId]);
  const selection = useFlowStore((s) => s.selection);
  const setSelection = useFlowStore((s) => s.setSelection);
  const renameTest = useFlowStore((s) => s.renameTest);
  const removeTest = useFlowStore((s) => s.removeTest);
  const addStep = useFlowStore((s) => s.addStep);
  const { errorsByNode, errorsByStep } = useFlowValidation();

  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!test || test.kind !== 'test') return null;

  const isSelected = selection?.kind === 'node' && selection.nodeId === testId;
  const nodeErrors = errorsByNode.get(testId) ?? [];
  const hasError = nodeErrors.some((e) => e.severity === 'error');
  const stepIds = test.steps.map((s) => s.id);
  const rootCmds = commandRegistry.rootCommands().slice(0, 6);

  const indicator = test.skip ? '⊘' : test.only ? '◉' : null;

  return (
    <div className={`test-block ${isSelected ? 'selected' : ''} ${hasError ? 'has-error' : ''}`}>
      <div
        className="test-head"
        onClick={() => setSelection({ kind: 'node', nodeId: testId })}
      >
        <button className="collapse-btn" onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="test-icon">it</span>

        {editing ? (
          <input
            className="test-name-input"
            autoFocus
            value={test.name}
            onChange={(e) => renameTest(testId, e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="test-name"
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
            title="Double-click to rename"
          >
            {test.name || '(unnamed test)'}
          </span>
        )}

        {indicator && <span className="test-indicator" title={test.skip ? 'skipped' : 'only'}>{indicator}</span>}
        {hasError && <span className="test-err-icon" title="Validation errors">⚠</span>}
        <span className="test-step-count">{test.steps.length}</span>
        <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeTest(testId); }} title="Remove test">×</button>
      </div>

      {!collapsed && (
        <div className="test-body">
          <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
            {test.steps.map((step, i) => (
              <StepRow
                key={step.id}
                step={step}
                nodeId={testId}
                index={i}
                errors={errorsByStep.get(`${testId}::${step.id}`) ?? []}
              />
            ))}
          </SortableContext>

          {test.steps.length === 0 && (
            <div className="test-empty">No steps yet — add one below</div>
          )}

          <div className="add-step-row">
            {rootCmds.map((def) => (
              <button
                key={def.name}
                className="add-step-btn"
                title={def.label}
                onClick={() => addStep(testId, def.name)}
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
