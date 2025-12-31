# 🎯 팀 협업을 위한 실시간 칸반 보드

Next.js 기반의 실시간 협업 칸반 보드 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 인증 시스템
- **회원가입 & 로그인**: NextAuth.js v5를 사용한 안전한 인증
- **비밀번호 암호화**: bcryptjs를 사용한 해시 처리
- **세션 관리**: 서버 및 클라이언트 세션 관리

### 📋 보드 관리
- **다중 보드**: 여러 프로젝트 보드 생성 및 관리
- **보드 정보**: 제목, 설명, 멤버 수, 카드 수 표시
- **실시간 동기화**: Socket.io를 통한 팀원 간 실시간 업데이트

### 🎴 카드 시스템
- **드래그 앤 드롭**: @dnd-kit을 사용한 직관적인 카드 이동
- **카드 생성 시 모든 정보 입력**: 제목, 설명, 우선순위, 마감일을 한 번에 설정
- **카드 속성**:
  - 제목 및 설명
  - 우선순위 (낮음/보통/높음)
  - 마감일 설정
  - 담당자 할당
- **카드 필터링**: 제목 및 설명 기반 실시간 검색
- **위치 저장**: 카드를 이동하면 데이터베이스에 영구 저장

### 🎨 UI/UX
- **다크 모드**: 라이트/다크 테마 즉시 전환 (CSS 변수 기반)
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- **프로필 드롭다운**: 
  - 사용자 정보 표시
  - 설정 메뉴
  - 테마 전환 (즉시 반영)
  - 로그아웃
- **부드러운 애니메이션**: 200ms transition으로 모든 색상 변경
- **드래그 방지**: 텍스트 선택 및 이미지 드래그 방지
- **깔끔한 카드 디자인**: 
  - 명확한 border로 영역 구분
  - 적절한 hover 효과
  - 컬럼 제목과 겹치지 않는 간격

### 🔍 검색 기능
- 카드 제목 및 설명 기반 실시간 검색
- 검색 결과 즉시 반영

### 💬 댓글 시스템
- 카드별 댓글 작성 및 관리
- 댓글 작성자 정보 표시
- 작성 시간 표시

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 (CSS 변수 기반)
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

# NextAuth.js 비밀 키
NEXTAUTH_SECRET="your-secret-here"

# NextAuth.js URL (로컬 개발)
NEXTAUTH_URL="http://localhost:3000"

# Socket.io 서버 URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

**NEXTAUTH_SECRET 생성:**
```bash
openssl rand -base64 32
```

### 4. 데이터베이스 설정
```sql
CREATE DATABASE kanban_board;
```

Prisma 마이그레이션:
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 6. 프로덕션 빌드
```bash
npm run build
npm start
```

## 🎯 최근 개선 사항 (완료)

### UI/UX 개선
- ✅ **완벽한 다크모드**: CSS 변수 기반으로 모든 UI 요소가 즉시 반응
- ✅ **부드러운 전환**: 200ms transition으로 색상 변경 시 부드러운 효과
- ✅ **프로필 드롭다운**: 사용자 친화적인 메뉴
- ✅ **카드 hover 효과**: 적절한 높이 조정 (0.5rem)
- ✅ **카드 border**: 명확한 영역 구분
- ✅ **간격 조정**: 컬럼 제목과 카드가 겹치지 않도록 여백 추가

### 기능 개선
- ✅ **카드 위치 저장**: 드래그 앤 드롭 시 데이터베이스에 영구 저장
- ✅ **디버깅 로그**: 모든 카드 이동 추적 가능
- ✅ **새 카드 생성**: 우선순위와 마감일을 생성 시 설정
- ✅ **카드 모달**: "마지막 업데이트" 상대 시간 표시
- ✅ **실시간 검색**: 카드 필터링 기능

## 🐛 버그 수정

### 해결된 주요 버그
- ✅ **카드 위치 버그**: 새로고침 시 원래 위치로 돌아가는 문제 해결
- ✅ **다크모드 버그**: CSS 변수와 Tailwind v4 호환성 문제 해결
- ✅ **Hydration 오류**: suppressHydrationWarning 적용
- ✅ **드래그 앤 드롭**: 컬럼 간 이동 시 columnId 저장 문제 해결

## 🔧 디버깅

### 콘솔 로그
개발 중 다음 로그를 확인할 수 있습니다:

```javascript
// 테마 전환
🎨 Theme changing: light → dark

// 카드 이동
=== Drag End ===
Moving card: {
  cardId: "...",
  title: "카드 제목",
  from: "To Do",
  to: "In Progress"
}

// API 요청
=== PATCH Card Request ===
Card ID: ...
Request Body: { columnId: "...", position: 0 }
✅ Card update successful!
```

## 📊 데이터베이스 스키마

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
  id       String @id @default(cuid())
  title    String
  position Int
  boardId  String
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
```

## 🚀 향후 개선 계획

- [ ] 보드 멤버 초대 시스템
- [ ] 카드 라벨/태그 기능
- [ ] 활동 로그 (Activity Log)
- [ ] 파일 첨부 기능
- [ ] 알림 시스템
- [ ] 보드 템플릿
- [ ] 단위 테스트
- [ ] E2E 테스트

## 📝 라이선스

MIT License

---

**Made with ❤️ for team collaboration**
