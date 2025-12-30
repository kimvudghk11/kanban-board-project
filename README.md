# 🎯 칸반 보드 - 팀 협업을 위한 실시간 칸반 보드

풀링포레스트 스타트업 채용 과제: Next.js 기반 실시간 칸반 보드 구축

## ✨ 주요 기능

### 🔐 인증 시스템
- NextAuth.js 기반 이메일/비밀번호 로그인
- 회원가입 및 세션 관리
- 보안 강화된 비밀번호 해싱 (bcryptjs)

### 📋 칸반 보드
- 보드 생성 및 관리
- 다중 컬럼 (To Do, In Progress, Done)
- 카드(이슈) CRUD 기능

### 🎯 Drag & Drop
- @dnd-kit 라이브러리 활용
- 직관적인 드래그 앤 드롭 인터페이스
- 부드러운 애니메이션

### ⚡ 실시간 동기화
- Socket.io WebSocket 연결
- 다중 사용자 실시간 협업
- 카드 생성/수정/삭제 즉시 반영

### 👥 이슈 관리
- 제목, 설명, 담당자, 우선순위, 기한
- 댓글 시스템
- 팀원 할당 기능

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **@dnd-kit** (Drag & Drop)
- **Socket.io-client** (실시간 동기화)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **MySQL/MariaDB**
- **Socket.io** (WebSocket 서버)

### 인증
- **NextAuth.js**
- **bcryptjs**

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.14.0 이상
- MySQL 또는 MariaDB
- npm 또는 yarn

### 1. 저장소 클론 및 의존성 설치

\`\`\`bash
# 의존성 설치
npm install
\`\`\`

### 2. 환경 변수 설정

\`.env\` 파일을 생성하고 다음 내용을 입력하세요:

\`\`\`env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/kanban_board"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Socket.io
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
\`\`\`

**NEXTAUTH_SECRET 생성:**
\`\`\`bash
# Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Linux/Mac
openssl rand -base64 32
\`\`\`

### 3. 데이터베이스 설정

MySQL/MariaDB에 데이터베이스를 생성하세요:

\`\`\`sql
CREATE DATABASE kanban_board;
\`\`\`

Prisma 마이그레이션 실행:

\`\`\`bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma db push

# (선택사항) Prisma Studio로 데이터 확인
npx prisma studio
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

\`\`\`
kanban-board-project/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # NextAuth 인증
│   │   ├── boards/          # 보드 API
│   │   ├── cards/           # 카드 API
│   │   └── register/        # 회원가입 API
│   ├── login/               # 로그인 페이지
│   ├── register/            # 회원가입 페이지
│   ├── boards/              # 보드 목록 및 상세
│   └── layout.tsx           # 루트 레이아웃
├── components/              # React 컴포넌트
│   ├── auth/               # 인증 관련 컴포넌트
│   └── SessionProvider.tsx # NextAuth 세션 프로바이더
├── lib/                     # 유틸리티 및 설정
│   ├── prisma.ts           # Prisma 클라이언트
│   ├── auth.ts             # NextAuth 설정
│   └── socket.ts           # Socket.io 클라이언트
├── types/                   # TypeScript 타입 정의
│   └── index.ts
├── hooks/                   # React 커스텀 훅
├── prisma/                  # Prisma 스키마
│   └── schema.prisma
└── package.json
\`\`\`

## 🗄️ 데이터베이스 스키마

### User (사용자)
- 이메일/비밀번호 인증
- 보드 멤버십
- 카드 할당

### Board (보드)
- 제목, 설명
- 다중 컬럼
- 팀 멤버 관리

### Column (컬럼)
- 제목, 위치
- 카드 목록

### Card (카드/이슈)
- 제목, 설명, 우선순위, 기한
- 담당자, 댓글

### Comment (댓글)
- 카드별 댓글
- 작성자 정보

## 🔧 주요 명령어

\`\`\`bash
# 개발 서버 실행 (Socket.io 포함 - 커스텀 서버)
npm run dev

# 기본 Next.js 개발 서버 (Socket.io 없음)
npm run dev:default

# 프로덕션 빌드
npm run build

# 프로덕션 서버 시작
npm start

# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:push

# Prisma Studio 실행
npx prisma studio
\`\`\`

## 📝 구현 완료 기능

### ✅ 기본 설정
- [x] Next.js 14 프로젝트 초기화
- [x] TypeScript 설정
- [x] TailwindCSS 스타일링
- [x] Prisma ORM 데이터베이스 설정

### ✅ 인증 시스템
- [x] NextAuth.js 설정
- [x] 회원가입/로그인 페이지
- [x] 세션 관리

### ✅ 칸반 보드 기능
- [x] 보드 목록 페이지
- [x] 보드 생성/조회 API
- [x] 보드 상세 페이지
- [x] 컬럼 자동 생성 (To Do, In Progress, Done)

### ✅ Drag & Drop
- [x] @dnd-kit 통합
- [x] 카드 드래그 앤 드롭
- [x] 컬럼 간 카드 이동
- [x] 실시간 위치 업데이트

### ✅ 카드 관리
- [x] 카드 CRUD API
- [x] 카드 생성 모달
- [x] 카드 상세 모달
- [x] 카드 수정/삭제
- [x] 우선순위 설정 (낮음/보통/높음)
- [x] 마감일 설정
- [x] 담당자 할당 (구조 완성)

### ✅ 실시간 동기화
- [x] Socket.io 서버 설정 (server.js)
- [x] Socket.io 클라이언트 훅
- [x] 실시간 이벤트 브로드캐스트
- [x] 보드 방(room) 관리

### ✅ UI/UX
- [x] 반응형 디자인
- [x] 우선순위 컬러 코딩
- [x] 드래그 중 시각적 피드백
- [x] 로딩 상태 표시

## 🚧 향후 개선 가능 사항

- [ ] 댓글 시스템 UI
- [ ] 팀원 초대 기능
- [ ] 알림 시스템
- [ ] 파일 첨부
- [ ] 보드 설정 (컬럼 추가/삭제/이름 변경)
- [ ] 검색 및 필터링
- [ ] 활동 로그
- [ ] 다크 모드

## 📚 참고 자료

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Socket.io Documentation](https://socket.io/docs)
- [@dnd-kit Documentation](https://docs.dndkit.com)

## 👨‍💻 개발자

풀링포레스트 채용 과제 제출용

## 📄 라이선스

MIT License
