import { useEffect } from 'react';
import { useFlowStore, selectCanUndo, selectCanRedo } from '../core/state/useFlowStore.ts';

export function useUndoRedo(): { canUndo: boolean; canRedo: boolean } {
  const canUndo = useFlowStore(selectCanUndo);
  const canRedo = useFlowStore(selectCanRedo);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useFlowStore.getState().undo();
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        useFlowStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { canUndo, canRedo };
}
