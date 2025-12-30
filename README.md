# 🎯 팀 협업을 위한 실시간 칸반 보드

Next.js 기반의 실시간 협업 칸반 보드 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 인증 시스템
- **회원가입 & 로그인**: NextAuth.js를 사용한 안전한 인증
- **비밀번호 암호화**: bcryptjs를 사용한 해시 처리
- **세션 관리**: 서버 및 클라이언트 세션 관리

### 📋 보드 관리
- **다중 보드**: 여러 프로젝트 보드 생성 및 관리
- **보드 정보**: 제목, 설명, 멤버 수, 카드 수 표시
- **실시간 동기화**: Socket.io를 통한 팀원 간 실시간 업데이트

### 🎴 카드 시스템
- **드래그 앤 드롭**: @dnd-kit을 사용한 직관적인 카드 이동
- **카드 속성**:
  - 제목 및 설명
  - 우선순위 (낮음/보통/높음)
  - 마감일 설정
  - 담당자 할당
- **카드 필터링**: 제목 및 설명 기반 실시간 검색

### 🎨 UI/UX
- **다크 모드**: 라이트/다크 테마 전환 지원
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **프로필 드롭다운**: 
  - 사용자 정보 표시
  - 설정 메뉴
  - 테마 전환
  - 로그아웃
- **애니메이션**: 부드러운 전환 효과
- **드래그 방지**: 텍스트 선택 및 이미지 드래그 방지

### 🔍 검색 기능
- 카드 제목 및 설명 기반 실시간 검색
- 검색 결과 즉시 반영

### 💬 댓글 시스템
- 카드별 댓글 작성 및 관리
- 댓글 작성자 정보 표시
- 작성 시간 표시

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Authentication**: NextAuth.js v5
- **Real-time**: Socket.io-client
- **Forms**: React Hook Form
- **Validation**: Zod
- **Date**: date-fns

### Backend
- **Runtime**: Node.js
- **Database**: MySQL/MariaDB
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Password Hash**: bcryptjs
- **Real-time**: Socket.io
- **Custom Server**: Express-like setup

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd kanban-board-project
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 데이터베이스 연결 URL
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/kanban_board"

# NextAuth.js 비밀 키 (아래 명령어로 생성)
NEXTAUTH_SECRET="your-secret-here"

# NextAuth.js URL (로컬 개발)
NEXTAUTH_URL="http://localhost:3000"

# Socket.io 서버 URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

**NEXTAUTH_SECRET 생성 방법:**
```bash
openssl rand -base64 32
```

### 4. 데이터베이스 설정
MySQL/MariaDB를 설치하고 데이터베이스를 생성하세요:

```sql
CREATE DATABASE kanban_board;
```

Prisma 마이그레이션 실행:
```bash
npx prisma migrate dev
```

Prisma Studio로 데이터 확인 (선택사항):
```bash
npx prisma studio
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 을 열어주세요.

### 6. 프로덕션 빌드
```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
kanban-board-project/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # NextAuth.js 인증
│   │   ├── boards/       # 보드 API
│   │   └── cards/        # 카드 API
│   ├── boards/           # 보드 페이지
│   │   ├── [id]/        # 보드 상세 페이지
│   │   └── page.tsx     # 보드 목록 페이지
│   ├── login/           # 로그인 페이지
│   ├── register/        # 회원가입 페이지
│   ├── layout.tsx       # 루트 레이아웃
│   ├── page.tsx         # 홈 페이지
│   └── globals.css      # 글로벌 스타일
├── components/
│   ├── board/           # 칸반 보드 컴포넌트
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── CardModal.tsx
│   │   ├── NewCardModal.tsx
│   │   ├── NewBoardModal.tsx
│   │   └── CommentSection.tsx
│   ├── ui/              # UI 컴포넌트
│   │   └── ProfileDropdown.tsx
│   └── SessionProvider.tsx
├── contexts/            # React Context
│   └── ThemeContext.tsx # 테마 관리
├── lib/                 # 유틸리티 및 설정
│   ├── auth.ts         # NextAuth.js 설정
│   ├── prisma.ts       # Prisma 클라이언트
│   └── socket.ts       # Socket.io 클라이언트
├── prisma/
│   └── schema.prisma   # 데이터베이스 스키마
├── server/
│   └── socket.ts       # Socket.io 서버
├── types/
│   └── index.ts        # TypeScript 타입 정의
├── server.js           # 커스텀 서버 (Socket.io)
└── package.json
```

## 🎨 주요 페이지 & 컴포넌트

### 페이지
- **홈** (`/`): 랜딩 페이지
- **로그인** (`/login`): 사용자 로그인
- **회원가입** (`/register`): 신규 사용자 등록
- **보드 목록** (`/boards`): 모든 보드 보기
- **보드 상세** (`/boards/[id]`): 특정 보드의 칸반 뷰

### 주요 컴포넌트
- **KanbanBoard**: 드래그 앤 드롭 메인 보드
- **KanbanColumn**: 각 상태별 컬럼
- **KanbanCard**: 개별 작업 카드
- **ProfileDropdown**: 사용자 프로필 메뉴
- **ThemeProvider**: 다크/라이트 모드 관리

## 🔒 데이터베이스 스키마

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Board {
  id          String   @id @default(cuid())
  title       String
  description String?
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Column {
  id      String @id @default(cuid())
  title   String
  order   Int
  boardId String
}

model Card {
  id          String    @id @default(cuid())
  title       String
  description String?
  priority    String?
  dueDate     DateTime?
  position    Int
  columnId    String
  assigneeId  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  cardId    String
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 최근 개선 사항

### UI/UX 개선
- ✅ Input 텍스트 색상 가시성 향상 (검은색/흰색)
- ✅ 프로필 드롭다운 메뉴 구현
- ✅ 다크/라이트 테마 전환 기능
- ✅ 보드 및 카드 호버 효과 강화
- ✅ 전체 페이지 드래그 방지 처리
- ✅ 애니메이션 및 전환 효과 추가
- ✅ 반응형 디자인 개선

### 기능 개선
- ✅ 실시간 카드 검색/필터링
- ✅ 댓글 시스템 UI 구현
- ✅ 세션 및 인증 최적화
- ✅ 에러 처리 강화

## 🔜 향후 개선 계획

### 기능
- [ ] 보드 멤버 초대 시스템
- [ ] 카드 라벨/태그 기능
- [ ] 활동 로그 (Activity Log)
- [ ] 파일 첨부 기능
- [ ] 알림 시스템
- [ ] 보드 템플릿

### 기술
- [ ] 단위 테스트 추가
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 최적화
- [ ] SEO 최적화
- [ ] PWA 지원

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👤 작성자

풀링포레스트 스타트업 과제 프로젝트

## 🙏 감사의 글

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [dnd-kit](https://dndkit.com/)
- [Socket.io](https://socket.io/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Made with ❤️ for team collaboration**
