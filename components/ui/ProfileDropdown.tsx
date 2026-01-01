'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationPanel } from './NotificationPanel';

interface ProfileDropdownProps {
  userEmail: string;
  userName?: string | null;
}

export function ProfileDropdown({ userEmail, userName }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 30초마다 확인
    return () => clearInterval(interval);
  }, []);

  const getInitials = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    }
    return userEmail.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="relative flex items-center gap-3" ref={dropdownRef}>
        {/* 알림 버튼 */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsOpen(false);
            }}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition no-select"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>

          <NotificationPanel 
            isOpen={isNotificationOpen} 
            onClose={() => {
              setIsNotificationOpen(false);
              fetchUnreadCount();
            }} 
          />
        </div>

        {/* 프로필 버튼 */}
        <div className="relative">
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition no-select"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
              {getInitials()}
            </div>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[60] animate-fadeIn">
              {/* 사용자 정보 */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {userName || '사용자'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userEmail}
                </p>
              </div>

              {/* 메뉴 아이템 */}
              <div className="py-1">
                {/* 설정 버튼은 제거하거나 주석 처리 */}

                {/* 테마 토글 */}
                <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      테마
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="relative inline-flex items-center h-6 rounded-full w-20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 focus:ring-offset-2"
                      style={{
                        backgroundColor: theme === 'dark' ? '#6366f1' : '#e5e7eb',
                      }}
                    >
                      {/* 슬라이더 */}
                      <span
                        className={`inline-block w-9 h-5 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center ${
                          theme === 'dark' ? 'translate-x-11' : 'translate-x-0.5'
                        }`}
                      >
                        {theme === 'light' ? (
                          <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {theme === 'light' ? '라이트 모드' : '다크 모드'}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
      </div>
    </>
  );
}

