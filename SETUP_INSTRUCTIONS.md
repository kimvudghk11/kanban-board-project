# 🚀 CTO님을 위한 완벽한 설정 가이드

## ✅ SQLite로 완전히 전환 완료!

모든 코드가 SQLite 데이터베이스로 변경되었습니다.
프로젝트 폴더 내에 `prisma/dev.db` 파일이 자동 생성됩니다.

---

## 📋 설정 순서 (반드시 순서대로!)

### 1️⃣ 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="kanban-board-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

### 2️⃣ 개발 서버가 실행 중이면 종료
```bash
# Ctrl + C 또는 터미널 종료
```

### 3️⃣ 자동 설치 (한 번에!)
```bash
npm run setup
```

이 명령어는 다음을 자동으로 실행합니다:
1. ✅ `npm install` - 의존성 설치
2. ✅ `npx prisma generate` - Prisma Client 생성
3. ✅ `npx prisma db push` - SQLite DB 생성 (prisma/dev.db)
4. ✅ `npm run prisma:seed` - 샘플 데이터 추가

### 4️⃣ 개발 서버 실행
```bash
npm run dev
```

### 5️⃣ 브라우저 접속
```
http://localhost:3000
```

---

## 🧪 테스트 계정 (비밀번호: password123)

| 이메일 | 역할 |
|--------|------|
| admin@kanban.com | 관리자 |
| dev@kanban.com | 개발자 |
| designer@kanban.com | 디자이너 |

---

## 📁 생성되는 파일

```
kanban-board-project/
├── .env                    ← 직접 생성 필요
├── prisma/
│   └── dev.db              ← 자동 생성 (SQLite DB)
│   └── dev.db-journal      ← 자동 생성 (임시 파일)
└── node_modules/           ← 자동 생성
```

---

## 🔧 문제 해결

### "EPERM 에러"
→ 개발 서버를 완전히 종료하고 다시 시도

### "dev.db 파일이 없어요"
```bash
npx prisma db push
npm run prisma:seed
```

### "로그인이 안 돼요"
→ `.env` 파일이 프로젝트 루트에 있는지 확인

---

## ✨ 변경 사항 요약

1. ✅ **MySQL → SQLite** 전환
2. ✅ **@db.Text → String** 변환 (SQLite 호환)
3. ✅ **Json → String** 변환 (SQLite는 JSON 미지원)
4. ✅ **샘플 데이터** 자동 생성 스크립트
5. ✅ **자동 설정** 명령어 (`npm run setup`)
6. ✅ **완벽한 문서** (README, QUICK_START, SQLITE_SETUP)

---

**모든 준비가 완료되었습니다!** 🎊

