'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column, Card } from '@prisma/client';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column & {
    cards: (Card & {
      assignee: { id: string; name: string | null; email: string } | null;
    })[];
  };
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string) => void;
}

export function KanbanColumn({ column, onCardClick, onAddCard }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="bg-gray-100 rounded-lg p-4 min-w-[300px] max-w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center">
          {column.title}
          <span className="ml-2 text-sm text-gray-500">
            ({column.cards.length})
          </span>
        </h3>
        <button
          onClick={() => onAddCard(column.id)}
          className="text-gray-600 hover:text-gray-800 text-xl"
          title="카드 추가"
        >
          +
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="min-h-[200px]"
      >
        <SortableContext
          items={column.cards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

