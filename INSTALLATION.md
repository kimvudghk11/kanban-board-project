# 📦 설치 가이드

## ⚡ 빠른 설치 (권장)

```bash
# 모든 설정을 한 번에!
npm run setup
```

이 명령어가 자동으로 수행합니다:
1. ✅ npm 패키지 설치
2. ✅ `.env` 파일 생성
3. ✅ Prisma Client 생성
4. ✅ SQLite 데이터베이스 생성
5. ✅ 샘플 데이터 추가

---

## 🔧 수동 설치

### 1단계: 패키지 설치
```bash
npm install
```

### 2단계: 환경 변수 설정
```bash
npm run create-env
```

또는 직접 `.env` 파일 생성:
```env
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=kanban-board-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

> **주의**: 따옴표 없이 작성하세요!

### 3단계: Prisma 설정
```bash
npx prisma generate
npx prisma db push
```

### 4단계: 샘플 데이터 추가 (선택)
```bash
npm run prisma:seed
```

---

## 🚀 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속!

---

## 🧪 테스트 계정

| 이메일 | 비밀번호 |
|--------|----------|
| admin@kanban.com | password123 |
| dev@kanban.com | password123 |
| designer@kanban.com | password123 |

---

## 🐛 문제 해결

### EPERM 에러
개발 서버를 종료하고 다시 시도하세요:
```bash
Ctrl + C
npm run setup
```

### .env 파일이 없어요
```bash
npm run create-env
```

### 데이터베이스 초기화
```bash
npx prisma db push --force-reset
npm run prisma:seed
```

