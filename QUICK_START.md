# ⚡ 빠른 시작 가이드 (CTO님께)

> **5분 안에 실행 가능합니다!** 🚀

---

## 📦 1단계: 환경 변수 설정 (30초)

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 복사하세요:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="kanban-board-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"
```

> **참고**: `ENV_TEMPLATE.txt` 파일을 참고하셔도 됩니다!

---

## 🚀 2단계: 자동 설치 및 실행 (4분)

### 옵션 A: 한 번에 설치 (권장)
```bash
npm run setup
```

이 명령어는 다음을 자동으로 실행합니다:
1. ✅ 의존성 설치
2. ✅ Prisma Client 생성
3. ✅ SQLite 데이터베이스 생성 (`prisma/dev.db`)
4. ✅ 샘플 데이터 추가 (테스트 계정 3개 + 보드 1개 + 카드 5개)

### 옵션 B: 단계별 설치
```bash
# 1. 의존성 설치
npm install

# 2. Prisma Client 생성
npx prisma generate

# 3. 데이터베이스 생성
npx prisma db push

# 4. 샘플 데이터 추가 (선택)
npm run prisma:seed
```

---

## 🎬 3단계: 개발 서버 실행 (10초)

```bash
npm run dev
```

브라우저에서 **http://localhost:3000** 접속!

---

## 🧪 테스트 계정

샘플 데이터가 포함된 테스트 계정 (비밀번호: `password123`):

| 이메일 | 역할 | 설명 |
|--------|------|------|
| `admin@kanban.com` | 관리자 | 모든 권한 (컬럼 관리, 멤버 삭제 등) |
| `dev@kanban.com` | 개발자 | 일반 멤버 |
| `designer@kanban.com` | 디자이너 | 일반 멤버 |

---

## ✨ 주요 기능 테스트

### 1️⃣ 드래그 & 드롭
- 카드를 다른 컬럼으로 드래그하여 이동
- 컬럼 내에서 카드 순서 변경

### 2️⃣ 카드 관리
- 카드 클릭 → 상세 정보 확인
- "수정" 버튼 → 카드 편집
- 체크리스트 추가/완료
- 댓글 작성 (Enter로 전송)

### 3️⃣ 라벨 & 필터
- 상단 "라벨 관리" 버튼 → 새 라벨 생성
- 카드 수정 시 라벨 추가
- 검색창으로 카드 검색
- 우선순위/담당자별 필터링

### 4️⃣ 팀 협업
- "멤버 초대" 버튼 → 새 멤버 추가
- 우측 사이드바에서 팀원 확인
- 활동 로그에서 팀 활동 추적

### 5️⃣ 커스텀 컬럼 (관리자만)
- "컬럼 관리" 버튼 → 새 컬럼 추가/수정/삭제

### 6️⃣ 다크 모드
- 우측 상단 프로필 → 테마 토글

---

## 📊 데이터베이스 확인 (선택)

Prisma Studio로 데이터를 시각적으로 확인:

```bash
npx prisma studio
```

브라우저에서 **http://localhost:5555** 접속!

---

## 🔧 문제 해결

### "dev.db 파일이 생성되지 않아요"
```bash
npx prisma generate
npx prisma db push --force-reset
npm run prisma:seed
```

### "EPERM 에러"
개발 서버를 종료하고 다시 시도하세요 (Ctrl + C)

### "모듈을 찾을 수 없어요"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "로그인이 안 돼요"
`.env` 파일이 프로젝트 루트에 있는지 확인하세요.

---

## 📁 프로젝트 구조 (간략)

```
kanban-board-project/
├── app/                    # Next.js 페이지 & API
├── components/             # React 컴포넌트
├── prisma/
│   ├── schema.prisma       # DB 스키마
│   ├── seed.ts             # 샘플 데이터
│   └── dev.db              # SQLite DB (자동 생성)
├── .env                    # 환경 변수 (직접 생성)
├── package.json
└── README.md               # 상세 문서
```

---

## 🎯 핵심 기능 요약

✅ **드래그 & 드롭** - 직관적인 카드 이동
✅ **실시간 협업** - Socket.io 기반 동기화
✅ **카드 라벨/태그** - 색상별 분류
✅ **체크리스트** - 세부 작업 관리
✅ **댓글 시스템** - 실시간 댓글
✅ **활동 로그** - 모든 활동 추적
✅ **마감일 알림** - 자동 알림
✅ **커스텀 컬럼** - 워크플로우 커스터마이징
✅ **다크 모드** - 테마 지원
✅ **검색 & 필터** - 빠른 카드 찾기

---

## 📞 추가 문의

- 상세 문서: `README.md`
- SQLite 설정: `SQLITE_SETUP.md`
- 환경 변수: `ENV_TEMPLATE.txt`

---

**즐거운 테스트 되세요!** 🎊

