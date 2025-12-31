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
  filterPriority?: string;
  filterAssignee?: string;
  currentUserId?: string;
}

export function KanbanBoard({
  board: initialBoard,
  onCardClick,
  onAddCard,
  onCardUpdate,
  searchQuery = '',
  filterPriority = 'all',
  filterAssignee = 'all',
  currentUserId = '',
}: KanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // props가 변경될 때마다 로컬 상태 업데이트
  useEffect(() => {
    console.log('=== Board Updated ===');
    console.log('Columns:', initialBoard.columns.map(c => ({
      id: c.id,
      title: c.title,
      cardCount: c.cards.length,
      cards: c.cards.map(card => ({ id: card.id, title: card.title, columnId: card.columnId }))
    })));
    setBoard(initialBoard);
  }, [initialBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 검색 및 필터링
  const filteredBoard = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    
    return {
      ...board,
      columns: board.columns.map(column => ({
        ...column,
        cards: column.cards.filter(card => {
          // 검색 필터
          const matchesSearch = !searchQuery.trim() || 
            card.title.toLowerCase().includes(lowerQuery) ||
            card.description?.toLowerCase().includes(lowerQuery);

          // 우선순위 필터
          const matchesPriority = filterPriority === 'all' || card.priority === filterPriority;

          // 담당자 필터
          let matchesAssignee = true;
          if (filterAssignee === 'me') {
            matchesAssignee = card.assigneeId === currentUserId;
          } else if (filterAssignee === 'unassigned') {
            matchesAssignee = !card.assigneeId;
          } else if (filterAssignee !== 'all') {
            matchesAssignee = card.assigneeId === filterAssignee;
          }

          return matchesSearch && matchesPriority && matchesAssignee;
        }),
      })),
    };
  }, [board, searchQuery, filterPriority, filterAssignee, currentUserId]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.columns
      .flatMap((col) => col.cards)
      .find((c) => String(c.id) === String(active.id));
    
    console.log('=== Drag Start ===');
    console.log('Active Card:', card ? { id: card.id, title: card.title, columnId: card.columnId } : null);
    
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
        const newColumns = prev.columns.map(col => ({
          ...col,
          cards: [...col.cards]
        }));

        const activeColIndex = newColumns.findIndex(c => String(c.id) === String(activeColumn.id));
        const overColIndex = newColumns.findIndex(c => String(c.id) === String(overColumn.id));

        const activeCards = newColumns[activeColIndex].cards;
        const overCards = newColumns[overColIndex].cards;

        const activeIndex = activeCards.findIndex((card) => String(card.id) === activeId);
        const overIndex = overId === String(overColumn.id)
          ? overCards.length
          : overCards.findIndex((card) => String(card.id) === overId);

        const [movedCard] = activeCards.splice(activeIndex, 1);
        const updatedCard = {
          ...movedCard,
          columnId: overColumn.id,
        };
        overCards.splice(overIndex, 0, updatedCard);

        return {
          ...prev,
          columns: newColumns,
        };
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('=== Drag End ===');
    console.log('Active ID:', active.id);
    console.log('Over ID:', over?.id);
    
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

    if (!activeColumn || !overColumn) {
      console.error('Column not found!');
      return;
    }

    const card = activeColumn.cards.find((c) => String(c.id) === activeId);
    if (!card) {
      console.error('Card not found!');
      return;
    }

    console.log('Moving card:', {
      cardId: card.id,
      title: card.title,
      from: activeColumn.title,
      to: overColumn.title,
      fromColumnId: activeColumn.id,
      toColumnId: overColumn.id,
    });

    try {
      // 서버에 업데이트
      await onCardUpdate(activeId, {
        columnId: overColumn.id,
        position: 0,
      });
      
      console.log('✅ Card update successful!');
    } catch (error) {
      console.error('❌ Card update failed:', error);
      // 실패하면 원래 상태로 복구
      setBoard(initialBoard);
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
    </DndContext>
  );
}
