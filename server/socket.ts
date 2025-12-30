// Socket.io 서버 설정

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 보드 방에 참여
    socket.on('join-board', (boardId: string) => {
      socket.join(`board:${boardId}`);
      console.log(`Socket ${socket.id} joined board ${boardId}`);
    });

    // 보드 방 나가기
    socket.on('leave-board', (boardId: string) => {
      socket.leave(`board:${boardId}`);
      console.log(`Socket ${socket.id} left board ${boardId}`);
    });

    // 카드 생성 이벤트
    socket.on('card-created', (data: { boardId: string; card: any }) => {
      socket.to(`board:${data.boardId}`).emit('card-created', data.card);
    });

    // 카드 업데이트 이벤트
    socket.on('card-updated', (data: { boardId: string; card: any }) => {
      socket.to(`board:${data.boardId}`).emit('card-updated', data.card);
    });

    // 카드 삭제 이벤트
    socket.on('card-deleted', (data: { boardId: string; cardId: string }) => {
      socket.to(`board:${data.boardId}`).emit('card-deleted', data.cardId);
    });

    // 카드 이동 이벤트
    socket.on('card-moved', (data: { boardId: string; moveData: any }) => {
      socket.to(`board:${data.boardId}`).emit('card-moved', data.moveData);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export type SocketServer = ReturnType<typeof initializeSocket>;

