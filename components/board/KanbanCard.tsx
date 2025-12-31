'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@prisma/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { LabelBadge } from './LabelBadge';

interface KanbanCardProps {
  card: Card & {
    assignee: { id: string; name: string | null; email: string } | null;
    labels?: Array<{
      id: string;
      label: {
        id: string;
        name: string;
        color: string;
      };
    }>;
  };
  onClick: () => void;
}

const priorityConfig = {
  low: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    label: '낮음',
    icon: '⬇️',
  },
  medium: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    label: '보통',
    icon: '➡️',
  },
  high: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    label: '높음',
    icon: '⬆️',
  },
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

  const priorityData = priorityConfig[card.priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group relative bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 transform hover:-translate-y-0.5 no-select"
    >
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition line-clamp-2 flex-1 leading-snug">
          {card.title}
        </h3>
        {card.priority && (
          <div className={`flex items-center gap-1 ${priorityData.bg} ${priorityData.text} text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0 shadow-sm`}>
            <span>{priorityData.icon}</span>
            <span>{priorityData.label}</span>
          </div>
        )}
      </div>

      {/* 카드 설명 */}
      {card.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* 라벨 */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.labels.slice(0, 3).map(({ id, label }) => (
            <LabelBadge key={id} name={label.name} color={label.color} size="sm" />
          ))}
          {card.labels.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-0.5">
              +{card.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 카드 푸터 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        {/* 담당자 */}
        <div className="flex items-center gap-2">
          {card.assignee ? (
            <>
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-50 group-hover/avatar:opacity-75 transition-opacity"></div>
                <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white dark:ring-gray-800">
                  {card.assignee.name?.[0] || card.assignee.email[0].toUpperCase()}
                </div>
              </div>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium max-w-[100px] truncate">
                {card.assignee.name || card.assignee.email.split('@')[0]}
              </span>
            </>
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-600 italic flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>미할당</span>
            </div>
          )}
        </div>

        {/* 마감일 */}
        {card.dueDate && (
          <div className="flex items-center gap-1.5 text-xs">
            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition">
              <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              {format(new Date(card.dueDate), 'MM/dd', { locale: ko })}
            </span>
          </div>
        )}
      </div>

      {/* 호버 효과 */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 dark:group-hover:border-purple-500 rounded-xl pointer-events-none transition-all"></div>
    </div>
  );
}
