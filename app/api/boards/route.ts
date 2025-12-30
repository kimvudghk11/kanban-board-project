// 보드 목록 조회 및 생성 API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createBoardSchema = z.object({
    title: z.string().min(1, '보드 제목을 입력해주세요.'),
    description: z.string().optional(),
});

// 보드 목록 조회
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const boards = await prisma.board.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                columns: {
                    include: {
                        cards: true,
                    },
                    orderBy: {
                        position: 'asc',
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json({ boards });
    } catch (error) {
        console.error('Get boards error:', error);
        return NextResponse.json(
            { error: '보드 목록을 가져오는데 실패했습니다.' },
            { status: 500 }
        );
    }
}

// 보드 생성
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description } = createBoardSchema.parse(body);

        // 보드 생성 및 기본 컬럼 추가
        const board = await prisma.board.create({
            data: {
                title,
                description,
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'admin',
                    },
                },
                columns: {
                    create: [
                        { title: 'To Do', position: 0 },
                        { title: 'In Progress', position: 1 },
                        { title: 'Done', position: 2 },
                    ],
                },
            },
            include: {
                columns: true,
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ board }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error('Create board error:', error);
        return NextResponse.json(
            { error: '보드 생성에 실패했습니다.' },
            { status: 500 }
        );
    }
}

