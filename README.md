# 🚀 팀 협업 칸반 보드 (Team Kanban Board)

> **Next.js 16 + TypeScript + SQLite** 기반의 실시간 협업 칸반 보드 애플리케이션

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

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
- ✅ **활동 로그** - 모든 팀 활동 실시간 추적
- ✅ **마감일 알림** - 지연/다가오는 마감일 자동 표시
- ✅ **알림 시스템** - 카드 할당, 댓글, 초대 알림

### ⚙️ 커스터마이징
- ✅ **커스텀 컬럼** - 워크플로우에 맞게 컬럼 추가/수정/삭제
- ✅ **라벨 관리** - 보드별 커스텀 라벨 생성
- ✅ **검색 & 필터** - 우선순위, 담당자별 필터링

---

## 🎬 데모 스크린샷

### 메인 보드
![Kanban Board](https://via.placeholder.com/800x400?text=Kanban+Board+Demo)

### 카드 상세
![Card Detail](https://via.placeholder.com/800x400?text=Card+Detail+Modal)

---

## 🚀 빠른 시작 (5분 설치)

### 📋 사전 요구사항
- Node.js 18.x 이상
- npm 9.x 이상

### 1️⃣ 프로젝트 클론
```bash
git clone <repository-url>
cd kanban-board-project
```

### 2️⃣ 자동 설치 (권장) - 한 번에!
```bash
npm run setup
```

이 명령어는 다음을 자동으로 실행합니다:
1. 의존성 설치 (`npm install`)
2. **환경 변수 파일 생성** (`.env` 자동 생성)
3. Prisma Client 생성 (`npx prisma generate`)
4. 데이터베이스 생성 (`npx prisma db push`)
5. 샘플 데이터 추가 (`npm run prisma:seed`)

> **참고**: `.env` 파일이 자동으로 생성됩니다! 수동 생성 불필요!

### 3️⃣ 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속!

---

## ⚠️ 중요: 처음 설치 시

개발 서버가 실행 중이면 **반드시 종료**하고 설치하세요:
```bash
# Ctrl + C로 서버 종료 후
npm run setup
```

---

## 🧪 테스트 계정

샘플 데이터가 포함된 테스트 계정:

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| `admin@kanban.com` | `password123` | 관리자 |
| `dev@kanban.com` | `password123` | 개발자 |
| `designer@kanban.com` | `password123` | 디자이너 |

---

## 📁 프로젝트 구조

```
kanban-board-project/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/             # 인증 (NextAuth)
│   │   ├── boards/           # 보드 관리
│   │   ├── cards/            # 카드 관리
│   │   └── notifications/    # 알림
│   ├── boards/               # 보드 페이지
│   ├── login/                # 로그인 페이지
│   ├── register/             # 회원가입 페이지
│   └── layout.tsx            # 루트 레이아웃
├── components/               # React 컴포넌트
│   ├── board/                # 보드 관련 컴포넌트
│   └── ui/                   # UI 컴포넌트
├── contexts/                 # React Context
│   └── ThemeContext.tsx      # 테마 관리
├── lib/                      # 유틸리티
│   ├── auth.ts               # NextAuth 설정
│   ├── prisma.ts             # Prisma Client
│   └── activity.ts           # 활동 로그 헬퍼
├── prisma/                   # Prisma 설정
│   ├── schema.prisma         # 데이터베이스 스키마
│   ├── seed.ts               # 샘플 데이터
│   └── dev.db                # SQLite 데이터베이스 (자동 생성)
├── types/                    # TypeScript 타입
├── server.js                 # Socket.io 서버
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
- **Date Handling**: date-fns

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite (개발), Prisma ORM
- **Authentication**: NextAuth.js v5
- **Real-time**: Socket.io
- **Validation**: Zod

---

## 📊 데이터베이스

### SQLite 사용 이유
- ✅ **간편한 설치**: 별도 DB 서버 불필요
- ✅ **이식성**: 프로젝트 폴더에 `.db` 파일로 포함
- ✅ **빠른 테스트**: 즉시 실행 가능
- ✅ **제로 설정**: 복잡한 설정 없음

### Prisma Studio로 데이터 확인
```bash
npx prisma studio
```
브라우저에서 `http://localhost:5555` 접속!

### 데이터베이스 초기화
```bash
# 데이터베이스 재생성
npx prisma db push --force-reset

# 샘플 데이터 추가
npm run prisma:seed
```

---

## 🎨 주요 컴포넌트

### KanbanBoard
드래그 & 드롭 기능을 포함한 메인 보드 컴포넌트

### CardDetailModal
카드 상세 정보 조회 (읽기 전용)
- 체크리스트
- 댓글
- 라벨
- 활동 로그

### CardEditModal
카드 수정 모달
- 제목/설명 수정
- 담당자 지정
- 우선순위/마감일 설정
- 라벨 추가/제거

### ActivityFeed
실시간 활동 로그 피드 (10초 자동 갱신)

### DueDateReminder
마감일 알림 위젯
- 지연된 카드
- 3일 이내 마감 카드

---

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# Prisma Client 재생성
npm run prisma:generate

# 데이터베이스 스키마 적용
npm run prisma:push

# 샘플 데이터 추가
npm run prisma:seed

# 전체 설정 (설치 + DB + 샘플 데이터)
npm run setup
```

---

## 🚢 배포

### Vercel 배포 (권장)
1. Vercel에 프로젝트 연결
2. 환경 변수 설정:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_SECRET="your-production-secret"
   NEXTAUTH_URL="https://your-domain.com"
   ```
3. 배포!

### 주의사항
- **SQLite는 개발/테스트용입니다**
- 프로덕션에서는 **PostgreSQL** 또는 **MySQL** 사용 권장
- 데이터베이스 변경 시 `prisma/schema.prisma`의 `provider`만 수정

---

## 🐛 문제 해결

### "dev.db 파일이 생성되지 않아요"
```bash
npx prisma generate
npx prisma db push --force-reset
```

### "EPERM 에러"
개발 서버를 종료하고 다시 시도하세요 (Ctrl + C)

### "로그인이 안 돼요"
`.env` 파일의 `NEXTAUTH_SECRET`이 설정되어 있는지 확인하세요.

### "카드가 To Do로 돌아가요"
브라우저 콘솔에서 에러를 확인하고, 데이터베이스를 초기화해보세요:
```bash
npx prisma db push --force-reset
npm run prisma:seed
```

---

## 📝 라이선스

MIT License

---

## 👥 기여

이슈와 PR은 언제나 환영합니다!

---

## 📞 문의

문제가 발생하면 GitHub Issues를 통해 문의해주세요.

---

**즐거운 칸반 보드 경험 되세요!** 🎊
