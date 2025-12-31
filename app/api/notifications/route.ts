// 알람 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 알람 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/042dcbad-baee-4776-a418-4939725e5107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/notifications/route.ts:32',message:'Notifications fetched',data:{userId:session.user.id,count:notifications.length,unreadCount},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H7'})}).catch(()=>{});
    // #endregion

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: '알람을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 알람 읽음 처리
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (notificationId) {
      // 특정 알람 읽음 처리
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
        data: {
          isRead: true,
        },
      });
    } else {
      // 모든 알람 읽음 처리
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: '알람 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 알람 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (notificationId) {
      // 특정 알람 삭제
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
      });
    } else {
      // 모든 읽은 알람 삭제
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          isRead: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { error: '알람 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

