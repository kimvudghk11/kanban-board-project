'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CardModal } from '@/components/board/CardModal';
import { NewCardModal } from '@/components/board/NewCardModal';
import { BoardWithDetails } from '@/types';
import { Card } from '@prisma/client';
import Link from 'next/link';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [board, setBoard] = useState<BoardWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [newCardColumnId, setNewCardColumnId] = useState<string>('');

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch board');
      }
      const data = await response.json();
      setBoard(data.board);
    } catch (error) {
      console.error('Error fetching board:', error);
      alert('보드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleAddCard = (columnId: string) => {
    setNewCardColumnId(columnId);
    setIsNewCardModalOpen(true);
  };

  const handleSaveCard = async (data: Partial<Card>) => {
    if (!selectedCard) return;

    try {
      const response = await fetch(`/api/cards/${selectedCard.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update card');

      await fetchBoard();
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;

    try {
      const response = await fetch(`/api/cards/${selectedCard.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete card');

      await fetchBoard();
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  const handleCreateCard = async (data: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
  }) => {
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          columnId: newCardColumnId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create card');

      await fetchBoard();
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">보드를 찾을 수 없습니다</h2>
          <Link href="/boards" className="text-blue-600 hover:underline">
            보드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/boards"
                className="text-gray-600 hover:text-gray-800"
              >
                ← 보드 목록
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {board.title}
                </h1>
                {board.description && (
                  <p className="text-sm text-gray-600 mt-1">{board.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {board.members.length} 멤버
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 칸반 보드 */}
      <div className="container mx-auto px-4 py-6">
        <KanbanBoard
          board={board}
          onCardClick={handleCardClick}
          onAddCard={handleAddCard}
          onUpdateBoard={fetchBoard}
        />
      </div>

      {/* 카드 수정 모달 */}
      <CardModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      {/* 새 카드 추가 모달 */}
      <NewCardModal
        isOpen={isNewCardModalOpen}
        onClose={() => {
          setIsNewCardModalOpen(false);
          setNewCardColumnId('');
        }}
        onSave={handleCreateCard}
      />
    </div>
  );
}

