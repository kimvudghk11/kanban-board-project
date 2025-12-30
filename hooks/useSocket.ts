// Socket.io 클라이언트 훅

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  boardId: string;
  onCardCreated?: (card: any) => void;
  onCardUpdated?: (card: any) => void;
  onCardDeleted?: (cardId: string) => void;
  onCardMoved?: (moveData: any) => void;
}

export function useSocket({
  boardId,
  onCardCreated,
  onCardUpdated,
  onCardDeleted,
  onCardMoved,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Socket.io 연결
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    
    socketRef.current = io(socketUrl, {
      path: '/api/socket',
      autoConnect: true,
    });

    const socket = socketRef.current;

    // 연결 성공
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      socket.emit('join-board', boardId);
    });

    // 연결 오류
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // 이벤트 리스너 등록
    if (onCardCreated) {
      socket.on('card-created', onCardCreated);
    }

    if (onCardUpdated) {
      socket.on('card-updated', onCardUpdated);
    }

    if (onCardDeleted) {
      socket.on('card-deleted', onCardDeleted);
    }

    if (onCardMoved) {
      socket.on('card-moved', onCardMoved);
    }

    // 클린업
    return () => {
      socket.emit('leave-board', boardId);
      socket.disconnect();
    };
  }, [boardId, onCardCreated, onCardUpdated, onCardDeleted, onCardMoved]);

  // 이벤트 발행 함수들
  const emitCardCreated = useCallback((card: any) => {
    socketRef.current?.emit('card-created', { boardId, card });
  }, [boardId]);

  const emitCardUpdated = useCallback((card: any) => {
    socketRef.current?.emit('card-updated', { boardId, card });
  }, [boardId]);

  const emitCardDeleted = useCallback((cardId: string) => {
    socketRef.current?.emit('card-deleted', { boardId, cardId });
  }, [boardId]);

  const emitCardMoved = useCallback((moveData: any) => {
    socketRef.current?.emit('card-moved', { boardId, moveData });
  }, [boardId]);

  return {
    socket: socketRef.current,
    emitCardCreated,
    emitCardUpdated,
    emitCardDeleted,
    emitCardMoved,
  };
}

