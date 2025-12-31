// 개별 라벨 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const labelUpdateSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  color: z.enum(['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'gray', 'orange']).optional(),
});

// 라벨 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; labelId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: boardId, labelId } = await params;

    // 보드 접근 권한 확인 (관리자만)
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

    const body = await request.json();
    const updates = labelUpdateSchema.parse(body);

    // 이름 변경 시 중복 체크
    if (updates.name) {
      const existingLabel = await prisma.label.findUnique({
        where: {
          boardId_name: {
            boardId,
            name: updates.name,
          },
        },
      });

      if (existingLabel && existingLabel.id !== labelId) {
        return NextResponse.json(
          { error: '이미 존재하는 라벨 이름입니다.' },
          { status: 400 }
        );
      }
    }

    const label = await prisma.label.update({
      where: {
        id: labelId,
        boardId,
      },
      data: updates,
    });

    return NextResponse.json({ label });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Update label error:', error);
    return NextResponse.json(
      { error: '라벨 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 라벨 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; labelId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: boardId, labelId } = await params;

    // 보드 접근 권한 확인 (관리자만)
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

    await prisma.label.delete({
      where: {
        id: labelId,
        boardId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete label error:', error);
    return NextResponse.json(
      { error: '라벨 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

