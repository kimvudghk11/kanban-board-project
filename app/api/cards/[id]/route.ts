// 카드 상세 조회, 수정, 삭제 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createActivity, getActivityMessage } from '@/lib/activity';

const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  columnId: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

// 카드 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;

    const card = await prisma.card.findUnique({
      where: { id },
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

    if (!card) {
      return NextResponse.json({ error: '카드를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 권한 확인
    if (card.column.board.members.length === 0) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Get card error:', error);
    return NextResponse.json(
      { error: '카드를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    console.log('=== PATCH Card Request ===');
    console.log('Card ID:', id);
    console.log('Request Body:', JSON.stringify(body, null, 2));
    
    const data = updateCardSchema.parse(body);

    // 기존 카드 확인
    const existingCard = await prisma.card.findUnique({
      where: { id },
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

    if (!existingCard) {
      return NextResponse.json({ error: '카드를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (existingCard.column.board.members.length === 0) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 업데이트할 데이터 준비 (명시적으로)
    const updateData: {
      title?: string;
      description?: string | null;
      priority?: string;
      dueDate?: Date | null;
      assigneeId?: string | null;
      columnId?: string;
      position?: number;
    } = {};
    
    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.priority !== undefined) {
      updateData.priority = data.priority;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.assigneeId !== undefined) {
      updateData.assigneeId = data.assigneeId;
    }
    if (data.columnId !== undefined) {
      updateData.columnId = data.columnId;
    }
    if (data.position !== undefined) {
      updateData.position = data.position;
    }

    console.log('Update Data:', JSON.stringify(updateData, null, 2));

    // 카드 업데이트
    const card = await prisma.card.update({
      where: { id },
      data: updateData,
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

    console.log('Updated Card:', JSON.stringify({ id: card.id, columnId: card.columnId, position: card.position }, null, 2));

    // 활동 로그 기록 (컬럼 이동인 경우)
    if (data.columnId && data.columnId !== existingCard.columnId) {
      const oldColumn = await prisma.column.findUnique({ where: { id: existingCard.columnId } });
      const newColumn = await prisma.column.findUnique({ where: { id: data.columnId } });
      
      if (oldColumn && newColumn) {
        const message = getActivityMessage('CARD_MOVED', session.user.name || '사용자', {
          cardTitle: card.title,
          fromColumn: oldColumn.title,
          toColumn: newColumn.title,
        });
        await createActivity({
          type: 'CARD_MOVED',
          message,
          boardId: existingCard.column.boardId,
          cardId: card.id,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email || '',
        });
      }
    } else if (Object.keys(updateData).length > 0 && !data.position) {
      // 일반 수정 (위치 변경 제외)
      const message = getActivityMessage('CARD_UPDATED', session.user.name || '사용자', { cardTitle: card.title });
      await createActivity({
        type: 'CARD_UPDATED',
        message,
        boardId: existingCard.column.boardId,
        cardId: card.id,
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email || '',
      });
    }

    return NextResponse.json({ card });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Update card error:', error);
    return NextResponse.json(
      { error: '카드 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 카드 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;

    // 기존 카드 확인
    const existingCard = await prisma.card.findUnique({
      where: { id },
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

    if (!existingCard) {
      return NextResponse.json({ error: '카드를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (existingCard.column.board.members.length === 0) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 카드 삭제
    await prisma.card.delete({
      where: { id },
    });

    // 활동 로그 기록
    const message = getActivityMessage('CARD_DELETED', session.user.name || '사용자', { cardTitle: existingCard.title });
    await createActivity({
      type: 'CARD_DELETED',
      message,
      boardId: existingCard.column.boardId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email || '',
    });

    return NextResponse.json({ message: '카드가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json(
      { error: '카드 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}
