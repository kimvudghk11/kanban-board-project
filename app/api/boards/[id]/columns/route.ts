// 보드 컬럼 관리 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createColumnSchema = z.object({
  title: z.string().min(1, '컬럼 이름을 입력해주세요.'),
});

// 컬럼 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: boardId } = await params;
    const body = await request.json();
    const { title } = createColumnSchema.parse(body);

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

    // 마지막 위치 찾기
    const lastColumn = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
    });

    const position = (lastColumn?.position ?? -1) + 1;

    const column = await prisma.column.create({
      data: {
        title,
        boardId,
        position,
      },
    });

    return NextResponse.json({ column }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Create column error:', error);
    return NextResponse.json(
      { error: '컬럼 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

