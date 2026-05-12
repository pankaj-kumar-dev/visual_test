import type { IncomingFlow, RunnerEvent } from '../types.ts';

/**
 * All runners implement this interface.
 * Returns an async generator — queue worker consumes events as they arrive.
 * Swap MockRunner for CypressRunner/PlaywrightRunner without changing queue code.
 */
export interface IRunner {
  run(flow: IncomingFlow): AsyncGenerator<RunnerEvent>;
}
