import { useState } from 'react';
import { useFlowStore } from '../../core/state/useFlowStore.ts';
import TestBlock from './TestBlock.jsx';
import HookBlock from './HookBlock.jsx';

export default function SuiteBlock({ suiteId, depth = 0 }) {
  const suite = useFlowStore((s) => s.flow.nodes[suiteId]);
  const selection = useFlowStore((s) => s.selection);
  const setSelection = useFlowStore((s) => s.setSelection);
  const addTest = useFlowStore((s) => s.addTest);
  const addSuite = useFlowStore((s) => s.addSuite);
  const addHook = useFlowStore((s) => s.addHook);
  const renameSuite = useFlowStore((s) => s.renameSuite);
  const removeSuite = useFlowStore((s) => s.removeSuite);

  const [editing, setEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hookMenuOpen, setHookMenuOpen] = useState(false);

  if (!suite || suite.kind !== 'suite') return null;

  const isRoot = suite.parentId === null;
  const isSelected = selection?.kind === 'node' && selection.nodeId === suiteId;

  const allHookIds = [
    ...suite.hooks.beforeAll,
    ...suite.hooks.beforeEach,
    ...suite.hooks.afterEach,
    ...suite.hooks.afterAll,
  ];

  return (
    <div
      className={`suite-block depth-${depth} ${isSelected && !isRoot ? 'selected' : ''}`}
      style={depth > 0 ? { marginLeft: '16px' } : undefined}
    >
      {/* Suite header */}
      <div
        className={`suite-head ${isRoot ? 'suite-head-root' : ''}`}
        onClick={() => !isRoot && setSelection({ kind: 'node', nodeId: suiteId })}
      >
        <button className="collapse-btn" onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }} aria-label={collapsed ? 'Expand suite' : 'Collapse suite'}>
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="suite-icon">describe</span>

        {editing && !isRoot ? (
          <input
            className="suite-name-input"
            autoFocus
            value={suite.name}
            onChange={(e) => renameSuite(suiteId, e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="suite-name"
            onDoubleClick={(e) => { if (!isRoot) { e.stopPropagation(); setEditing(true); } }}
            title={isRoot ? suite.name : 'Double-click to rename'}
          >
            {suite.name}
          </span>
        )}

        <div className="suite-actions" onClick={(e) => e.stopPropagation()}>
          <button className="suite-action-btn" title="Add test" onClick={() => addTest('New test', suiteId)}>+ it</button>
          <button className="suite-action-btn" title="Add nested describe" onClick={() => addSuite('New suite', suiteId)}>+ describe</button>
          <div className="hook-menu-wrap">
            <button className="suite-action-btn" title="Add lifecycle hook" onClick={() => setHookMenuOpen((o) => !o)}>+ hook</button>
            {hookMenuOpen && (
              <div className="hook-menu">
                {['beforeAll', 'beforeEach', 'afterEach', 'afterAll'].map((k) => (
                  <button key={k} className="hook-menu-item" onClick={() => { addHook(k, suiteId); setHookMenuOpen(false); }}>{k}</button>
                ))}
              </div>
            )}
          </div>
          {!isRoot && (
            <button className="remove-btn" title="Remove suite" aria-label="Remove suite" onClick={() => removeSuite(suiteId)}>×</button>
          )}
        </div>
      </div>

      {/* Suite body */}
      {!collapsed && (
        <div className="suite-body">
          {/* beforeAll hooks */}
          {suite.hooks.beforeAll.map((hid) => <HookBlock key={hid} hookId={hid} />)}
          {/* beforeEach hooks */}
          {suite.hooks.beforeEach.map((hid) => <HookBlock key={hid} hookId={hid} />)}

          {/* children: nested suites + tests */}
          {suite.children.map((childId) => {
            const node = useFlowStore.getState().flow.nodes[childId];
            if (!node) return null;
            if (node.kind === 'suite') return <SuiteBlock key={childId} suiteId={childId} depth={depth + 1} />;
            if (node.kind === 'test')  return <TestBlock  key={childId} testId={childId} />;
            return null;
          })}

          {/* afterEach hooks */}
          {suite.hooks.afterEach.map((hid) => <HookBlock key={hid} hookId={hid} />)}
          {/* afterAll hooks */}
          {suite.hooks.afterAll.map((hid) => <HookBlock key={hid} hookId={hid} />)}
        </div>
      )}
    </div>
  );
}
