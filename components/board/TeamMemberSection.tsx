'use client';

import { useState } from 'react';
import { BoardMemberList } from './BoardMemberList';

interface BoardMember {
  id: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  role: string;
}

interface TeamMemberSectionProps {
  members: BoardMember[];
  currentUserId: string;
  boardId: string;
  onRefresh: () => void;
}

export function TeamMemberSection({ members, currentUserId, boardId, onRefresh }: TeamMemberSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const displayLimit = 4;
  const remainingCount = members.length - displayLimit;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* 헤더 */}
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100">팀 멤버</h3>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {members.length}명
          </span>
        </div>
        
        {/* 토글 아이콘 */}
        <svg 
          className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded ? (
        /* 펼쳐진 상태: 전체 멤버 목록 */
        <BoardMemberList
          members={members}
          currentUserId={currentUserId}
          boardId={boardId}
          onRefresh={onRefresh}
        />
      ) : (
        /* 접힌 상태: 아바타 미리보기 */
        <div className="flex items-center gap-2">
          {/* 첫 4명의 아바타 */}
          <div className="flex -space-x-2">
            {members.slice(0, displayLimit).map((member, index) => (
              <div
                key={member.id}
                className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${getColorForMember(index)} flex items-center justify-center text-white font-semibold text-sm shadow-lg border-2 border-white dark:border-gray-800 hover:scale-110 transition-transform cursor-pointer`}
                title={member.user.name || member.user.email}
              >
                {getInitials(member.user.name, member.user.email)}
              </div>
            ))}
          </div>

          {/* 나머지 인원 표시 */}
          {remainingCount > 0 && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold text-sm shadow-lg">
              +{remainingCount}
            </div>
          )}

          {/* 클릭 힌트 */}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            클릭하여 {isExpanded ? '접기' : '펼치기'}
          </span>
        </div>
      )}
    </div>
  );
}

