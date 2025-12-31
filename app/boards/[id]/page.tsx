'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { CardDetailModal } from '@/components/board/CardDetailModal';
import { CardEditModal } from '@/components/board/CardEditModal';
import { NewCardModal } from '@/components/board/NewCardModal';
import { InviteMemberModal } from '@/components/board/InviteMemberModal';
import { TeamMemberSection } from '@/components/board/TeamMemberSection';
import { LabelManager } from '@/components/board/LabelManager';
import { ColumnManager } from '@/components/board/ColumnManager';
import { ActivityFeed } from '@/components/board/ActivityFeed';
import { DueDateReminder } from '@/components/board/DueDateReminder';
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
  const [isCardDetailModalOpen, setIsCardDetailModalOpen] = useState(false);
  const [isCardEditModalOpen, setIsCardEditModalOpen] = useState(false);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [newCardColumnId, setNewCardColumnId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

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
      
      // 선택된 카드가 있으면 업데이트된 데이터로 갱신
      if (selectedCard) {
        const updatedCard = data.board.columns
          .flatMap((col: any) => col.cards)
          .find((card: any) => card.id === selectedCard.id);
        if (updatedCard) {
          setSelectedCard(updatedCard);
        }
      }
      
      // 활동 로그 갱신 트리거
      setActivityRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardDetailModalOpen(true);
  };

  const handleEditCard = () => {
    setIsCardDetailModalOpen(false);
    setIsCardEditModalOpen(true);
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
      setIsCardDetailModalOpen(false);
      setIsCardEditModalOpen(false);
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

  const handleInviteMember = async (email: string, role: 'admin' | 'member') => {
    try {
      const response = await fetch(`/api/boards/${boardId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '멤버 초대에 실패했습니다.');
      }

      await fetchBoard();
    } catch (error: any) {
      console.error('Error inviting member:', error);
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
      <CardDetailModal
        isOpen={isCardDetailModalOpen}
        onClose={() => {
          setIsCardDetailModalOpen(false);
          fetchBoard();
        }}
        card={selectedCard}
        onEdit={handleEditCard}
        onDelete={handleCardDelete}
        onRefresh={fetchBoard}
        currentUserId={session?.user?.id}
        boardId={boardId}
      />
      <CardEditModal
        isOpen={isCardEditModalOpen}
        onClose={() => {
          setIsCardEditModalOpen(false);
          fetchBoard();
        }}
        card={selectedCard}
        onUpdate={handleCardUpdate}
        boardMembers={board?.members}
        boardId={boardId}
        onRefresh={fetchBoard}
      />
      <NewCardModal
        isOpen={isNewCardModalOpen}
        onClose={() => setIsNewCardModalOpen(false)}
        onSave={handleNewCard}
        boardMembers={board?.members}
      />
      <InviteMemberModal
        isOpen={isInviteMemberModalOpen}
        onClose={() => setIsInviteMemberModalOpen(false)}
        onInvite={handleInviteMember}
      />
      <LabelManager
        isOpen={isLabelManagerOpen}
        onClose={() => setIsLabelManagerOpen(false)}
        boardId={boardId}
        onRefresh={fetchBoard}
      />
      <ColumnManager
        isOpen={isColumnManagerOpen}
        onClose={() => setIsColumnManagerOpen(false)}
        boardId={boardId}
        columns={board?.columns || []}
        onRefresh={fetchBoard}
        isAdmin={board?.members.find(m => m.userId === session?.user.id)?.role === 'admin'}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsColumnManagerOpen(true)}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold transform hover:scale-105 active:scale-95"
                  title="컬럼 관리"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span className="hidden sm:inline">컬럼 관리</span>
                </button>
                <button
                  onClick={() => setIsLabelManagerOpen(true)}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold transform hover:scale-105 active:scale-95"
                  title="라벨 관리"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="hidden sm:inline">라벨 관리</span>
                </button>
                <button
                  onClick={() => setIsInviteMemberModalOpen(true)}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-semibold transform hover:scale-105 active:scale-95"
                  title="멤버 초대"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="hidden sm:inline">멤버 초대</span>
                </button>
                {session && (
                  <ProfileDropdown
                    userEmail={session.user.email!}
                    userName={session.user.name}
                  />
                )}
              </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="flex gap-3 items-center">
              {/* 검색 바 */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="카드 검색..."
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

              {/* 우선순위 필터 */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all font-medium"
              >
                <option value="all">모든 우선순위</option>
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>

              {/* 담당자 필터 */}
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all font-medium"
              >
                <option value="all">모든 담당자</option>
                <option value="me">내 카드</option>
                <option value="unassigned">미할당</option>
                {board.members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name || member.user.email.split('@')[0]}
                  </option>
                ))}
              </select>

              {/* 필터 초기화 */}
              {(filterPriority !== 'all' || filterAssignee !== 'all') && (
                <button
                  onClick={() => {
                    setFilterPriority('all');
                    setFilterAssignee('all');
                  }}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* 칸반 보드 + 활동 피드 */}
        <div className="container mx-auto p-6">
          <div className="flex gap-6">
            {/* 칸반 보드 영역 */}
            <div className="flex-1 min-w-0">
              <KanbanBoard
                board={board}
                onCardClick={handleCardClick}
                onAddCard={handleAddCard}
                onCardUpdate={handleCardUpdate}
                searchQuery={searchQuery}
                filterPriority={filterPriority}
                filterAssignee={filterAssignee}
                currentUserId={session?.user.id || ''}
              />
            </div>

            {/* 활동 피드 사이드바 */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* 팀 멤버 */}
                <TeamMemberSection
                  members={board.members}
                  currentUserId={session?.user.id || ''}
                  boardId={boardId}
                  onRefresh={fetchBoard}
                />

                {/* 마감일 알림 */}
                <DueDateReminder boardId={boardId} onCardClick={handleCardClick} refreshTrigger={activityRefreshTrigger} />

                {/* 최근 활동 */}
                <ActivityFeed boardId={boardId} refreshTrigger={activityRefreshTrigger} />

                {/* 보드 통계 */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">보드 통계</h3>
                  </div>
                  <div className="space-y-3">
                    {board.columns.map((column) => {
                      const totalCards = board.columns.reduce((sum, col) => sum + col.cards.length, 0);
                      const percentage = totalCards > 0 ? (column.cards.length / totalCards) * 100 : 0;
                      
                      return (
                        <div key={column.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{column.title}</span>
                            <span className="text-gray-600 dark:text-gray-400 font-semibold">{column.cards.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 카드</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {board.columns.reduce((sum, col) => sum + col.cards.length, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 우선순위별 카드 */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">우선순위</h3>
                  </div>
                  <div className="space-y-3">
                    {['high', 'medium', 'low'].map((priority) => {
                      const count = board.columns.reduce((sum, col) => 
                        sum + col.cards.filter(card => card.priority === priority).length, 0
                      );
                      const label = priority === 'high' ? '높음' : priority === 'medium' ? '보통' : '낮음';
                      const icon = priority === 'high' ? '⬆️' : priority === 'medium' ? '➡️' : '⬇️';
                      const colorClass = priority === 'high' 
                        ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                        : priority === 'medium'
                        ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
                      
                      return (
                        <div key={priority} className={`flex items-center justify-between p-3 rounded-lg ${colorClass}`}>
                          <div className="flex items-center gap-2">
                            <span>{icon}</span>
                            <span className="font-medium">{label}</span>
                          </div>
                          <span className="font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
