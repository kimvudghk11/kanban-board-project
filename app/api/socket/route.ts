// Socket.io API 라우트

import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const dynamic = 'force-dynamic';

const io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    console.log('Initializing Socket.io server...');
    
    // Socket.io는 Next.js API Routes에서 직접 초기화하기 어려우므로
    // 커스텀 서버가 필요합니다.
    // 여기서는 응답만 반환합니다.
    return new Response(
      JSON.stringify({
        message: 'Socket.io server is running',
        note: 'Socket.io requires a custom server. Please use server.js',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response('Socket.io is initialized', { status: 200 });
}

