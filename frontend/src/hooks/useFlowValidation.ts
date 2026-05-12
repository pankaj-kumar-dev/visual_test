import { useMemo } from 'react';
import { useFlowStore } from '../core/state/useFlowStore.ts';
import { validateFlow, indexErrors, indexStepErrors } from '../core/validation/validateFlow.ts';
import type { ValidationError, ValidationResult } from '../core/types.ts';

export interface FlowValidation extends ValidationResult {
  errorsByNode:    Map<string, ValidationError[]>;
  errorsByStep:    Map<string, ValidationError[]>;   // key: "nodeId::stepId"
  errorCount:      number;
  warnCount:       number;
}

export function useFlowValidation(): FlowValidation {
  const flow = useFlowStore((s) => s.flow);

  return useMemo(() => {
    const result = validateFlow(flow);
    return {
      ...result,
      errorsByNode: indexErrors(result),
      errorsByStep: indexStepErrors(result),
      errorCount:   result.errors.filter((e) => e.severity === 'error').length,
      warnCount:    result.errors.filter((e) => e.severity === 'warn').length,
    };
  }, [flow]);
}
