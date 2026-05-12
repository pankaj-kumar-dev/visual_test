import { useEffect, useState, useCallback } from 'react';
import { analyticsApi } from '../../services/analyticsApi.ts';

function PassRateBar({ rate }) {
  const pct = Math.round(rate * 100);
  const color = pct >= 80 ? '#4ade80' : pct >= 50 ? '#facc15' : '#ef4444';
  return (
    <div className="rate-bar-wrap">
      <div className="rate-bar-track">
        <div className="rate-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="rate-bar-label" style={{ color }}>{pct}%</span>
    </div>
  );
}

function FlakyRow({ stat }) {
  const pct = Math.round(stat.flakeRate * 100);
  const color = stat.isFlaky ? '#facc15' : stat.flakeRate > 0.85 ? '#ef4444' : '#4ade80';
  return (
    <div className={`flaky-row ${stat.isFlaky ? 'is-flaky' : ''}`}>
      <div className="flaky-info">
        <span className="flaky-label">{stat.label}</span>
        <span className="flaky-type">{stat.nodeType}</span>
      </div>
      <div className="flaky-stats">
        <span style={{ color }}>{pct}% fail</span>
        <span className="flaky-runs">{stat.totalRuns} runs</span>
        {stat.isFlaky && <span className="flaky-badge">FLAKY</span>}
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  const [stats, setStats] = useState(null);
  const [flaky, setFlaky] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, f] = await Promise.all([analyticsApi.stats(), analyticsApi.flaky()]);
      setStats(s);
      setFlaky(f);
    } catch (err) {
      setError(err.message ?? 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="analytics-panel">
      <header className="history-head">
        <h3 className="panel-title">Analytics</h3>
        <button className="copy-btn" onClick={load} disabled={loading}>
          {loading ? '…' : 'Refresh'}
        </button>
      </header>

      {error && <div className="exec-error">{error}</div>}

      {stats && (
        <div className="analytics-stats">
          <div className="astat">
            <span className="astat-val">{stats.totalExecutions}</span>
            <span className="astat-label">total runs</span>
          </div>
          <div className="astat">
            <span className="astat-val" style={{ color: '#4ade80' }}>{stats.passed}</span>
            <span className="astat-label">passed</span>
          </div>
          <div className="astat">
            <span className="astat-val" style={{ color: '#ef4444' }}>{stats.failed}</span>
            <span className="astat-label">failed</span>
          </div>
          <div className="astat">
            <span className="astat-val">{stats.avgDurationMs}ms</span>
            <span className="astat-label">avg duration</span>
          </div>
          <div className="astat astat-wide">
            <span className="astat-label">pass rate</span>
            <PassRateBar rate={stats.passRate} />
          </div>
        </div>
      )}

      {flaky.length > 0 && (
        <div className="flaky-section">
          <h4 className="flaky-title">
            Step Analysis
            {flaky.filter(f => f.isFlaky).length > 0 && (
              <span className="flaky-count">
                {flaky.filter(f => f.isFlaky).length} flaky
              </span>
            )}
          </h4>
          <div className="flaky-list">
            {flaky.map(stat => <FlakyRow key={stat.nodeId} stat={stat} />)}
          </div>
        </div>
      )}

      {!loading && stats?.totalExecutions === 0 && (
        <p className="panel-hint">Run tests to see analytics.</p>
      )}

      {!loading && stats && stats.totalExecutions > 0 && flaky.length === 0 && (
        <p className="panel-hint">Not enough data for flaky detection (need ≥2 runs).</p>
      )}
    </section>
  );
}
