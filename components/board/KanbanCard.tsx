'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@prisma/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface KanbanCardProps {
  card: Card & {
    assignee: { id: string; name: string | null; email: string } | null;
  };
  onClick: () => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const priorityLabels = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3
        hover:shadow-md cursor-pointer transition-shadow
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1">{card.title}</h4>
        {card.priority && (
          <span
            className={`
              text-xs px-2 py-1 rounded-full font-medium ml-2
              ${priorityColors[card.priority as keyof typeof priorityColors]}
            `}
          >
            {priorityLabels[card.priority as keyof typeof priorityLabels]}
          </span>
        )}
      </div>

      {card.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        {card.assignee && (
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
              {card.assignee.name?.[0] || card.assignee.email[0].toUpperCase()}
            </div>
            <span className="ml-2">{card.assignee.name || card.assignee.email}</span>
          </div>
        )}
        
        {card.dueDate && (
          <div className="flex items-center">
            <span>📅 {format(new Date(card.dueDate), 'MM/dd', { locale: ko })}</span>
          </div>
        )}
      </div>
    </div>
  );
}

