'use client';

import { useState, useEffect } from 'react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: 'admin' | 'member') => Promise<void>;
}

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 모달이 열릴 때 body 스크롤 막기
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onInvite(email, role);
      setEmail('');
      setRole('member');
      onClose();
    } catch (err: any) {
      setError(err.message || '멤버 초대에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setRole('member');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn no-select">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animate-scaleIn overflow-hidden no-select" onMouseDown={(e) => e.stopPropagation()}>
        {/* 상단 컬러 바 */}
        <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>
        
        {/* 헤더 */}
        <div className="flex items-center justify-between p-8 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur opacity-50"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">멤버 초대</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">이메일로 팀원을 초대하세요</p>
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
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* 이메일 */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              이메일 주소 *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-emerald-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all font-medium placeholder:text-gray-400"
              placeholder="예: teammate@example.com"
              required
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              가입된 사용자의 이메일을 입력하세요
            </p>
          </div>

          {/* 역할 */}
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              역할
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
              className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-emerald-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all font-medium"
              disabled={loading}
            >
              <option value="member">👤 멤버 (일반 사용자)</option>
              <option value="admin">⭐ 관리자 (모든 권한)</option>
            </select>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong className="text-gray-900 dark:text-gray-100">
                  {role === 'admin' ? '⭐ 관리자' : '👤 멤버'}
                </strong>
                {role === 'admin' 
                  ? ': 보드 설정 변경, 멤버 초대/삭제, 모든 카드 관리 가능' 
                  : ': 카드 생성/수정 가능, 멤버 관리 불가'}
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  초대 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  초대하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

