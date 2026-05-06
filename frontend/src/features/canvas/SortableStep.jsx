import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import StepNode from './StepNode.jsx';

export default function SortableStep({ node, index, selected, onSelect, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id, data: { source: 'canvas', nodeId: node.id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <StepNode
        node={node}
        index={index}
        selected={selected}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    </div>
  );
}
