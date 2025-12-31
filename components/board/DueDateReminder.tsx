'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Card {
  id: string;
  title: string;
  dueDate: Date | null;
  priority: string;
  column: {
    title: string;
  };
}

interface DueDateReminderProps {
  boardId: string;
  onCardClick: (card: any) => void;
  refreshTrigger?: number;
}

export function DueDateReminder({ boardId, onCardClick, refreshTrigger }: DueDateReminderProps) {
  const [upcomingCards, setUpcomingCards] = useState<Card[]>([]);
  const [overdueCards, setOverdueCards] = useState<Card[]>([]);

  useEffect(() => {
    fetchCards();
  }, [boardId, refreshTrigger]);

  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/boards/${boardId}/due-dates`);
      if (!response.ok) return;
      
      const data = await response.json();
      setUpcomingCards(data.upcoming || []);
      setOverdueCards(data.overdue || []);
    } catch (error) {
      console.error('Error fetching due dates:', error);
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-500 to-rose-600';
      case 'medium':
        return 'from-yellow-500 to-orange-600';
      case 'low':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100">마감일 알림</h3>
      </div>

      {/* 지연된 카드 */}
      {overdueCards.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
              지연된 카드 ({overdueCards.length})
            </h4>
          </div>
          <div className="space-y-2">
            {overdueCards.map((card) => (
              <button
                key={card.id}
                onClick={() => onCardClick(card)}
                className="w-full text-left p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1 bg-gradient-to-br ${getPriorityColor(card.priority)} rounded mt-0.5`}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                      {card.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{card.column.title}</span>
                      <span className="text-xs text-red-600 dark:text-red-400 font-semibold">
                        {Math.abs(getDaysUntilDue(card.dueDate!))}일 지연
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 다가오는 마감일 */}
      {upcomingCards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              다가오는 마감일 ({upcomingCards.length})
            </h4>
          </div>
          <div className="space-y-2">
            {upcomingCards.map((card) => {
              const daysLeft = getDaysUntilDue(card.dueDate!);
              return (
                <button
                  key={card.id}
                  onClick={() => onCardClick(card)}
                  className="w-full text-left p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-1 bg-gradient-to-br ${getPriorityColor(card.priority)} rounded mt-0.5`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition">
                        {card.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{card.column.title}</span>
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                          {daysLeft === 0 ? '오늘 마감' : `${daysLeft}일 남음`}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 알림 없음 */}
      {overdueCards.length === 0 && upcomingCards.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            다가오는 마감일이 없습니다
          </p>
        </div>
      )}
    </div>
  );
}

