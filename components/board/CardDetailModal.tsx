'use client';

import { useState, useEffect } from 'react';
import { Card } from '@prisma/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';
import { CommentSection } from './CommentSection';
import { ChecklistSection } from './ChecklistSection';
import { LabelSelector } from './LabelSelector';
import { useSocket } from '@/hooks/useSocket';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: Date;
}

interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
  order: number;
}

interface CardWithComments extends Card {
  comments?: Comment[];
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  labels?: Array<{
    id: string;
    label: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  checklistItems?: ChecklistItem[];
}

interface CardDetailModalProps {
  card: CardWithComments | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: (cardId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  currentUserId?: string;
  boardId?: string;
}

export function CardDetailModal({ card, isOpen, onClose, onEdit, onDelete, onRefresh, currentUserId, boardId }: CardDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isCardDeleted, setIsCardDeleted] = useState(false);

  // ✅ Socket.io 연결 - 카드 삭제 이벤트 감지
  const { socket } = useSocket({
    boardId: boardId || '',
    onCardDeleted: (deletedCardId: string) => {
      if (card && deletedCardId === card.id) {
        setIsCardDeleted(true);
        // 3초 후 자동으로 모달 닫기
        setTimeout(() => {
          onClose();
          setIsCardDeleted(false);
        }, 3000);
      }
    },
  });

  // 모달이 열릴 때 초기 데이터 로드
  useEffect(() => {
    if (isOpen && card) {
      setComments(card.comments || []);
      setChecklistItems(card.checklistItems || []);
      setIsAddingComment(false);
      setIsCardDeleted(false); // 모달이 열릴 때 삭제 상태 초기화
    }
  }, [isOpen, card?.id]); // 모달 열릴 때 & 카드 변경 시

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

  if (!isOpen || !card) return null;

  // ✅ 카드가 삭제된 경우 경고 표시
  if (isCardDeleted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            카드가 삭제되었습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            다른 사용자가 이 카드를 삭제했습니다. 잠시 후 자동으로 닫힙니다.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  const handleAddComment = async (content: string) => {
    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/cards/${card.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }

      const { comment } = await response.json();
      
      // 로컬 상태에 새 댓글 즉시 추가
      setComments(prevComments => [comment, ...prevComments]);
      
      // 활동 로그 업데이트를 위해 보드 새로고침 (백그라운드)
      if (onRefresh) {
        onRefresh().finally(() => {
          setIsAddingComment(false);
        });
      } else {
        setIsAddingComment(false);
      }
    } catch (error) {
      setIsAddingComment(false);
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/cards/${card.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      // 로컬 상태에서 댓글 즉시 제거
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      
      // 보드 새로고침 (백그라운드)
      if (onRefresh) {
        onRefresh().finally(() => {
          setIsAddingComment(false);
        });
      } else {
        setIsAddingComment(false);
      }
    } catch (error) {
      setIsAddingComment(false);
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/cards/${card.id}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, content }),
      });

      if (!response.ok) throw new Error('Failed to update comment');

      const { comment } = await response.json();
      
      // 로컬 상태에서 댓글 즉시 업데이트
      setComments(prevComments => prevComments.map(c => c.id === commentId ? comment : c));
      
      // 보드 새로고침 (백그라운드)
      if (onRefresh) {
        onRefresh().finally(() => {
          setIsAddingComment(false);
        });
      } else {
        setIsAddingComment(false);
      }
    } catch (error) {
      setIsAddingComment(false);
      console.error('Failed to update comment:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (!confirm('정말 이 카드를 삭제하시겠습니까?')) return;
    
    setDeleting(true);
    try {
      await onDelete(card.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('카드 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const getLastUpdateText = () => {
    if (!card.updatedAt) return '';
    try {
      return formatDistanceToNow(new Date(card.updatedAt), { 
        addSuffix: true, 
        locale: ko 
      });
    } catch {
      return '';
    }
  };

  const priorityConfig = {
    low: { label: '낮음', icon: '⬇️', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
    medium: { label: '보통', icon: '➡️', color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
    high: { label: '높음', icon: '⬆️', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' },
  };

  const priority = priorityConfig[card.priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fadeIn no-select">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-700 animate-scaleIn my-8 max-h-[90vh] overflow-y-auto no-select" onMouseDown={(e) => e.stopPropagation()}>
        {/* 상단 컬러 바 */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        {/* 헤더 */}
        <div className="flex items-start justify-between p-8 pb-6">
          <div className="flex-1 flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur opacity-50"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {card.title}
              </h2>
              {getLastUpdateText() && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getLastUpdateText()} 업데이트됨
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="px-8 pb-8 space-y-6">
          {/* 정보 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 우선순위 */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <span className="text-xs font-semibold">우선순위</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm ${priority.color}`}>
                <span>{priority.icon}</span>
                <span>{priority.label}</span>
              </div>
            </div>

            {/* 마감일 */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold">마감일</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {card.dueDate ? format(new Date(card.dueDate), 'yyyy년 MM월 dd일', { locale: ko }) : '없음'}
              </p>
            </div>

            {/* 담당자 */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-semibold">담당자</span>
              </div>
              {card.assignee ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {card.assignee.name?.[0] || card.assignee.email[0].toUpperCase()}
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {card.assignee.name || card.assignee.email.split('@')[0]}
                  </span>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">미할당</p>
              )}
            </div>
          </div>

          {/* 설명 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="font-bold">설명</span>
            </div>
            {card.description ? (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {card.description}
              </p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">설명이 없습니다</p>
            )}
          </div>

          {/* 체크리스트 섹션 */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              체크리스트
            </h4>
            <ChecklistSection
              cardId={card.id}
              items={checklistItems}
              onRefresh={async () => {
                if (onRefresh) await onRefresh();
              }}
            />
          </div>

          {/* 라벨 섹션 (체크리스트 아래로 이동) */}
          {boardId && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-bold">라벨</span>
              </div>
              <LabelSelector
                cardId={card.id}
                boardId={boardId}
                selectedLabels={card.labels || []}
                onUpdate={async () => {
                  if (onRefresh) await onRefresh();
                }}
              />
            </div>
          )}

          {/* 댓글 섹션 */}
          {currentUserId && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <CommentSection
                cardId={card.id}
                comments={comments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onUpdateComment={handleUpdateComment}
                currentUserId={currentUserId}
              />
            </div>
          )}

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    삭제 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    삭제
                  </>
                )}
              </button>
            )}
            <div className="flex-1 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 font-semibold transform hover:scale-105 active:scale-95"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={onEdit}
                disabled={deleting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </button>
            </div>
          </div>
        </div>
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

