// 카드 코멘트 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { createActivity, getActivityMessage } from '@/lib/activity';

const createCommentSchema = z.object({
  content: z.string().min(1, '댓글 내용을 입력해주세요.'),
});

// 코멘트 생성
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/042dcbad-baee-4776-a418-4939725e5107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/cards/[id]/comments/route.ts:26',message:'Comment creation request',data:{cardId,contentLength:body.content?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    const { content } = createCommentSchema.parse(body);

    // 카드 존재 및 권한 확인
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

    if (!card) {
      return NextResponse.json({ error: '카드를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (card.column.board.members.length === 0) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 코멘트 생성
    const comment = await prisma.comment.create({
      data: {
        content,
        cardId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/042dcbad-baee-4776-a418-4939725e5107',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/cards/[id]/comments/route.ts:74',message:'Comment created',data:{commentId:comment.id,cardId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    // 활동 로그 기록
    const message = getActivityMessage('COMMENT_ADDED', session.user.name || '사용자');
    await createActivity({
      type: 'COMMENT_ADDED',
      message,
      boardId: card.column.boardId,
      cardId,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email || '',
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: '댓글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 코멘트 수정
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
    const { commentId, content } = body;

    if (!commentId || !content) {
      return NextResponse.json(
        { error: '댓글 ID와 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    // 코멘트 확인
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 본인 댓글인지 확인
    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 코멘트 수정
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { error: '댓글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 코멘트 삭제
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
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: '댓글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 코멘트 확인
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 본인 댓글인지 확인
    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 코멘트 삭제
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: '댓글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

