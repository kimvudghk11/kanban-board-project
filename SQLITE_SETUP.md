# 🚀 SQLite 데이터베이스 설정 가이드

이 프로젝트는 **SQLite** 데이터베이스를 사용하여 간편하게 테스트할 수 있습니다.
별도의 데이터베이스 서버 설치 없이 프로젝트 폴더 내에서 모든 것이 작동합니다!

---

## 📦 설치 및 실행 (5분 소요)

### 1️⃣ 의존성 설치
```bash
npm install
```

### 2️⃣ 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 복사하세요:

```env
# Database (SQLite - 프로젝트 폴더 내 dev.db 파일 생성)
DATABASE_URL="file:./dev.db"

# NextAuth (인증)
NEXTAUTH_SECRET="kanban-board-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

> **참고**: `.env.local` 파일이 이미 준비되어 있습니다!

### 3️⃣ 데이터베이스 생성 및 초기화
```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 생성 (prisma/dev.db 파일이 자동 생성됩니다)
npx prisma db push

# [선택] 샘플 데이터 추가 (추천!)
npx prisma db seed
```

### 4️⃣ 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속!

---

## 🎯 빠른 테스트 (1분)

이미 계정이 없다면 회원가입 후 로그인하세요:

1. **회원가입**: `/register` → 이메일/비밀번호 입력
2. **로그인**: `/login`
3. **보드 생성**: 메인 화면에서 "새 보드" 클릭
4. **카드 추가**: 각 컬럼(To Do, In Progress, Done)에서 카드 추가
5. **드래그 & 드롭**: 카드를 다른 컬럼으로 이동

---

## 📁 데이터베이스 파일 위치

```
kanban-board-project/
├── prisma/
│   └── dev.db          ← SQLite 데이터베이스 파일 (자동 생성)
│   └── dev.db-journal  ← 임시 파일 (자동 생성)
│   └── schema.prisma   ← 데이터베이스 스키마
```

---

## 🔧 문제 해결

### "dev.db 파일이 생성되지 않아요"
```bash
# 1. Prisma Client 재생성
npx prisma generate

# 2. 데이터베이스 강제 재생성
npx prisma db push --force-reset
```

### "EPERM 에러 발생"
개발 서버가 실행 중이면 먼저 종료하세요 (Ctrl + C)

### "로그인이 안 돼요"
.env 파일의 `NEXTAUTH_SECRET`이 설정되어 있는지 확인하세요.

---

## 🎨 주요 기능

✅ **실시간 칸반 보드** - 드래그 & 드롭으로 카드 이동
✅ **팀 협업** - 멤버 초대 및 역할 관리
✅ **카드 라벨/태그** - 색상별 라벨로 카드 분류
✅ **활동 로그** - 팀원들의 모든 활동 추적
✅ **마감일 알림** - 지연/다가오는 마감일 표시
✅ **체크리스트** - 카드별 세부 작업 관리
✅ **커스텀 컬럼** - 워크플로우에 맞게 컬럼 추가/수정
✅ **댓글** - 카드별 실시간 댓글
✅ **다크 모드** - 라이트/다크 테마 지원
✅ **알림 시스템** - 실시간 알림

---

## 📊 데이터베이스 스키마 확인

Prisma Studio로 데이터를 시각적으로 확인하고 편집할 수 있습니다:

```bash
npx prisma studio
```

브라우저에서 `http://localhost:5555` 접속!

---

## 🚢 배포 시 주의사항

**SQLite는 개발/테스트용으로 적합합니다.**
프로덕션 환경에서는 다음과 같은 데이터베이스를 권장합니다:
- PostgreSQL (추천)
- MySQL/MariaDB
- MongoDB

배포 시 `prisma/schema.prisma`의 `provider`만 변경하면 됩니다!

---

## 📞 문의

문제가 발생하면 아래를 확인하세요:
1. Node.js 버전: 18.x 이상
2. npm 버전: 9.x 이상
3. `.env` 파일 존재 여부
4. `prisma/dev.db` 파일 생성 여부

---

**즐거운 칸반 보드 경험 되세요!** 🎊

