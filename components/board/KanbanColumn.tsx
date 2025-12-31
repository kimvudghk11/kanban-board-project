'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Card } from '@prisma/client';

interface KanbanColumnProps {
  column: {
    id: string;
    title: string;
    order?: number;
    cards: (Card & {
      assignee: { id: string; name: string | null; email: string } | null;
    })[];
  };
  onCardClick: (card: any) => void;
  onAddCard: () => void;
}

const columnColors = {
  'To Do': 'from-blue-500 to-cyan-500',
  'In Progress': 'from-yellow-500 to-orange-500',
  'Done': 'from-green-500 to-emerald-500',
};

const columnBgColors = {
  'To Do': 'bg-blue-50/80 dark:bg-blue-900/10',
  'In Progress': 'bg-yellow-50/80 dark:bg-yellow-900/10',
  'Done': 'bg-green-50/80 dark:bg-green-900/10',
};

export function KanbanColumn({ column, onCardClick, onAddCard }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const colorGradient = columnColors[column.title as keyof typeof columnColors] || 'from-gray-500 to-gray-600';
  const bgColor = columnBgColors[column.title as keyof typeof columnBgColors] || 'bg-gray-50/80 dark:bg-gray-800/50';

  return (
    <div className={`${bgColor} backdrop-blur-sm rounded-2xl p-5 w-80 flex flex-col shadow-xl border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-2xl no-select`}>
      {/* 컬럼 헤더 */}
      <div className="mb-6 pb-2">
        {/* 컬러 바 */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${colorGradient} rounded-full mb-4 shadow-lg`}></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {column.title}
            </h2>
            <span className={`bg-gradient-to-r ${colorGradient} text-white text-sm font-bold px-3 py-1 rounded-full shadow-md`}>
              {column.cards.length}
            </span>
          </div>
          <button
            onClick={onAddCard}
            className="group relative p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-purple-400 transition-all hover:scale-110 active:scale-95"
            title="새 카드 추가"
          >
            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 카드 리스트 */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-4 custom-scrollbar min-h-[300px] pr-1 pt-1">
        <SortableContext items={column.cards.map((card) => String(card.id))} strategy={verticalListSortingStrategy}>
          {column.cards.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-600">
              <div className="relative inline-block mb-3">
                <div className={`absolute inset-0 bg-gradient-to-r ${colorGradient} rounded-full blur-lg opacity-20`}></div>
                <svg className="relative w-14 h-14 mx-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm font-medium">카드가 없습니다</p>
              <p className="text-xs mt-1">+ 버튼으로 추가하세요</p>
            </div>
          ) : (
            column.cards.map((card) => (
              <KanbanCard
                key={String(card.id)}
                card={card}
                onClick={() => onCardClick(card)}
              />
            ))
          )}
        </SortableContext>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
          background-clip: padding-box;
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #475569 0%, #334155 100%);
          background-clip: padding-box;
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #64748b 0%, #475569 100%);
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
}
