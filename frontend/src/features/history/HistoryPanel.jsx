import { useEffect, useState, useCallback, useRef } from 'react';
import { executionApi } from '../../services/executionApi.ts';
import { flowApi } from '../../services/flowApi.ts';
import { useFlowStore } from '../../core/state/useFlowStore.ts';

const STATUS_ICON = {
  queued: '⏳', running: '▶', passed: '✅', failed: '✗', cancelled: '⊘',
};

function fmtDuration(ms) {
  if (ms == null) return '–';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function SkeletonRows() {
  return (
    <div className="history-list">
      {[0,1,2].map(i => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}

export default function HistoryPanel({ lastRunAt }) {
  const [executions, setExecutions] = useState([]);
  const [savedFlows, setSavedFlows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFlowId, setLoadingFlowId] = useState(null);
  const [error, setError] = useState(null);
  const [section, setSection] = useState('runs');
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, flows] = await Promise.all([
        executionApi.list(),
        flowApi.list(),
      ]);
      setExecutions(list);
      setSavedFlows(flows);
    } catch (err) {
      setError(err.message ?? 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 5s so history updates after a run without tab-switching
  useEffect(() => {
    intervalRef.current = setInterval(load, 5000);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  // Also refresh immediately when ExecutionPanel signals a run completed
  useEffect(() => {
    if (lastRunAt) load();
  }, [lastRunAt, load]);

  const handleLoadFlow = async (id) => {
    setLoadingFlowId(id);
    try {
      const saved = await flowApi.get(id);
      useFlowStore.getState().loadFlow(saved.flow);
    } catch (err) {
      setError(err.message ?? 'Failed to load flow');
    } finally {
      setLoadingFlowId(null);
    }
  };

  const passed   = executions.filter(e => e.status === 'passed').length;
  const failed   = executions.filter(e => e.status === 'failed').length;
  const total    = executions.filter(e => e.status === 'passed' || e.status === 'failed').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : null;

  return (
    <section className="history-panel">
      <header className="history-head">
        <div className="history-tabs">
          <button
            className={`tab-btn ${section === 'runs' ? 'active' : ''}`}
            onClick={() => setSection('runs')}
          >Runs</button>
          <button
            className={`tab-btn ${section === 'flows' ? 'active' : ''}`}
            onClick={() => setSection('flows')}
          >Saved Flows</button>
        </div>
        <button className="copy-btn" onClick={load} disabled={loading}>
          {loading ? '…' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="panel-empty">
          <p className="panel-empty-title">Could not load data</p>
          <p className="panel-empty-desc">{error}</p>
        </div>
      )}

      {section === 'runs' && (
        <>
          {passRate !== null && (
            <div className="history-stats">
              <span className="stat-item">
                <span className="stat-val text-success">{passed}</span>
                <span className="stat-label"> passed</span>
              </span>
              <span className="stat-item">
                <span className="stat-val text-danger">{failed}</span>
                <span className="stat-label"> failed</span>
              </span>
              <span className="stat-item">
                <span className="stat-val text-accent">{passRate}%</span>
                <span className="stat-label"> pass rate</span>
              </span>
            </div>
          )}

          {loading && executions.length === 0 && <SkeletonRows />}

          {!loading && !error && executions.length === 0 && (
            <div className="panel-empty">
              <p className="panel-empty-title">No runs yet</p>
              <p className="panel-empty-desc">Run a test to start building execution history.</p>
            </div>
          )}

          {executions.length > 0 && (
            <div className="history-list">
              {executions.map(ex => (
                <div key={ex.id} className="history-row">
                  <span
                    className={`history-status status-${ex.status}`}
                    title={ex.status}
                  >
                    {STATUS_ICON[ex.status] ?? '?'}
                  </span>
                  <div className="history-info">
                    <span className="history-name">{ex.flowName}</span>
                    <span className="history-time">{fmtTime(ex.createdAt)}</span>
                  </div>
                  <div className="history-right">
                    <span className="history-dur">{fmtDuration(ex.durationMs)}</span>
                    <span className="history-steps">{ex.stepCount} steps</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {section === 'flows' && (
        <>
          {loading && savedFlows.length === 0 && <SkeletonRows />}

          {!loading && !error && savedFlows.length === 0 && (
            <div className="panel-empty">
              <p className="panel-empty-title">No saved flows</p>
              <p className="panel-empty-desc">Click "Save Flow" in the header to save your current flow.</p>
            </div>
          )}

          {savedFlows.length > 0 && (
            <div className="history-list">
              {savedFlows.map(f => (
                <div key={f.id} className="history-row">
                  <div className="history-info">
                    <span className="history-name">{f.name}</span>
                    <span className="history-time">{fmtTime(f.updatedAt)}</span>
                  </div>
                  <button
                    className="copy-btn"
                    disabled={loadingFlowId === f.id}
                    onClick={() => handleLoadFlow(f.id)}
                    title="Load this flow into the editor"
                  >
                    {loadingFlowId === f.id ? '…' : 'Load'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
