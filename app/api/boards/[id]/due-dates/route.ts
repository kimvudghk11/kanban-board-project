// 보드의 마감일 정보 API

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

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 보드의 모든 컬럼 조회
    const columns = await prisma.column.findMany({
      where: { boardId },
      select: { id: true },
    });

    const columnIds = columns.map(col => col.id);

    // 지연된 카드 (마감일이 지났고 Done 컬럼이 아닌 카드)
    const overdueCards = await prisma.card.findMany({
      where: {
        columnId: { in: columnIds },
        dueDate: {
          not: null,
          lt: now,
        },
        column: {
          title: {
            not: 'Done',
          },
        },
      },
      include: {
        column: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    });

    // 다가오는 마감일 (3일 이내)
    const upcomingCards = await prisma.card.findMany({
      where: {
        columnId: { in: columnIds },
        dueDate: {
          not: null,
          gte: now,
          lte: threeDaysLater,
        },
      },
      include: {
        column: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    });

    return NextResponse.json({ overdue: overdueCards, upcoming: upcomingCards });
  } catch (error) {
    console.error('Get due dates error:', error);
    return NextResponse.json(
      { error: '마감일 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

