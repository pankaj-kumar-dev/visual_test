import { useEffect, useState, useCallback } from 'react';
import { executionApi } from '../../services/executionApi.ts';

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

export default function HistoryPanel() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await executionApi.list();
      setExecutions(list);
    } catch (err) {
      setError(err.message ?? 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const passed   = executions.filter(e => e.status === 'passed').length;
  const failed   = executions.filter(e => e.status === 'failed').length;
  const total    = executions.filter(e => e.status === 'passed' || e.status === 'failed').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : null;

  return (
    <section className="history-panel">
      <header className="history-head">
        <h3 className="panel-title">History</h3>
        <button className="copy-btn" onClick={load} disabled={loading}>
          {loading ? '…' : 'Refresh'}
        </button>
      </header>

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

      {error && (
        <div className="panel-empty">
          <p className="panel-empty-title">Could not load history</p>
          <p className="panel-empty-desc">{error}</p>
        </div>
      )}

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
    </section>
  );
}
