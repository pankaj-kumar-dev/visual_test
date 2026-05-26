import { useFlowStore } from '../../core/state/useFlowStore.ts';
import { useExecution } from '../../hooks/useExecution.ts';

const STATUS_LABEL = {
  queued:    '⏳ Queued',
  running:   '▶ Running',
  passed:    '✅ Passed',
  failed:    '✗ Failed',
  cancelled: '⊘ Cancelled',
};

function StepRow({ result }) {
  const icon   = result.status === 'passed' ? '✓' : result.status === 'failed' ? '✗' : '–';
  const iconCls = result.status === 'passed' ? 'text-success' : result.status === 'failed' ? 'text-danger' : 'text-muted';
  return (
    <div className="exec-step">
      <span className={`exec-step-icon ${iconCls}`}>{icon}</span>
      <span className="exec-step-label">{result.label}</span>
      <span className="exec-step-dur">{result.durationMs}ms</span>
      {result.error && <span className="exec-step-error">{result.error}</span>}
    </div>
  );
}

export default function ExecutionPanel() {
  const flow = useFlowStore((s) => s.flow);
  const { status, logs, stepResults, running, error, execution, run, cancel, clear } = useExecution();

  const hasRunnableTests = Object.values(flow.nodes ?? {}).some(
    (n) => n.kind === 'test' && n.steps.length > 0 && !n.skip,
  );
  const canRun = hasRunnableTests && !running;

  const passedCount = stepResults.filter((s) => s.status === 'passed').length;
  const failedCount = stepResults.filter((s) => s.status === 'failed').length;
  const totalCount  = stepResults.length;

  return (
    <section className="exec-panel">
      <header className="exec-head">
        <h3 className="panel-title">Run</h3>
        <div className="exec-actions">
          {status && (
            <span
              className={`exec-status-badge status-${status}`}
              aria-live="assertive"
              aria-atomic="true"
            >
              {STATUS_LABEL[status] ?? status}
            </span>
          )}
          {running && <button className="copy-btn" onClick={cancel}>Cancel</button>}
          {!running && status && <button className="copy-btn" onClick={clear}>Clear</button>}
          <button
            className="run-btn"
            disabled={!canRun}
            onClick={() => run(flow)}
            title={!hasRunnableTests ? 'Add at least one test with steps first' : ''}
          >
            {running ? 'Running…' : 'Run Test'}
          </button>
        </div>
      </header>

      {error && <div className="exec-error">{error}</div>}

      {!status && !error && (
        <p className="panel-hint">
          {hasRunnableTests
            ? `${Object.values(flow.nodes).filter(n => n.kind === 'test' && !n.skip).length} test(s) ready — click Run Test.`
            : 'Add steps to a test block, then click Run Test.'}
        </p>
      )}

      {totalCount > 0 && (
        <div className="exec-summary">
          <span className="exec-summary-passed">✓ {passedCount} passed</span>
          {failedCount > 0 && <span className="exec-summary-failed">✗ {failedCount} failed</span>}
          {execution?.durationMs != null && (
            <span className="exec-summary-dur"> · {execution.durationMs}ms</span>
          )}
        </div>
      )}

      {stepResults.length > 0 && (
        <div className="exec-steps">
          {stepResults.map((r) => (
            <StepRow key={r.nodeId + r.label} result={r} />
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div className="exec-log" aria-live="polite" aria-label="Execution log">
          {logs.map((entry, i) => (
            <div key={i} className={`exec-log-line level-${entry.level}`}>
              <span className="exec-log-time">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
              {entry.message}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
