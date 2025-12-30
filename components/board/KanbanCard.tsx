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
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
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
  } = useSortable({ id: String(card.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500 dark:hover:border-purple-500 transform hover:-translate-y-0.5 no-select group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition line-clamp-2 flex-1">
          {card.title}
        </h3>
        {card.priority && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ml-2 whitespace-nowrap ${priorityColors[card.priority as keyof typeof priorityColors]}`}>
            {priorityLabels[card.priority as keyof typeof priorityLabels]}
          </span>
        )}
      </div>

      {card.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          {card.assignee && (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                {card.assignee.name?.[0] || card.assignee.email[0].toUpperCase()}
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {card.assignee.name || card.assignee.email.split('@')[0]}
              </span>
            </>
          )}
        </div>
        
        {card.dueDate && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{format(new Date(card.dueDate), 'MM/dd', { locale: ko })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
