import { useState } from 'react';
import {
  useFlowStore,
  selectSelectedNode,
  selectSelectedStep,
} from '../../core/state/useFlowStore.ts';
import { commandRegistry } from '../../core/registry/commandRegistry.ts';
import '../../core/registry/builtinCommands.ts';
import { createCommand } from '../../core/model/treeSchema.ts';
import SelectorField from './fields/SelectorField.jsx';
import AssertionField from './fields/AssertionField.jsx';

// ─── Command arg editor ───────────────────────────────────────────────────────

function ArgEditor({ arg, index, onChangeArg }) {
  if (!arg) return null;

  if (arg.kind === 'selector') {
    return (
      <SelectorField
        value={arg.value}
        onChange={(newSel) => onChangeArg(index, { ...arg, value: newSel })}
      />
    );
  }

  if (arg.kind === 'assertion') {
    return (
      <AssertionField
        assertion={arg.assertion}
        expected={arg.expected}
        onChange={({ assertion, expected }) =>
          onChangeArg(index, { ...arg, assertion, expected })
        }
      />
    );
  }

  if (arg.kind === 'string') {
    return (
      <div className="field-row">
        <label className="field-label">Value</label>
        <input
          className="field-input"
          value={arg.value}
          onChange={(e) => onChangeArg(index, { ...arg, value: e.target.value })}
        />
      </div>
    );
  }

  if (arg.kind === 'number') {
    return (
      <div className="field-row">
        <label className="field-label">Value</label>
        <input
          type="number"
          className="field-input"
          value={arg.value}
          onChange={(e) => onChangeArg(index, { ...arg, value: Number(e.target.value) })}
        />
      </div>
    );
  }

  if (arg.kind === 'alias') {
    return (
      <div className="field-row">
        <label className="field-label">Alias</label>
        <input
          className="field-input"
          value={arg.name}
          placeholder="alias name"
          onChange={(e) => onChangeArg(index, { ...arg, name: e.target.value })}
        />
      </div>
    );
  }

  return <div className="field-hint">{arg.kind} arg (not editable)</div>;
}

// ─── Single command editor ────────────────────────────────────────────────────

function CommandEditor({ cmd, commandPath, nodeId, stepId, depth = 0 }) {
  const updateCommand = useFlowStore((s) => s.updateCommand);
  const appendChain   = useFlowStore((s) => s.appendChainCommand);
  const removeChain   = useFlowStore((s) => s.removeChainCommand);
  const def = commandRegistry.get(cmd.name);

  const handleChangeArg = (argIndex, newArg) => {
    const newArgs = [...cmd.args];
    newArgs[argIndex] = newArg;
    updateCommand(nodeId, stepId, commandPath, { args: newArgs });
  };

  const handleChangeAlias = (alias) => {
    updateCommand(nodeId, stepId, commandPath, { alias: alias || undefined });
  };

  const chainableCommands = commandRegistry.all().filter((d) => d.isChainable);

  return (
    <div className={`cmd-editor depth-${depth}`} style={depth > 0 ? { marginLeft: '12px', borderLeft: '2px solid var(--border)', paddingLeft: '8px' } : undefined}>
      <div className="cmd-editor-head">
        <span className="cmd-name">.{cmd.name}()</span>
        {commandPath.length > 0 && (
          <button
            className="cmd-remove-btn"
            onClick={() => removeChain(nodeId, stepId, commandPath)}
            title="Remove this command"
            aria-label="Remove this command"
          >×</button>
        )}
      </div>

      {/* Args */}
      {cmd.args.map((arg, i) => (
        <ArgEditor key={i} arg={arg} index={i} onChangeArg={handleChangeArg} />
      ))}

      {/* Alias */}
      <div className="field-row">
        <label className="field-label">Alias</label>
        <input
          className="field-input"
          value={cmd.alias ?? ''}
          placeholder="(none)"
          onChange={(e) => handleChangeAlias(e.target.value)}
        />
      </div>

      {/* Chained commands (recursive) */}
      {cmd.chain.map((chainCmd, i) => (
        <CommandEditor
          key={chainCmd.id}
          cmd={chainCmd}
          commandPath={[...commandPath, i]}
          nodeId={nodeId}
          stepId={stepId}
          depth={depth + 1}
        />
      ))}

      {/* Append chain command */}
      <div className="add-chain-row">
        <select
          className="field-select add-chain-select"
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            const def = commandRegistry.get(e.target.value);
            if (!def) return;
            appendChain(nodeId, stepId, commandPath, e.target.value);
            e.target.value = '';
          }}
        >
          <option value="">+ chain command…</option>
          {chainableCommands.map((d) => (
            <option key={d.name} value={d.name}>{d.icon} .{d.name}()</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Step editor ──────────────────────────────────────────────────────────────

function StepEditor({ nodeId, step }) {
  return (
    <div className="step-editor">
      <div className="config-section-title">Step — {step.command.name}</div>
      <CommandEditor
        cmd={step.command}
        commandPath={[]}
        nodeId={nodeId}
        stepId={step.id}
        depth={0}
      />
    </div>
  );
}

// ─── Node editors ─────────────────────────────────────────────────────────────

function SuiteEditor({ node }) {
  const renameSuite = useFlowStore((s) => s.renameSuite);
  return (
    <div className="node-editor">
      <div className="config-section-title">describe block</div>
      <div className="field-row">
        <label className="field-label">Name</label>
        <input
          className="field-input"
          value={node.name}
          onChange={(e) => renameSuite(node.id, e.target.value)}
        />
      </div>
      {node.parallel !== undefined && (
        <div className="field-row">
          <label className="field-label">Parallel</label>
          <input type="checkbox" checked={!!node.parallel} readOnly />
        </div>
      )}
    </div>
  );
}

function TestEditor({ node }) {
  const renameTest   = useFlowStore((s) => s.renameTest);
  const setTestMeta  = useFlowStore((s) => s.setTestMeta);

  return (
    <div className="node-editor">
      <div className="config-section-title">it block</div>
      <div className="field-row">
        <label className="field-label">Name</label>
        <input
          className="field-input"
          value={node.name}
          onChange={(e) => renameTest(node.id, e.target.value)}
        />
      </div>
      <div className="field-row">
        <label className="field-label">Tags</label>
        <input
          className="field-input"
          value={(node.tags ?? []).join(', ')}
          placeholder="smoke, regression"
          onChange={(e) =>
            setTestMeta(node.id, {
              tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
            })
          }
        />
      </div>
      <div className="field-row">
        <label className="field-label">Skip</label>
        <input
          type="checkbox"
          checked={!!node.skip}
          onChange={(e) => setTestMeta(node.id, { skip: e.target.checked })}
        />
      </div>
      <div className="field-row">
        <label className="field-label">Only</label>
        <input
          type="checkbox"
          checked={!!node.only}
          onChange={(e) => setTestMeta(node.id, { only: e.target.checked })}
        />
        {node.only && <span className="field-warn">⚠ skips all other tests</span>}
      </div>
      <p className="panel-hint">{node.steps.length} step{node.steps.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

function HookEditor({ node }) {
  const HOOK_LABELS = {
    beforeAll: 'before all', beforeEach: 'before each',
    afterEach: 'after each', afterAll: 'after all',
  };
  return (
    <div className="node-editor">
      <div className="config-section-title">{HOOK_LABELS[node.hookKind] ?? node.hookKind}</div>
      <p className="panel-hint">{node.steps.length} step{node.steps.length !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Node context header ──────────────────────────────────────────────────────

const NODE_KIND_LABEL = {
  suite: 'describe',
  test:  'it',
  hook:  'hook',
};

function NodeContextHeader({ node }) {
  const kind  = NODE_KIND_LABEL[node.kind] ?? node.kind;
  const name  = node.name ?? '';
  return (
    <div className="config-node-header">
      <span className="config-node-kind">{kind}</span>
      <span className="config-node-name">{name}</span>
    </div>
  );
}

// ─── Main ConfigPanel ─────────────────────────────────────────────────────────

export default function ConfigPanel() {
  const node    = useFlowStore(selectSelectedNode);
  const stepped = useFlowStore(selectSelectedStep);

  if (stepped) {
    return (
      <aside className="config">
        <h3 className="panel-title">Config</h3>
        <NodeContextHeader node={stepped.node} />
        <StepEditor nodeId={stepped.node.id} step={stepped.step} />
      </aside>
    );
  }

  if (!node) {
    return (
      <aside className="config">
        <h3 className="panel-title">Config</h3>
        <p className="panel-hint">Select a test, hook, or step to edit.</p>
      </aside>
    );
  }

  return (
    <aside className="config">
      <h3 className="panel-title">Config</h3>
      <NodeContextHeader node={node} />
      {node.kind === 'suite' && <SuiteEditor node={node} />}
      {node.kind === 'test'  && <TestEditor  node={node} />}
      {node.kind === 'hook'  && <HookEditor  node={node} />}
    </aside>
  );
}
