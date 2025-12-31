'use client';

import { useState, useEffect } from 'react';

interface Column {
  id: string;
  title: string;
  position: number;
  cards: any[];
}

interface ColumnManagerProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columns: Column[];
  onRefresh: () => void;
  isAdmin: boolean;
}

export function ColumnManager({ isOpen, onClose, boardId, columns, onRefresh, isAdmin }: ColumnManagerProps) {
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setNewColumnTitle('');
      setEditingId(null);
      setEditTitle('');
      setIsCreating(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] no-select">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">접근 거부</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            컬럼 관리는 관리자만 할 수 있습니다.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  const handleCreateColumn = async () => {
    if (!newColumnTitle.trim()) return;

    try {
      setIsCreating(true);
      const response = await fetch(`/api/boards/${boardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newColumnTitle }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '컬럼 생성에 실패했습니다.');
        return;
      }

      setNewColumnTitle('');
      onRefresh();
    } catch (error) {
      console.error('Error creating column:', error);
      alert('컬럼 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateColumn = async (columnId: string) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '컬럼 수정에 실패했습니다.');
        return;
      }

      setEditingId(null);
      setEditTitle('');
      onRefresh();
    } catch (error) {
      console.error('Error updating column:', error);
      alert('컬럼 수정에 실패했습니다.');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('이 컬럼을 삭제하시겠습니까? (카드가 있는 컬럼은 삭제할 수 없습니다)')) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/columns/${columnId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '컬럼 삭제에 실패했습니다.');
        return;
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting column:', error);
      alert('컬럼 삭제에 실패했습니다.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] no-select"
      onClick={onClose}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            컬럼 관리
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 현재 컬럼 목록 */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">현재 컬럼</h3>
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              {editingId === column.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateColumn(column.id);
                      if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditTitle('');
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdateColumn(column.id)}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditTitle('');
                    }}
                    className="px-3 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-medium"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{column.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{column.cards.length}개 카드</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(column.id);
                      setEditTitle(column.title);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
                    title="수정"
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteColumn(column.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                    title="삭제"
                    disabled={column.cards.length > 0}
                  >
                    <svg className={`w-5 h-5 ${column.cards.length > 0 ? 'text-gray-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 새 컬럼 추가 */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">새 컬럼 추가</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateColumn();
              }}
              placeholder="컬럼 이름 입력..."
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
            />
            <button
              onClick={handleCreateColumn}
              disabled={!newColumnTitle.trim() || isCreating}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isCreating ? '추가 중...' : '추가'}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

