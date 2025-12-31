// 카드 체크리스트 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createItemSchema = z.object({
  content: z.string().min(1, '내용을 입력해주세요.'),
});

const updateItemSchema = z.object({
  content: z.string().min(1).optional(),
  isCompleted: z.boolean().optional(),
});

// 체크리스트 아이템 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: cardId } = await params;
    const body = await request.json();
    const { content } = createItemSchema.parse(body);

    // 카드 접근 권한 확인
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!card || card.column.board.members.length === 0) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    // 마지막 순서 찾기
    const lastItem = await prisma.checklistItem.findFirst({
      where: { cardId },
      orderBy: { order: 'desc' },
    });

    const order = (lastItem?.order ?? -1) + 1;

    const item = await prisma.checklistItem.create({
      data: {
        cardId,
        content,
        order,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Create checklist item error:', error);
    return NextResponse.json(
      { error: '체크리스트 아이템 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 체크리스트 아이템 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: cardId } = await params;
    const body = await request.json();
    const { itemId, ...data } = body;
    const updateData = updateItemSchema.parse(data);

    // 카드 접근 권한 확인
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!card || card.column.board.members.length === 0) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Update checklist item error:', error);
    return NextResponse.json(
      { error: '체크리스트 아이템 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 체크리스트 아이템 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: cardId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId가 필요합니다.' }, { status: 400 });
    }

    // 카드 접근 권한 확인
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!card || card.column.board.members.length === 0) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    await prisma.checklistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: '체크리스트 아이템이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    return NextResponse.json(
      { error: '체크리스트 아이템 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

