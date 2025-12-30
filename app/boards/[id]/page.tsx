'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CardModal } from '@/components/board/CardModal';
import { NewCardModal } from '@/components/board/NewCardModal';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';
import { BoardWithDetails } from '@/types';
import { Card } from '@prisma/client';
import Link from 'next/link';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const boardId = params.id as string;

  const [board, setBoard] = useState<BoardWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [newCardColumnId, setNewCardColumnId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleCardUpdate = async (cardId: string, updates: Partial<Card>) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update card');

      await fetchBoard();
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  const handleCardDelete = async (cardId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete card');

      await fetchBoard();
      setIsCardModalOpen(false);
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  const handleNewCard = async (data: { title: string; description: string }) => {
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
      setIsNewCardModalOpen(false);
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-purple-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            보드를 찾을 수 없습니다
          </h2>
          <Link
            href="/boards"
            className="text-blue-600 dark:text-purple-400 hover:underline font-semibold"
          >
            보드 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        card={selectedCard}
        onUpdate={handleCardUpdate}
        onDelete={handleCardDelete}
      />
      <NewCardModal
        isOpen={isNewCardModalOpen}
        onClose={() => setIsNewCardModalOpen(false)}
        onSave={handleNewCard}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors no-select">
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/boards"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{board.title}</h1>
                  {board.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{board.description}</p>
                  )}
                </div>
              </div>
              {session && (
                <ProfileDropdown
                  userEmail={session.user.email!}
                  userName={session.user.name}
                />
              )}
            </div>

            <div className="mt-4">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="카드 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-6">
          <KanbanBoard
            board={board}
            onCardClick={handleCardClick}
            onAddCard={handleAddCard}
            onCardUpdate={handleCardUpdate}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </>
  );
}
