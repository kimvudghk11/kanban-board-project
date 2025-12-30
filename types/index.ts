// TypeScript 타입 정의

import { User, Board, Column, Card, Comment, BoardMember } from '@prisma/client';

// 확장된 타입 정의
export type BoardWithDetails = Board & {
  columns: ColumnWithCards[];
  members: (BoardMember & { user: User })[];
};

export type ColumnWithCards = Column & {
  cards: CardWithDetails[];
};

export type CardWithDetails = Card & {
  assignee: User | null;
  comments: (Comment & { author: User })[];
};

// 폼 데이터 타입
export interface CreateBoardInput {
  title: string;
  description?: string;
}

export interface CreateColumnInput {
  title: string;
  boardId: string;
  position: number;
}

export interface CreateCardInput {
  title: string;
  description?: string;
  columnId: string;
  position: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assigneeId?: string;
}

export interface UpdateCardInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assigneeId?: string;
}

export interface MoveCardInput {
  cardId: string;
  targetColumnId: string;
  position: number;
}

export interface CreateCommentInput {
  content: string;
  cardId: string;
}

// Socket.io 이벤트 타입
export interface SocketEvents {
  'join-board': (boardId: string) => void;
  'leave-board': (boardId: string) => void;
  'card-created': (card: Card) => void;
  'card-updated': (card: Card) => void;
  'card-deleted': (cardId: string) => void;
  'card-moved': (data: MoveCardInput) => void;
  'comment-created': (comment: Comment) => void;
}

// NextAuth 세션 확장
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }

  interface User {
    id: string;
  }

  interface JWT {
    id: string;
  }
}

