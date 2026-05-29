import { useCallback, useEffect, useRef, useState } from 'react';
import { executionApi } from '../services/executionApi.ts';
import type { Execution, ExecutionStatus, LogEntry, StepResult } from '../services/executionApi.ts';
import type { Flow } from '../core/types.ts';

export interface UseExecutionState {
  execution: Execution | null;
  status: ExecutionStatus | null;
  logs: LogEntry[];
  stepResults: StepResult[];
  running: boolean;
  error: string | null;
}

export interface UseExecutionActions {
  run(flow: Flow): Promise<void>;
  cancel(): Promise<void>;
  clear(): void;
}

export function useExecution({ onComplete }: { onComplete?: () => void } = {}): UseExecutionState & UseExecutionActions {
  const [execution, setExecution] = useState<Execution | null>(null);
  const [status, setStatus] = useState<ExecutionStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const cleanup = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const run = useCallback(async (flow: Flow) => {
    cleanup();
    setError(null);
    setLogs([]);
    setStepResults([]);
    setExecution(null);

    try {
      const ex = await executionApi.run(flow);
      setExecution(ex);
      setStatus(ex.status);

      const stop = executionApi.stream(ex.id, {
        onLog: (entry) => setLogs((prev) => [...prev, entry]),
        onStepResult: (result) => setStepResults((prev) => [...prev, result]),
        onStatus: (s) => setStatus(s),
        onComplete: (final) => {
          setExecution(final);
          setStatus(final.status);
          setLogs(final.logs);
          setStepResults(final.stepResults);
          onCompleteRef.current?.();
        },
        onError: (e) => {
          const es = e.target as EventSource;
          if (es.readyState === EventSource.CLOSED) {
            setError('Connection to backend lost');
          }
        },
      });
      cleanupRef.current = stop;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start execution');
    }
  }, [cleanup]);

  const cancel = useCallback(async () => {
    if (!execution) return;
    try {
      await executionApi.cancel(execution.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    }
  }, [execution]);

  const clear = useCallback(() => {
    cleanup();
    setExecution(null);
    setStatus(null);
    setLogs([]);
    setStepResults([]);
    setError(null);
  }, [cleanup]);

  return {
    execution,
    status,
    logs,
    stepResults,
    running: status === 'queued' || status === 'running',
    error,
    run,
    cancel,
    clear,
  };
}
