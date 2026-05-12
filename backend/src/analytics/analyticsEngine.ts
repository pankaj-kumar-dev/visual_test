import type { Execution, ExecutionStats, FlakyStat } from '../types.ts';

// Flakiness window: only consider last N executions per flow
const HISTORY_WINDOW = 20;

// A step is "flaky" if its failure rate is between these bounds.
// Below MIN = consistently passing (not flaky).
// Above MAX = consistently broken (not flaky — just broken).
const FLAKY_MIN = 0.15;
const FLAKY_MAX = 0.85;

/**
 * Compute flakiness stats for all node IDs across a set of executions.
 *
 * Algorithm:
 * 1. For each (nodeId) pair, collect all step results across executions.
 * 2. Compute failure rate = failures / total appearances.
 * 3. Classify as flaky if FLAKY_MIN < rate < FLAKY_MAX.
 *
 * Only considers completed executions (passed | failed).
 */
export function detectFlaky(executions: Execution[]): FlakyStat[] {
  const completed = executions
    .filter((e) => e.status === 'passed' || e.status === 'failed')
    .slice(0, HISTORY_WINDOW);

  if (completed.length < 2) return []; // need at least 2 runs to detect flakiness

  // nodeId → { label, nodeType, total, failures }
  const statsMap = new Map<
    string,
    { label: string; nodeType: string; total: number; failures: number }
  >();

  for (const execution of completed) {
    for (const step of execution.stepResults) {
      const existing = statsMap.get(step.nodeId) ?? {
        label: step.label,
        nodeType: step.nodeType,
        total: 0,
        failures: 0,
      };
      existing.total++;
      if (step.status === 'failed') existing.failures++;
      statsMap.set(step.nodeId, existing);
    }
  }

  const results: FlakyStat[] = [];

  for (const [nodeId, stat] of statsMap) {
    if (stat.total < 2) continue; // not enough data
    const flakeRate = stat.failures / stat.total;
    results.push({
      nodeId,
      nodeType: stat.nodeType,
      label: stat.label,
      totalRuns: stat.total,
      failures: stat.failures,
      flakeRate: Math.round(flakeRate * 1000) / 1000,
      isFlaky: flakeRate > FLAKY_MIN && flakeRate < FLAKY_MAX,
    });
  }

  // Sort: flaky first, then by flake rate descending
  return results.sort((a, b) => {
    if (a.isFlaky !== b.isFlaky) return a.isFlaky ? -1 : 1;
    return b.flakeRate - a.flakeRate;
  });
}

/**
 * Aggregate stats across a set of executions.
 */
export function computeStats(executions: Execution[]): ExecutionStats {
  const completed = executions.filter(
    (e) => e.status === 'passed' || e.status === 'failed' || e.status === 'cancelled',
  );

  const passed = executions.filter((e) => e.status === 'passed').length;
  const failed = executions.filter((e) => e.status === 'failed').length;
  const cancelled = executions.filter((e) => e.status === 'cancelled').length;

  const durations = completed
    .map((e) => e.durationMs)
    .filter((d): d is number => d !== null)
    .sort((a, b) => a - b);

  const avgDurationMs =
    durations.length > 0
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
      : 0;

  const p95Index = Math.floor(durations.length * 0.95);
  const p95DurationMs = durations[p95Index] ?? durations[durations.length - 1] ?? 0;

  const passRateBase = passed + failed;
  const passRate = passRateBase > 0 ? Math.round((passed / passRateBase) * 1000) / 1000 : 0;

  return {
    totalExecutions: executions.length,
    passed,
    failed,
    cancelled,
    passRate,
    avgDurationMs,
    p95DurationMs,
  };
}
