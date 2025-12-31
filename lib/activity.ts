// 활동 로그 헬퍼 함수

import { prisma } from './prisma';

interface CreateActivityParams {
  type: string;
  message: string;
  boardId: string;
  cardId?: string;
  userId: string;
  userName?: string | null;
  userEmail: string;
  data?: any;
}

export async function createActivity(params: CreateActivityParams) {
  try {
    await prisma.activity.create({
      data: {
        type: params.type,
        message: params.message,
        boardId: params.boardId,
        cardId: params.cardId,
        userId: params.userId,
        userName: params.userName || null,
        userEmail: params.userEmail,
        data: params.data || null,
      },
    });
  } catch (error) {
    console.error('Failed to create activity:', error);
    // 활동 로그 실패는 무시 (메인 기능에 영향 주지 않도록)
  }
}

// 활동 로그 메시지 생성 헬퍼
export function getActivityMessage(type: string, userName: string, details?: any): string {
  const name = userName || '사용자';
  
  switch (type) {
    case 'CARD_CREATED':
      return `${name}님이 카드 "${details?.cardTitle}"을(를) 생성했습니다.`;
    case 'CARD_MOVED':
      return `${name}님이 카드 "${details?.cardTitle}"을(를) ${details?.fromColumn}에서 ${details?.toColumn}(으)로 이동했습니다.`;
    case 'CARD_UPDATED':
      return `${name}님이 카드 "${details?.cardTitle}"을(를) 수정했습니다.`;
    case 'CARD_DELETED':
      return `${name}님이 카드 "${details?.cardTitle}"을(를) 삭제했습니다.`;
    case 'COMMENT_ADDED':
      return `${name}님이 카드에 댓글을 추가했습니다.`;
    case 'LABEL_ADDED':
      return `${name}님이 카드에 "${details?.labelName}" 라벨을 추가했습니다.`;
    case 'MEMBER_JOINED':
      return `${name}님이 보드에 참여했습니다.`;
    default:
      return `${name}님이 활동했습니다.`;
  }
}

