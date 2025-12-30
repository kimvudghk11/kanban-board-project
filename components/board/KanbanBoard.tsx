'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { BoardWithDetails } from '@/types';
import { Card } from '@prisma/client';

interface KanbanBoardProps {
  board: BoardWithDetails;
  onCardClick: (card: Card) => void;
  onAddCard: (columnId: string) => void;
  onUpdateBoard: () => void;
}

export function KanbanBoard({
  board: initialBoard,
  onCardClick,
  onAddCard,
  onUpdateBoard,
}: KanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // 카드를 찾기
    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );
    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cards.some((card) => card.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      setBoard((prev) => {
        const activeCards = activeColumn.cards;
        const overCards = overColumn.cards;

        const activeIndex = activeCards.findIndex((card) => card.id === activeId);
        const overIndex = overId === overColumn.id
          ? overCards.length
          : overCards.findIndex((card) => card.id === overId);

        const [movedCard] = activeCards.splice(activeIndex, 1);
        overCards.splice(overIndex, 0, { ...movedCard, columnId: overColumn.id });

        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (col.id === activeColumn.id) {
              return { ...col, cards: activeCards };
            }
            if (col.id === overColumn.id) {
              return { ...col, cards: overCards };
            }
            return col;
          }),
        };
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // 같은 컬럼 내에서 이동
    const column = board.columns.find((col) =>
      col.cards.some((card) => card.id === activeId)
    );

    if (column) {
      const oldIndex = column.cards.findIndex((card) => card.id === activeId);
      const newIndex = column.cards.findIndex((card) => card.id === overId);

      if (oldIndex !== newIndex) {
        const newCards = arrayMove(column.cards, oldIndex, newIndex);

        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === column.id ? { ...col, cards: newCards } : col
          ),
        }));
      }

      // API 호출하여 서버에 업데이트
      const card = column.cards.find((c) => c.id === activeId);
      if (card) {
        try {
          await fetch(`/api/cards/${activeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              columnId: card.columnId,
              position: newIndex,
            }),
          });
          onUpdateBoard();
        } catch (error) {
          console.error('Failed to update card:', error);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="opacity-80">
            <KanbanCard card={activeCard as any} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

