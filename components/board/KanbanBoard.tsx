'use client';

import { useState, useMemo, useEffect } from 'react';
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
  onCardUpdate: (cardId: string, updates: Partial<Card>) => Promise<void>;
  searchQuery?: string;
}

export function KanbanBoard({
  board: initialBoard,
  onCardClick,
  onAddCard,
  onCardUpdate,
  searchQuery = '',
}: KanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // 외부에서 보드 데이터가 업데이트되면 내부 상태도 업데이트
  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 검색 필터링
  const filteredBoard = useMemo(() => {
    if (!searchQuery.trim()) {
      return board;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return {
      ...board,
      columns: board.columns.map(column => ({
        ...column,
        cards: column.cards.filter(card =>
          card.title.toLowerCase().includes(lowerQuery) ||
          card.description?.toLowerCase().includes(lowerQuery)
        ),
      })),
    };
  }, [board, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.columns
      .flatMap((col) => col.cards)
      .find((c) => String(c.id) === String(active.id));
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => String(card.id) === activeId)
    );
    const overColumn = board.columns.find(
      (col) => String(col.id) === overId || col.cards.some((card) => String(card.id) === overId)
    );

    if (!activeColumn || !overColumn) return;

    if (String(activeColumn.id) !== String(overColumn.id)) {
      setBoard((prev) => {
        const activeCards = [...activeColumn.cards];
        const overCards = [...overColumn.cards];

        const activeIndex = activeCards.findIndex((card) => String(card.id) === activeId);
        const overIndex = overId === String(overColumn.id)
          ? overCards.length
          : overCards.findIndex((card) => String(card.id) === overId);

        // 카드를 제거하고 복사
        const [movedCard] = activeCards.splice(activeIndex, 1);
        
        // 카드를 새 컬럼에 추가 (모든 속성을 유지)
        const updatedCard = {
          ...movedCard,
          columnId: overColumn.id,
        };
        overCards.splice(overIndex, 0, updatedCard);

        return {
          ...prev,
          columns: prev.columns.map((col) => {
            if (String(col.id) === String(activeColumn.id)) {
              return { ...col, cards: activeCards };
            }
            if (String(col.id) === String(overColumn.id)) {
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

    const activeId = String(active.id);
    const overId = String(over.id);

    // 현재 카드가 있는 컬럼 찾기
    const activeColumn = board.columns.find((col) =>
      col.cards.some((card) => String(card.id) === activeId)
    );

    // 드롭할 위치의 컬럼 찾기
    const overColumn = board.columns.find(
      (col) => String(col.id) === overId || col.cards.some((card) => String(card.id) === overId)
    );

    if (!activeColumn || !overColumn) return;

    const card = activeColumn.cards.find((c) => String(c.id) === activeId);
    if (!card) return;

    // 같은 컬럼 내에서 이동
    if (String(activeColumn.id) === String(overColumn.id)) {
      const oldIndex = activeColumn.cards.findIndex((card) => String(card.id) === activeId);
      const newIndex = activeColumn.cards.findIndex((card) => String(card.id) === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newCards = arrayMove(activeColumn.cards, oldIndex, newIndex);

        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            String(col.id) === String(activeColumn.id) ? { ...col, cards: newCards } : col
          ),
        }));

        try {
          await onCardUpdate(activeId, {
            columnId: card.columnId,
            position: newIndex,
          });
        } catch (error) {
          console.error('Failed to update card:', error);
        }
      }
    } else {
      // 다른 컬럼으로 이동 - 서버에 업데이트
      try {
        await onCardUpdate(activeId, {
          columnId: overColumn.id,
          position: 0, // 새 컬럼의 맨 위로
        });
      } catch (error) {
        console.error('Failed to update card:', error);
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
      <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar-horizontal">
        {filteredBoard.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onCardClick={onCardClick}
            onAddCard={() => onAddCard(column.id)}
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

      <style jsx>{`
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </DndContext>
  );
}
