import { useState } from 'react';
import { useFlowStore, selectCanUndo, selectCanRedo } from '../core/state/useFlowStore.ts';
import ActionPalette from '../features/palette/ActionPalette.jsx';
import Canvas from '../features/canvas/Canvas.jsx';
import ConfigPanel from '../features/config/ConfigPanel.jsx';
import CodePanel from '../features/codegen/CodePanel.jsx';
import ExecutionPanel from '../features/execution/ExecutionPanel.jsx';
import HistoryPanel from '../features/history/HistoryPanel.jsx';
import AnalyticsPanel from '../features/analytics/AnalyticsPanel.jsx';
import { useUndoRedo } from '../hooks/useUndoRedo.ts';
import { flowApi } from '../services/flowApi.ts';

const RIGHT_TABS = [
  { id: 'code',      label: 'Code' },
  { id: 'run',       label: 'Run' },
  { id: 'history',   label: 'History' },
  { id: 'analytics', label: 'Analytics' },
];

export default function App() {
  const [rightTab, setRightTab] = useState('code');
  const [saveStatus, setSaveStatus] = useState(null);
  const canUndo = useFlowStore(selectCanUndo);
  const canRedo = useFlowStore(selectCanRedo);
  const flow = useFlowStore((s) => s.flow);
  useUndoRedo();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await flowApi.save(flow);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Visual Test Builder</h1>
        <div className="header-actions">
          <button className="reset-btn" disabled={!canUndo} onClick={() => useFlowStore.getState().undo()} title="Undo (Ctrl+Z)">Undo</button>
          <button className="reset-btn" disabled={!canRedo} onClick={() => useFlowStore.getState().redo()} title="Redo (Ctrl+Shift+Z)">Redo</button>
          <button
            className="reset-btn"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'error' ? 'Error ✗' : 'Save Flow'}
          </button>
          <button className="reset-btn" onClick={() => useFlowStore.getState().resetFlow()}>Reset</button>
        </div>
      </header>

      <main className="app-grid">
        <ActionPalette />
        <Canvas />
        <div className="right-stack">
          <ConfigPanel />
          <div className="right-tabs">
            <div className="tab-bar">
              {RIGHT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-btn ${rightTab === tab.id ? 'active' : ''}`}
                  onClick={() => setRightTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {rightTab === 'code'      && <CodePanel />}
              {rightTab === 'run'       && <ExecutionPanel />}
              {rightTab === 'history'   && <HistoryPanel />}
              {rightTab === 'analytics' && <AnalyticsPanel />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
