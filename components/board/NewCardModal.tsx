'use client';

import { useState } from 'react';

interface NewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { 
    title: string; 
    description: string; 
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
  }) => Promise<void>;
}

export function NewCardModal({ isOpen, onClose, onSave }: NewCardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave({ 
        title, 
        description,
        priority,
        dueDate: dueDate || undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      onClose();
    } catch (error) {
      console.error('Failed to create card:', error);
      alert('카드 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 animate-scaleIn overflow-hidden">
        {/* 상단 컬러 바 */}
        <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-50"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">새 카드</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">새로운 작업 카드를 만들어보세요</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              카드 제목 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all font-medium placeholder:text-gray-400"
              placeholder="예: 새로운 기능 개발"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              설명
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all resize-none placeholder:text-gray-400"
              placeholder="카드에 대한 상세한 설명을 입력하세요"
              rows={4}
              disabled={loading}
            />
          </div>

          {/* 우선순위 & 마감일 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                우선순위
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all font-medium"
                disabled={loading}
              >
                <option value="low">⬇️ 낮음</option>
                <option value="medium">➡️ 보통</option>
                <option value="high">⬆️ 높음</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="dueDate" className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                마감일
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 font-semibold transform hover:scale-105 active:scale-95"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  생성
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
