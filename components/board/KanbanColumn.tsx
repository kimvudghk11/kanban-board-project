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

export function KanbanColumn({ column, onCardClick, onAddCard }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 w-80 flex flex-col shadow-lg border border-gray-200 dark:border-gray-700 transition-colors no-select">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">{column.title}</h2>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>
        <button
          onClick={onAddCard}
          className="text-blue-600 dark:text-purple-400 hover:text-blue-700 dark:hover:text-purple-300 transition p-1 hover:bg-blue-50 dark:hover:bg-purple-900/20 rounded-lg"
          title="새 카드 추가"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[200px]">
        <SortableContext items={column.cards.map((card) => String(card.id))} strategy={verticalListSortingStrategy}>
          {column.cards.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm">카드가 없습니다</p>
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
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
