// 보드 멤버 초대 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const inviteMemberSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  role: z.enum(['admin', 'member']).default('member'),
});

// 멤버 초대
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
    const { email, role } = inviteMemberSchema.parse(body);

    // 보드 존재 및 권한 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!board || board.members.length === 0) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // ✅ 보안: 현재 사용자의 역할 확인
    const currentMember = board.members[0];

    // ✅ 보안: Admin 권한이 필요한 경우 검증
    let assignedRole = 'member';
    if (role === 'admin') {
      if (currentMember.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin 권한이 필요합니다. 일반 멤버는 Admin으로 초대할 수 없습니다.' },
          { status: 403 }
        );
      }
      assignedRole = 'admin';
    }

    // 초대할 사용자 찾기
    const userToInvite = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      return NextResponse.json(
        { error: '해당 이메일로 가입된 사용자가 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 멤버인지 확인
    const existingMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: userToInvite.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: '이미 보드 멤버입니다.' },
        { status: 400 }
      );
    }

    // 멤버 추가 (검증된 role 사용)
    const member = await prisma.boardMember.create({
      data: {
        boardId,
        userId: userToInvite.id,
        role: assignedRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 알림 생성
    await prisma.notification.create({
      data: {
        userId: userToInvite.id,
        type: 'BOARD_INVITE',
        title: '보드 초대',
        message: `"${board.title}" 보드에 초대되었습니다.`,
        data: JSON.stringify({
          boardId: board.id,
          boardTitle: board.title,
          invitedBy: session.user.email,
        }),
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Invite member error:', error);
    return NextResponse.json(
      { error: '멤버 초대에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 멤버 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: boardId } = await params;
    const { searchParams } = new URL(request.url);
    const userIdToRemove = searchParams.get('userId');

    if (!userIdToRemove) {
      return NextResponse.json(
        { error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 권한 확인 (admin만 삭제 가능)
    const currentMember = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: session.user.id,
        },
      },
    });

    if (!currentMember || currentMember.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 마지막 admin 확인
    if (userIdToRemove === session.user.id) {
      const adminCount = await prisma.boardMember.count({
        where: {
          boardId,
          role: 'admin',
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: '마지막 관리자는 나갈 수 없습니다.' },
          { status: 400 }
        );
      }
    }

    // 멤버 삭제
    await prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: userIdToRemove,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: '멤버 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

