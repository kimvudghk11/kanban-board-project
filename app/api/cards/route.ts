// 카드 생성 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createCardSchema = z.object({
  title: z.string().min(1, '카드 제목을 입력해주세요.'),
  description: z.string().optional(),
  columnId: z.string(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const data = createCardSchema.parse(body);

    // 해당 컬럼의 마지막 위치 찾기
    const lastCard = await prisma.card.findFirst({
      where: { columnId: data.columnId },
      orderBy: { position: 'desc' },
    });

    const position = (lastCard?.position ?? -1) + 1;

    // 카드 생성
    const card = await prisma.card.create({
      data: {
        title: data.title,
        description: data.description,
        columnId: data.columnId,
        position,
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.issues[0].message },
          { status: 400 }
        );
      }

    console.error('Create card error:', error);
    return NextResponse.json(
      { error: '카드 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

