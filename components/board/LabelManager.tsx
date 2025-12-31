'use client';

import { useState, useEffect } from 'react';
import { LabelBadge } from './LabelBadge';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onRefresh: () => void;
}

const colorOptions = [
  { value: 'blue', label: '파랑', class: 'bg-blue-500' },
  { value: 'green', label: '초록', class: 'bg-green-500' },
  { value: 'red', label: '빨강', class: 'bg-red-500' },
  { value: 'yellow', label: '노랑', class: 'bg-yellow-500' },
  { value: 'purple', label: '보라', class: 'bg-purple-500' },
  { value: 'pink', label: '분홍', class: 'bg-pink-500' },
  { value: 'gray', label: '회색', class: 'bg-gray-500' },
  { value: 'orange', label: '주황', class: 'bg-orange-500' },
];

export function LabelManager({ isOpen, onClose, boardId, onRefresh }: LabelManagerProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('blue');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
      // 모달 열릴 때 body 스크롤 막기
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, boardId]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/boards/${boardId}/labels`);
      if (!response.ok) throw new Error('Failed to fetch labels');
      
      const data = await response.json();
      setLabels(data.labels || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLabelName.trim(),
          color: newLabelColor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '라벨 생성에 실패했습니다.');
        return;
      }

      setNewLabelName('');
      setNewLabelColor('blue');
      fetchLabels();
      onRefresh();
    } catch (error) {
      console.error('Error creating label:', error);
      alert('라벨 생성에 실패했습니다.');
    }
  };

  const handleUpdateLabel = async (labelId: string) => {
    if (!editName.trim()) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/labels/${labelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          color: editColor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '라벨 수정에 실패했습니다.');
        return;
      }

      setEditingId(null);
      fetchLabels();
      onRefresh();
    } catch (error) {
      console.error('Error updating label:', error);
      alert('라벨 수정에 실패했습니다.');
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm('이 라벨을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/boards/${boardId}/labels/${labelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete label');

      fetchLabels();
      onRefresh();
    } catch (error) {
      console.error('Error deleting label:', error);
      alert('라벨 삭제에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-select"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col no-select"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">라벨 관리</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 새 라벨 생성 */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">새 라벨 만들기</h3>
            <form onSubmit={handleCreateLabel} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  라벨 이름
                </label>
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="예: 버그, 기능, 디자인..."
                  maxLength={20}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  색상
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewLabelColor(option.value)}
                      className={`w-10 h-10 rounded-lg ${option.class} transition-transform ${
                        newLabelColor === option.value ? 'ring-4 ring-blue-500 dark:ring-purple-500 scale-110' : 'hover:scale-105'
                      }`}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={!newLabelName.trim()}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
              >
                라벨 추가
              </button>
            </form>
          </div>

          {/* 기존 라벨 목록 */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              기존 라벨 ({labels.length}개)
            </h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">로딩 중...</div>
            ) : labels.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                아직 라벨이 없습니다. 위에서 새 라벨을 만들어보세요!
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition group"
                  >
                    {editingId === label.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          maxLength={20}
                        />
                        <div className="flex gap-1">
                          {colorOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setEditColor(option.value)}
                              className={`w-6 h-6 rounded ${option.class} transition-transform ${
                                editColor === option.value ? 'ring-2 ring-blue-500 scale-110' : ''
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleUpdateLabel(label.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <>
                        <LabelBadge name={label.name} color={label.color} size="md" />
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setEditingId(label.id);
                              setEditName(label.name);
                              setEditColor(label.color);
                            }}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteLabel(label.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

