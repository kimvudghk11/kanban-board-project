// 보드 라벨 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const labelSchema = z.object({
  name: z.string().min(1, '라벨 이름은 필수입니다.').max(20, '라벨 이름은 20자 이하여야 합니다.'),
  color: z.enum(['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'gray', 'orange']),
});

// 라벨 목록 조회
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

    const labels = await prisma.label.findMany({
      where: {
        boardId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ labels });
  } catch (error) {
    console.error('Get labels error:', error);
    return NextResponse.json(
      { error: '라벨을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 라벨 생성
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
    const { name, color } = labelSchema.parse(body);

    // 중복 체크
    const existingLabel = await prisma.label.findUnique({
      where: {
        boardId_name: {
          boardId,
          name,
        },
      },
    });

    if (existingLabel) {
      return NextResponse.json(
        { error: '이미 존재하는 라벨 이름입니다.' },
        { status: 400 }
      );
    }

    const label = await prisma.label.create({
      data: {
        name,
        color,
        boardId,
      },
    });

    return NextResponse.json({ label }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Create label error:', error);
    return NextResponse.json(
      { error: '라벨 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

