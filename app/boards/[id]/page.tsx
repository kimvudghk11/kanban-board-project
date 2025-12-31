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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 border-r-purple-600"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full blur-2xl opacity-20"></div>
            <div className="relative text-7xl">😢</div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            보드를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            삭제되었거나 접근 권한이 없는 보드입니다
          </p>
          <Link
            href="/boards"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 transition-colors no-select">
        {/* 네비게이션 */}
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/boards"
                  className="group p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-purple-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                  title="보드 목록으로"
                >
                  <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    {board.title}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {board.members.length}
                    </span>
                  </h1>
                  {board.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{board.description}</p>
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

            {/* 검색 바 */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="카드 검색... (제목, 설명, 담당자)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* 칸반 보드 */}
        <div className="container mx-auto p-6">
          <KanbanBoard
            board={board}
            onCardClick={handleCardClick}
            onAddCard={handleAddCard}
            onCardUpdate={handleCardUpdate}
            onUpdateBoard={fetchBoard}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </>
  );
}
