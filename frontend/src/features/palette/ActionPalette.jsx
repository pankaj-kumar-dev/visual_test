import { PALETTE_ACTIONS } from './actionDefinitions.js';
import DraggableAction from './DraggableAction.jsx';

export default function ActionPalette() {
  return (
    <aside className="palette">
      <h3 className="panel-title">Actions</h3>
      <p className="panel-hint">Drag onto the canvas →</p>
      <div className="palette-list">
        {PALETTE_ACTIONS.map((a) => (
          <DraggableAction key={a.type} action={a} />
        ))}
      </div>
    </aside>
  );
}
