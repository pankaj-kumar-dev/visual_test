import { NODE_TYPES } from '../../core/model/nodeSchema.js';

export const PALETTE_ACTIONS = Object.entries(NODE_TYPES).map(([type, def]) => ({
  type,
  label: def.label,
  icon: def.icon,
}));
