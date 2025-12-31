# 🚀 팀 협업 칸반 보드

> **Next.js 16 + TypeScript + SQLite** 기반의 실시간 협업 칸반 보드 애플리케이션

---

## ✨ 주요 기능

### 🎯 핵심 기능
- ✅ **드래그 & 드롭** - 직관적인 카드 이동 (@dnd-kit)
- ✅ **실시간 협업** - Socket.io 기반 실시간 동기화
- ✅ **팀 관리** - 멤버 초대 및 역할 관리 (Admin/Member)
- ✅ **다크 모드** - 라이트/다크 테마 지원

### 📋 카드 관리
- ✅ **카드 라벨/태그** - 색상별 라벨로 카드 분류
- ✅ **체크리스트** - 카드별 세부 작업 관리 (진행률 표시)
- ✅ **댓글 시스템** - 실시간 댓글 추가/수정/삭제
- ✅ **담당자 지정** - 카드별 담당자 할당
- ✅ **우선순위** - Low/Medium/High 우선순위 설정
- ✅ **마감일** - 마감일 설정 및 알림

### 🔔 알림 & 활동
- ✅ **활동 로그** - 모든 팀 활동 실시간 추적 (10초 자동 갱신)
- ✅ **마감일 알림** - 지연/다가오는 마감일 자동 표시
- ✅ **알림 시스템** - 카드 할당, 댓글, 초대 알림

### ⚙️ 커스터마이징
- ✅ **커스텀 컬럼** - 워크플로우에 맞게 컬럼 추가/수정/삭제
- ✅ **라벨 관리** - 보드별 커스텀 라벨 생성
- ✅ **검색 & 필터** - 우선순위, 담당자별 필터링

---

## 🚀 빠른 시작

### 📋 사전 요구사항
- Node.js 18.x 이상
- npm 9.x 이상

### ⚡ 설치 (5분)

```bash
# 1. 의존성 설치 + 환경 설정 + DB 생성 + 샘플 데이터 (한 번에!)
npm run setup

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 접속
# http://localhost:3000
```

> **참고**: `npm run setup` 명령어가 `.env` 파일 생성부터 샘플 데이터까지 모두 자동으로 처리합니다!

---

## 🧪 테스트 계정

샘플 데이터가 포함된 테스트 계정 (비밀번호: `password123`):

| 이메일 | 역할 |
|--------|------|
| `admin@kanban.com` | 관리자 |
| `dev@kanban.com` | 개발자 |
| `designer@kanban.com` | 디자이너 |

---

## 📁 프로젝트 구조

```
kanban-board-project/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   ├── boards/               # 보드 페이지
│   ├── login/                # 로그인
│   └── register/             # 회원가입
├── components/               # React 컴포넌트
│   ├── board/                # 보드 관련 컴포넌트
│   └── ui/                   # UI 컴포넌트
├── prisma/                   # Prisma 설정
│   ├── schema.prisma         # 데이터베이스 스키마
│   ├── seed.ts               # 샘플 데이터
│   └── dev.db                # SQLite DB (자동 생성)
├── lib/                      # 유틸리티
├── .env                      # 환경 변수 (자동 생성)
└── package.json
```

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 3.4
- **Drag & Drop**: @dnd-kit
- **State Management**: React Context API

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Authentication**: NextAuth.js v5
- **Real-time**: Socket.io
- **Validation**: Zod

---

## 📊 데이터베이스

### SQLite
- ✅ **간편한 설치**: 별도 DB 서버 불필요
- ✅ **이식성**: 프로젝트 폴더에 `.db` 파일로 포함
- ✅ **빠른 테스트**: 즉시 실행 가능

### Prisma Studio로 데이터 확인
```bash
npx prisma studio
```
브라우저에서 `http://localhost:5555` 접속!

---

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 전체 설정 (설치 + DB + 샘플 데이터)
npm run setup

# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 스키마 적용
npm run prisma:push

# 샘플 데이터 추가
npm run prisma:seed

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

---

## 🐛 문제 해결

### "EPERM 에러"
```bash
# 개발 서버를 종료하고 다시 시도
Ctrl + C
npm run setup
```

### "dev.db 파일이 생성되지 않아요"
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### "로그인이 안 돼요"
`.env` 파일이 프로젝트 루트에 존재하는지 확인하세요.
없다면:
```bash
npm run create-env
npx prisma db push
npm run prisma:seed
```

---

## 🎨 주요 기능 소개

### 드래그 & 드롭
카드를 드래그하여 다른 컬럼으로 이동하거나 순서를 변경할 수 있습니다.

### 카드 상세
- **보기 모달**: 카드 클릭 시 상세 정보 및 댓글 확인
- **수정 모달**: "수정" 버튼으로 카드 정보 수정
- **체크리스트**: 세부 작업 관리 및 진행률 표시
- **댓글**: Enter 키로 댓글 작성, 자신의 댓글 수정/삭제 가능

### 팀 협업
- **멤버 초대**: 이메일로 새 멤버 초대
- **역할 관리**: Admin/Member 역할 지정
- **활동 로그**: 모든 팀 활동 실시간 추적
- **알림**: 카드 할당, 댓글, 초대 알림

### 커스터마이징
- **라벨 관리**: 색상별 커스텀 라벨 생성
- **컬럼 관리**: 워크플로우에 맞게 컬럼 추가/수정/삭제 (관리자만)
- **검색 & 필터**: 카드 검색 및 우선순위/담당자별 필터링

---

## 📝 환경 변수

`.env` 파일이 자동으로 생성되지만, 수동 생성이 필요한 경우:

```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=kanban-board-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

> **주의**: 따옴표 없이 작성하세요!

---

**칸반 보드 개발 김평화**
