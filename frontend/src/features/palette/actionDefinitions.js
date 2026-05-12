import { commandRegistry } from '../../core/registry/commandRegistry.ts';
import '../../core/registry/builtinCommands.ts';

export const PALETTE_ACTIONS = commandRegistry.rootCommands().map((def) => ({
  name:     def.name,
  label:    def.label,
  icon:     def.icon,
  category: def.category,
}));
