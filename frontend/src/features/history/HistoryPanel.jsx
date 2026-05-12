import { useEffect, useState, useCallback } from 'react';
import { executionApi } from '../../services/executionApi.ts';

const STATUS_COLOR = {
  queued: '#8a93a6', running: '#4f8cff',
  passed: '#4ade80', failed: '#ef4444', cancelled: '#8a93a6',
};

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

  const passed = executions.filter(e => e.status === 'passed').length;
  const failed = executions.filter(e => e.status === 'failed').length;
  const total  = executions.filter(e => e.status === 'passed' || e.status === 'failed').length;
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
            <span className="stat-val" style={{ color: '#4ade80' }}>{passed}</span>
            <span className="stat-label"> passed</span>
          </span>
          <span className="stat-item">
            <span className="stat-val" style={{ color: '#ef4444' }}>{failed}</span>
            <span className="stat-label"> failed</span>
          </span>
          <span className="stat-item">
            <span className="stat-val" style={{ color: '#4f8cff' }}>{passRate}%</span>
            <span className="stat-label"> pass rate</span>
          </span>
        </div>
      )}

      {error && <div className="exec-error">{error}</div>}

      {!loading && executions.length === 0 && !error && (
        <p className="panel-hint">No executions yet. Run a test to see history.</p>
      )}

      <div className="history-list">
        {executions.map(ex => (
          <div key={ex.id} className="history-row">
            <span
              className="history-status"
              style={{ color: STATUS_COLOR[ex.status] ?? '#8a93a6' }}
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
    </section>
  );
}
