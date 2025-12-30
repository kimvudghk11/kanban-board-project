// 커스텀 Next.js 서버 (Socket.io 지원)

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Socket.io 서버 초기화
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 보드 방에 참여
    socket.on('join-board', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`Socket ${socket.id} joined board ${boardId}`);
    });

    // 보드 방 나가기
    socket.on('leave-board', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`Socket ${socket.id} left board ${boardId}`);
    });

    // 카드 생성 이벤트
    socket.on('card-created', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-created', data.card);
    });

    // 카드 업데이트 이벤트
    socket.on('card-updated', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-updated', data.card);
    });

    // 카드 삭제 이벤트
    socket.on('card-deleted', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-deleted', data.cardId);
    });

    // 카드 이동 이벤트
    socket.on('card-moved', (data) => {
      socket.to(`board:${data.boardId}`).emit('card-moved', data.moveData);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server running`);
    });
});

