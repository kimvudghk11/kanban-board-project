'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Activity {
  id: string;
  type: string;
  message: string;
  userName: string | null;
  userEmail: string;
  createdAt: Date;
}

interface ActivityFeedProps {
  boardId: string;
  refreshTrigger?: number;
}

export function ActivityFeed({ boardId, refreshTrigger }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [boardId, refreshTrigger]);

  useEffect(() => {
    // 10초마다 자동 갱신
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, [boardId]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/activities`);
      if (!response.ok) return;
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CARD_CREATED':
        return (
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'CARD_MOVED':
        return (
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        );
      case 'CARD_UPDATED':
        return (
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'COMMENT_ADDED':
        return (
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100">최근 활동</h3>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          로딩 중...
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            아직 활동이 없습니다
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition"
            >
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
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

