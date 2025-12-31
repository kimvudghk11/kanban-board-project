'use client';

import { useState, useEffect } from 'react';
import { LabelBadge } from './LabelBadge';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelSelectorProps {
  cardId: string;
  boardId: string;
  selectedLabels: Array<{ id: string; label: Label }>;
  onUpdate: () => void | Promise<void>;
}

export function LabelSelector({ cardId, boardId, selectedLabels, onUpdate }: LabelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableLabels();
    }
  }, [isOpen, boardId]);

  const fetchAvailableLabels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/boards/${boardId}/labels`);
      if (!response.ok) throw new Error('Failed to fetch labels');
      
      const data = await response.json();
      setAvailableLabels(data.labels || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async (labelId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labelId }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '라벨 추가에 실패했습니다.');
        return;
      }

      // 라벨 목록 갱신하여 방금 추가한 라벨이 목록에서 사라지도록
      await fetchAvailableLabels();
      await Promise.resolve(onUpdate());
    } catch (error) {
      console.error('Error adding label:', error);
      alert('라벨 추가에 실패했습니다.');
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    try {
      const response = await fetch(`/api/cards/${cardId}/labels?labelId=${labelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove label');

      // 드롭다운이 열려있으면 라벨 목록 갱신
      if (isOpen) {
        await fetchAvailableLabels();
      }
      await Promise.resolve(onUpdate());
    } catch (error) {
      console.error('Error removing label:', error);
      alert('라벨 제거에 실패했습니다.');
    }
  };

  const selectedLabelIds = selectedLabels.map(sl => sl.label.id);
  const unselectedLabels = availableLabels.filter(label => !selectedLabelIds.includes(label.id));

  return (
    <div className="relative">
      {/* 현재 선택된 라벨들 */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedLabels.map(({ id, label }) => (
          <LabelBadge
            key={id}
            name={label.name}
            color={label.color}
            onRemove={() => handleRemoveLabel(label.id)}
          />
        ))}
      </div>

      {/* 라벨 추가 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        라벨 추가
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 p-3 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                로딩 중...
              </div>
            ) : unselectedLabels.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">
                  {availableLabels.length === 0 ? '🏷️' : '✅'}
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {availableLabels.length === 0
                    ? '라벨이 없습니다'
                    : '모두 추가되었습니다'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {availableLabels.length === 0
                    ? '라벨 관리에서 새 라벨을 만들어보세요'
                    : '더 이상 추가할 라벨이 없습니다'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {unselectedLabels.map((label) => (
                  <button
                    key={label.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddLabel(label.id);
                      // 드롭다운을 열어둔 채로 유지
                    }}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <LabelBadge name={label.name} color={label.color} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

