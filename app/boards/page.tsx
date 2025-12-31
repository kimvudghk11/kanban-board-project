'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NewBoardModal } from '@/components/board/NewBoardModal';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';

interface Board {
  id: string;
  title: string;
  description: string | null;
  columns: { cards: any[] }[];
  members: any[];
}

export default function BoardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchBoards();
    }
  }, [status, router]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) throw new Error('Failed to fetch boards');
      const data = await response.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (data: { title: string; description: string }) => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create board');

      await fetchBoards();
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 border-r-purple-600"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <NewBoardModal
        isOpen={isNewBoardModalOpen}
        onClose={() => setIsNewBoardModalOpen(false)}
        onSave={handleCreateBoard}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 transition-colors no-select">
        {/* 네비게이션 */}
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  칸반 보드
                </h1>
              </div>
              <ProfileDropdown 
                userEmail={session.user.email!} 
                userName={session.user.name}
              />
            </div>
          </div>
        </nav>

        {/* 메인 컨텐츠 */}
        <div className="container mx-auto px-6 py-10">
          {/* 헤더 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                내 보드
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                프로젝트를 관리하고 팀과 협업하세요 🚀
              </p>
            </div>
            <button
              onClick={() => setIsNewBoardModalOpen(true)}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 보드 만들기
            </button>
          </div>

          {/* 보드 목록 */}
          {boards.length === 0 ? (
            <div className="text-center py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20"></div>
                <div className="relative text-7xl">📋</div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                아직 보드가 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-md mx-auto text-lg">
                첫 번째 보드를 만들어 프로젝트를 시작하고<br />팀원들과 함께 협업해보세요!
              </p>
              <button
                onClick={() => setIsNewBoardModalOpen(true)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold inline-flex items-center gap-2 transform hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                첫 보드 만들기
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map((board) => (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden transform hover:-translate-y-1"
                >
                  {/* 카드 상단 컬러 바 */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:h-3 transition-all"></div>
                  
                  <div className="p-6">
                    {/* 제목 영역 */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition line-clamp-2 flex-1 pr-2">
                        {board.title}
                      </h3>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50 group-hover:scale-150 group-hover:shadow-xl transition-all flex-shrink-0 mt-1"></div>
                    </div>

                    {/* 설명 */}
                    {board.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 text-sm leading-relaxed">
                        {board.description}
                      </p>
                    )}

                    {/* 통계 */}
                    <div className="flex items-center justify-between text-sm pt-5 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">{board.members.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                        <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="font-medium">{board.columns.reduce((sum, col) => sum + col.cards.length, 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 호버 시 보이는 화살표 */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
