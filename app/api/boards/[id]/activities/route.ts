// 보드 활동 로그 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: boardId } = await params;

    // 보드 접근 권한 확인
    const boardMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: session.user.id,
        },
      },
    });

    if (!boardMember) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    // 최근 활동 20개 조회
    const activities = await prisma.activity.findMany({
      where: {
        boardId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/042dcbad-baee-4776-a418-4939725e5107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/boards/[id]/activities/route.ts:43',message:'Activities fetched',data:{boardId,count:activities.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: '활동 로그를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

