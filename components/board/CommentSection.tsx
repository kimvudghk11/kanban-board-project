'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

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

interface CommentSectionProps {
  cardId: string;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onUpdateComment?: (commentId: string, content: string) => Promise<void>;
  currentUserId: string;
}

export function CommentSection({ 
  cardId, 
  comments, 
  onAddComment, 
  onDeleteComment,
  onUpdateComment,
  currentUserId 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingContent.trim() || !onUpdateComment) return;

    try {
      await onUpdateComment(commentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!onDeleteComment) return;
    if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          댓글
        </h4>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {comments.length}
        </span>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-20"></div>
              <div className="relative text-5xl">💬</div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              아직 댓글이 없습니다
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              첫 댓글을 작성해보세요!
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.author.id === currentUserId;
            const isEditing = editingCommentId === comment.id;

            return (
              <div
                key={comment.id}
                className={`group relative rounded-xl p-3 border transition-all ${
                  isAuthor
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                } hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  {/* 프로필 아이콘 */}
                  <div className="relative flex-shrink-0">
                    <div className={`absolute inset-0 rounded-full blur opacity-30 ${
                      isAuthor 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}></div>
                    <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      isAuthor
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                        : 'bg-gradient-to-br from-gray-500 to-gray-700'
                    }`}>
                      {comment.author.name?.[0] || comment.author.email[0].toUpperCase()}
                    </div>
                  </div>

                  {/* 댓글 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {comment.author.name || comment.author.email.split('@')[0]}
                        </span>
                        {isAuthor && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            나
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {format(new Date(comment.createdAt), 'MM/dd HH:mm', { locale: ko })}
                      </span>
                    </div>

                    {isEditing ? (
                      // 수정 모드
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(comment.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                          >
                            저장
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-3 py-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 일반 모드
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {/* 수정/삭제 버튼 (본인 댓글만) */}
                  {isAuthor && !isEditing && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 댓글 입력 (채팅 UI 스타일) */}
      <div className="relative">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글을 입력하세요... (Enter로 전송)"
          maxLength={500}
          disabled={isSubmitting}
          className="w-full pl-4 pr-24 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400 disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {newComment.length}/500
          </span>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            title="전송 (Enter)"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #475569 0%, #334155 100%);
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #64748b 0%, #475569 100%);
        }
      `}</style>
    </div>
  );
}
