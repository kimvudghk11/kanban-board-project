'use client';

import { useState } from 'react';

interface BoardMember {
  id: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  role: string;
}

interface BoardMemberListProps {
  members: BoardMember[];
  currentUserId: string;
  boardId: string;
  onRefresh: () => void;
}

export function BoardMemberList({ members, currentUserId, boardId, onRefresh }: BoardMemberListProps) {
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getColorForMember = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-purple-600',
      'from-yellow-500 to-orange-600',
      'from-teal-500 to-green-600',
      'from-rose-500 to-pink-600',
    ];
    return colors[index % colors.length];
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('정말로 이 멤버를 보드에서 제거하시겠습니까?')) return;

    try {
      setRemovingMemberId(memberId);
      const response = await fetch(`/api/boards/${boardId}/members?memberId=${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove member');

      onRefresh();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('멤버 제거에 실패했습니다.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const currentUserMember = members.find(m => m.user.id === currentUserId);
  const isAdmin = currentUserMember?.role === 'admin';

  return (
    <div className="space-y-3">
      {members.map((member, index) => (
        <div
          key={member.id}
          className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
        >
          {/* 아바타 */}
          <div className={`relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${getColorForMember(index)} flex items-center justify-center text-white font-semibold shadow-md`}>
            {getInitials(member.user.name, member.user.email)}
            
            {/* 본인 표시 */}
            {member.user.id === currentUserId && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                ✓
              </div>
            )}
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {member.user.name || member.user.email.split('@')[0]}
              </p>
              {member.role === 'admin' && (
                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-md">
                  관리자
                </span>
              )}
              {member.user.id === currentUserId && (
                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-md">
                  나
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {member.user.email}
            </p>
          </div>

          {/* 제거 버튼 */}
          {isAdmin && member.user.id !== currentUserId && (
            <button
              onClick={() => handleRemoveMember(member.id)}
              disabled={removingMemberId === member.id}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50"
            >
              {removingMemberId === member.id ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

