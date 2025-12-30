'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NewBoardModal } from '@/components/board/NewBoardModal';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const boards_OLD = [] as any; // Prisma code below will fail without DB
  /*
  const boards_OLD = await prisma.board.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      columns: {
        include: {
          cards: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  */

  return (
    <>
    <NewBoardModal
      isOpen={isNewBoardModalOpen}
      onClose={() => setIsNewBoardModalOpen(false)}
      onSave={handleCreateBoard}
    />
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">칸반 보드</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session.user.email}</span>
            <Link
              href="/api/auth/signout"
              className="text-red-600 hover:text-red-700"
            >
              로그아웃
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">내 보드</h2>
          <button
            onClick={() => setIsNewBoardModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + 새 보드 만들기
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              아직 보드가 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              새 보드를 만들어 프로젝트를 시작하세요!
            </p>
            <button
              onClick={() => setIsNewBoardModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              첫 보드 만들기
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {board.title}
                </h3>
                {board.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {board.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{board.members.length} 멤버</span>
                  <span>
                    {board.columns.reduce((sum, col) => sum + col.cards.length, 0)} 카드
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

