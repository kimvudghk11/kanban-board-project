// 카드 라벨 연결 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createActivity, getActivityMessage } from '@/lib/activity';
import { z } from 'zod';

const cardLabelSchema = z.object({
  labelId: z.string(),
});

// 카드에 라벨 추가
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

    const body = await request.json();
    const { labelId } = cardLabelSchema.parse(body);

    // 중복 체크
    const existing = await prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: '이미 추가된 라벨입니다.' },
        { status: 400 }
      );
    }

    const cardLabel = await prisma.cardLabel.create({
      data: {
        cardId,
        labelId,
      },
      include: {
        label: true,
      },
    });

    // 활동 로그 기록
    const message = getActivityMessage('LABEL_ADDED', session.user.name || '사용자', { labelName: cardLabel.label.name });
    await createActivity({
      type: 'LABEL_ADDED',
      message,
      boardId: card.column.boardId,
      cardId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email || '',
    });

    return NextResponse.json({ cardLabel }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Add card label error:', error);
    return NextResponse.json(
      { error: '라벨 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 카드에서 라벨 제거
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
    const labelId = searchParams.get('labelId');

    if (!labelId) {
      return NextResponse.json(
        { error: '라벨 ID가 필요합니다.' },
        { status: 400 }
      );
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

    await prisma.cardLabel.delete({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove card label error:', error);
    return NextResponse.json(
      { error: '라벨 제거에 실패했습니다.' },
      { status: 500 }
    );
  }
}

