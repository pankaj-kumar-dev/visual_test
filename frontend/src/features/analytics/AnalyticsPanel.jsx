import { useEffect, useState, useCallback } from 'react';
import { analyticsApi } from '../../services/analyticsApi.ts';

function PassRateBar({ rate }) {
  const pct = Math.round(rate * 100);
  const cls = pct >= 80 ? 'rate-high' : pct >= 50 ? 'rate-medium' : 'rate-low';
  return (
    <div className="rate-bar-wrap">
      <div className="rate-bar-track">
        <div className={`rate-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`rate-bar-label ${cls}`}>{pct}%</span>
    </div>
  );
}

function FlakyRow({ stat }) {
  const pct    = Math.round(stat.flakeRate * 100);
  const pctCls = stat.isFlaky ? 'text-warn' : stat.flakeRate > 0.85 ? 'text-danger' : 'text-success';
  return (
    <div className={`flaky-row ${stat.isFlaky ? 'is-flaky' : ''}`}>
      <div className="flaky-info">
        <span className="flaky-label">{stat.label}</span>
        <span className="flaky-type">{stat.nodeType}</span>
      </div>
      <div className="flaky-stats">
        <span className={pctCls}>{pct}% fail</span>
        <span className="flaky-runs">{stat.totalRuns} runs</span>
        {stat.isFlaky && <span className="flaky-badge">FLAKY</span>}
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="analytics-stats">
      {[0,1,2,3].map(i => (
        <div key={i} className="astat">
          <span className="skeleton skeleton-card" style={{ height: '44px' }} />
        </div>
      ))}
      <div className="astat astat-wide">
        <span className="skeleton" style={{ height: '20px', display: 'block' }} />
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

      {loading && !stats && <SkeletonStats />}

      {error && (
        <div className="panel-empty">
          <p className="panel-empty-title">Could not load analytics</p>
          <p className="panel-empty-desc">{error}</p>
        </div>
      )}

      {!loading && !error && stats?.totalExecutions === 0 && (
        <div className="panel-empty">
          <p className="panel-empty-title">No runs yet</p>
          <p className="panel-empty-desc">Run a test to start collecting analytics data.</p>
        </div>
      )}

      {stats && stats.totalExecutions > 0 && (
        <div className="analytics-stats">
          <div className="astat">
            <span className="astat-val">{stats.totalExecutions}</span>
            <span className="astat-label">total runs</span>
          </div>
          <div className="astat">
            <span className="astat-val text-success">{stats.passed}</span>
            <span className="astat-label">passed</span>
          </div>
          <div className="astat">
            <span className="astat-val text-danger">{stats.failed}</span>
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

      {!loading && stats && stats.totalExecutions > 0 && flaky.length === 0 && (
        <p className="panel-hint">Not enough data for flaky detection (need ≥2 runs).</p>
      )}
    </section>
  );
}
