// 컬럼 수정/삭제 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateColumnSchema = z.object({
  title: z.string().min(1, '컬럼 이름을 입력해주세요.'),
});

// 컬럼 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: boardId, columnId } = await params;
    const body = await request.json();
    const { title } = updateColumnSchema.parse(body);

    // 보드 관리자 권한 확인
    const boardMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: session.user.id,
        },
      },
    });

    if (!boardMember || boardMember.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const column = await prisma.column.update({
      where: { id: columnId },
      data: { title },
    });

    return NextResponse.json({ column });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Update column error:', error);
    return NextResponse.json(
      { error: '컬럼 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 컬럼 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; columnId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: boardId, columnId } = await params;

    // 보드 관리자 권한 확인
    const boardMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: session.user.id,
        },
      },
    });

    if (!boardMember || boardMember.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 컬럼 내 카드 확인
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        _count: {
          select: { cards: true },
        },
      },
    });

    if (column && column._count.cards > 0) {
      return NextResponse.json(
        { error: '카드가 있는 컬럼은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    await prisma.column.delete({
      where: { id: columnId },
    });

    return NextResponse.json({ message: '컬럼이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete column error:', error);
    return NextResponse.json(
      { error: '컬럼 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

