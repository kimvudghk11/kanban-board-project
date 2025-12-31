'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: any;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        // 401이면 로그인 필요, 500이면 서버 오류
        console.error('Failed to fetch notifications:', response.status);
        setNotifications([]);
        return;
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId?: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) throw new Error('Failed to mark as read');
      
      if (notificationId) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
      } else {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notification');
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOARD_INVITE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'CARD_ASSIGNED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'COMMENT':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOARD_INVITE':
        return 'from-green-500 to-emerald-600';
      case 'CARD_ASSIGNED':
        return 'from-blue-500 to-cyan-600';
      case 'COMMENT':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] animate-slideDown max-h-[32rem] overflow-hidden flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">알림</h3>
          {notifications.length > 0 && (
            <button
              onClick={() => handleMarkAsRead()}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              모두 읽음
            </button>
          )}
        </div>

      </div>

      {/* 알림 목록 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-transparent border-t-blue-600 border-r-purple-600"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">로딩 중...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">알림이 없습니다</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">새로운 알림이 도착하면 여기에 표시됩니다</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative rounded-xl p-3 border transition-all cursor-pointer ${
                notification.isRead
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800'
              } hover:shadow-md`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                {/* 아이콘 */}
                <div className={`flex-shrink-0 p-1.5 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-lg text-white`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: ko })}
                  </p>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
          border-radius: 10px;
        }
        :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #475569 0%, #334155 100%);
        }
      `}</style>
    </div>
  );
}

