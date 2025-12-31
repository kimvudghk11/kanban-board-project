'use client';

import { useState } from 'react';

interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  order: number;
}

interface ChecklistSectionProps {
  cardId: string;
  items: ChecklistItem[];
  onRefresh: () => void;
}

export function ChecklistSection({ cardId, items, onRefresh }: ChecklistSectionProps) {
  const [newItemContent, setNewItemContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddItem = async () => {
    if (!newItemContent.trim()) return;

    try {
      const response = await fetch(`/api/cards/${cardId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newItemContent }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      setNewItemContent('');
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding checklist item:', error);
      alert('체크리스트 아이템 추가에 실패했습니다.');
    }
  };

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, isCompleted: !isCompleted }),
      });

      if (!response.ok) throw new Error('Failed to toggle item');

      onRefresh();
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      alert('체크리스트 아이템 토글에 실패했습니다.');
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await fetch(`/api/cards/${cardId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, content: editContent }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      setEditingId(null);
      setEditContent('');
      onRefresh();
    } catch (error) {
      console.error('Error updating checklist item:', error);
      alert('체크리스트 아이템 수정에 실패했습니다.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('이 체크리스트 아이템을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/cards/${cardId}/checklist?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      onRefresh();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      alert('체크리스트 아이템 삭제에 실패했습니다.');
    }
  };

  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* 진행 상황 표시 */}
      {totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {completedCount}/{totalCount} 완료
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 체크리스트 아이템 목록 */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
          >
            <button
              onClick={() => handleToggleItem(item.id, item.isCompleted)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                item.isCompleted
                  ? 'bg-green-500 border-green-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-green-500'
              }`}
            >
              {item.isCompleted && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            {editingId === item.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateItem(item.id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditContent('');
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdateItem(item.id)}
                  className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent('');
                  }}
                  className="px-2 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded transition"
                >
                  취소
                </button>
              </div>
            ) : (
              <>
                <span
                  className={`flex-1 text-sm ${
                    item.isCompleted
                      ? 'line-through text-gray-500 dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.content}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setEditContent(item.content);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition"
                    title="수정"
                  >
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                    title="삭제"
                  >
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 새 아이템 추가 */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddItem();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewItemContent('');
              }
            }}
            placeholder="체크리스트 아이템 입력..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
            autoFocus
          />
          <button
            onClick={handleAddItem}
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
          >
            추가
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewItemContent('');
            }}
            className="px-4 py-2 text-sm bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-medium"
          >
            취소
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg transition font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          아이템 추가
        </button>
      )}
    </div>
  );
}

