import { useDraggable } from '@dnd-kit/core';

export default function DraggableAction({ action }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${action.type}`,
    data: { source: 'palette', type: action.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="palette-item"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <span className="palette-icon">{action.icon}</span>
      <span>{action.label}</span>
    </div>
  );
}
