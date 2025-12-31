// Prisma Seed Script - 샘플 데이터 생성

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 시작...');

  // 기존 데이터 삭제 (개발 환경에서만!)
  await prisma.cardLabel.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.label.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ 기존 데이터 삭제 완료');

  // 1. 사용자 생성
  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'admin@kanban.com',
      name: '김관리자',
      password,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'dev@kanban.com',
      name: '박개발자',
      password,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'designer@kanban.com',
      name: '이디자이너',
      password,
    },
  });

  console.log('✅ 사용자 3명 생성 완료');

  // 2. 보드 생성
  const board = await prisma.board.create({
    data: {
      title: '🚀 칸반 보드 데모 프로젝트',
      description: '이 보드에서 모든 기능을 테스트해보세요! 드래그 & 드롭, 라벨, 체크리스트, 댓글 등 다양한 기능이 준비되어 있습니다.',
    },
  });

  console.log('✅ 보드 생성 완료');

  // 3. 보드 멤버 추가
  await prisma.boardMember.createMany({
    data: [
      { boardId: board.id, userId: user1.id, role: 'admin' },
      { boardId: board.id, userId: user2.id, role: 'member' },
      { boardId: board.id, userId: user3.id, role: 'member' },
    ],
  });

  console.log('✅ 보드 멤버 3명 추가 완료');

  // 4. 컬럼 생성
  const todoColumn = await prisma.column.create({
    data: {
      title: 'To Do',
      position: 0,
      boardId: board.id,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      title: 'In Progress',
      position: 1,
      boardId: board.id,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      title: 'Done',
      position: 2,
      boardId: board.id,
    },
  });

  console.log('✅ 컬럼 3개 생성 완료');

  // 5. 라벨 생성
  const urgentLabel = await prisma.label.create({
    data: {
      name: '긴급',
      color: 'red',
      boardId: board.id,
    },
  });

  const featureLabel = await prisma.label.create({
    data: {
      name: '기능개발',
      color: 'blue',
      boardId: board.id,
    },
  });

  const bugLabel = await prisma.label.create({
    data: {
      name: '버그',
      color: 'orange',
      boardId: board.id,
    },
  });

  const designLabel = await prisma.label.create({
    data: {
      name: '디자인',
      color: 'purple',
      boardId: board.id,
    },
  });

  console.log('✅ 라벨 4개 생성 완료');

  // 6. To Do 카드 생성
  const card1 = await prisma.card.create({
    data: {
      title: '로그인 페이지 디자인 개선',
      description: '사용자 경험을 향상시키기 위해 로그인 페이지의 UI를 개선합니다.\n\n- 그라데이션 배경 추가\n- 애니메이션 효과\n- 반응형 디자인',
      columnId: todoColumn.id,
      position: 0,
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      assigneeId: user3.id,
    },
  });

  await prisma.cardLabel.create({
    data: { cardId: card1.id, labelId: designLabel.id },
  });

  await prisma.checklistItem.createMany({
    data: [
      { cardId: card1.id, content: '와이어프레임 작성', order: 0, isCompleted: true },
      { cardId: card1.id, content: 'UI 디자인 시안', order: 1, isCompleted: false },
      { cardId: card1.id, content: '개발팀 리뷰', order: 2, isCompleted: false },
    ],
  });

  const card2 = await prisma.card.create({
    data: {
      title: '다크 모드 버그 수정',
      description: '일부 컴포넌트에서 다크 모드 색상이 제대로 적용되지 않는 문제를 수정합니다.',
      columnId: todoColumn.id,
      position: 1,
      priority: 'medium',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
      assigneeId: user2.id,
    },
  });

  await prisma.cardLabel.createMany({
    data: [
      { cardId: card2.id, labelId: bugLabel.id },
      { cardId: card2.id, labelId: urgentLabel.id },
    ],
  });

  // 7. In Progress 카드 생성
  const card3 = await prisma.card.create({
    data: {
      title: '알림 시스템 구현',
      description: '실시간 알림 기능을 구현합니다.\n\n기능:\n- 카드 할당 알림\n- 댓글 알림\n- 마감일 알림',
      columnId: inProgressColumn.id,
      position: 0,
      priority: 'high',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
      assigneeId: user2.id,
    },
  });

  await prisma.cardLabel.create({
    data: { cardId: card3.id, labelId: featureLabel.id },
  });

  await prisma.checklistItem.createMany({
    data: [
      { cardId: card3.id, content: 'API 엔드포인트 개발', order: 0, isCompleted: true },
      { cardId: card3.id, content: 'UI 컴포넌트 작성', order: 1, isCompleted: true },
      { cardId: card3.id, content: '실시간 업데이트 연동', order: 2, isCompleted: false },
      { cardId: card3.id, content: '테스트 작성', order: 3, isCompleted: false },
    ],
  });

  await prisma.comment.create({
    data: {
      cardId: card3.id,
      authorId: user1.id,
      content: 'Socket.io 대신 polling 방식으로 구현하는 게 어떨까요?',
    },
  });

  await prisma.comment.create({
    data: {
      cardId: card3.id,
      authorId: user2.id,
      content: '좋은 의견입니다! 일단 polling으로 구현하고 나중에 최적화하겠습니다.',
    },
  });

  // 8. Done 카드 생성
  const card4 = await prisma.card.create({
    data: {
      title: '드래그 & 드롭 기능 구현',
      description: '@dnd-kit을 사용하여 카드 드래그 앤 드롭을 구현했습니다.',
      columnId: doneColumn.id,
      position: 0,
      priority: 'high',
      assigneeId: user2.id,
    },
  });

  await prisma.cardLabel.create({
    data: { cardId: card4.id, labelId: featureLabel.id },
  });

  const card5 = await prisma.card.create({
    data: {
      title: '프로젝트 초기 설정',
      description: 'Next.js, Prisma, TailwindCSS 설정 완료',
      columnId: doneColumn.id,
      position: 1,
      priority: 'low',
      assigneeId: user1.id,
    },
  });

  console.log('✅ 카드 5개 생성 완료');

  // 9. 활동 로그 생성
  await prisma.activity.createMany({
    data: [
      {
        type: 'CARD_CREATED',
        message: `${user1.name}님이 카드 "프로젝트 초기 설정"을(를) 생성했습니다.`,
        boardId: board.id,
        cardId: card5.id,
        userId: user1.id,
        userName: user1.name,
        userEmail: user1.email,
      },
      {
        type: 'CARD_MOVED',
        message: `${user2.name}님이 카드 "드래그 & 드롭 기능 구현"을(를) In Progress에서 Done(으)로 이동했습니다.`,
        boardId: board.id,
        cardId: card4.id,
        userId: user2.id,
        userName: user2.name,
        userEmail: user2.email,
      },
      {
        type: 'COMMENT_ADDED',
        message: `${user1.name}님이 카드에 댓글을 추가했습니다.`,
        boardId: board.id,
        cardId: card3.id,
        userId: user1.id,
        userName: user1.name,
        userEmail: user1.email,
      },
      {
        type: 'CARD_CREATED',
        message: `${user2.name}님이 카드 "알림 시스템 구현"을(를) 생성했습니다.`,
        boardId: board.id,
        cardId: card3.id,
        userId: user2.id,
        userName: user2.name,
        userEmail: user2.email,
      },
      {
        type: 'LABEL_ADDED',
        message: `${user1.name}님이 카드에 "긴급" 라벨을 추가했습니다.`,
        boardId: board.id,
        cardId: card2.id,
        userId: user1.id,
        userName: user1.name,
        userEmail: user1.email,
      },
    ],
  });

  console.log('✅ 활동 로그 5개 생성 완료');

  // 10. 알림 생성
  await prisma.notification.createMany({
    data: [
      {
        type: 'CARD_ASSIGNED',
        title: '새로운 카드가 할당되었습니다',
        message: '"알림 시스템 구현" 카드가 회원님에게 할당되었습니다.',
        userId: user2.id,
        isRead: false,
      },
      {
        type: 'COMMENT',
        title: '새로운 댓글',
        message: '김관리자님이 "알림 시스템 구현" 카드에 댓글을 남겼습니다.',
        userId: user2.id,
        isRead: false,
      },
    ],
  });

  console.log('✅ 알림 2개 생성 완료');

  console.log('\n🎉 시드 데이터 생성 완료!');
  console.log('\n📝 테스트 계정:');
  console.log('   - 이메일: admin@kanban.com');
  console.log('   - 이메일: dev@kanban.com');
  console.log('   - 이메일: designer@kanban.com');
  console.log('   - 비밀번호: password123');
  console.log('\n🚀 http://localhost:3000 에서 로그인하세요!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 시드 에러:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

