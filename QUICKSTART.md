# ⚡ 빠른 시작 가이드

실시간 칸반 보드를 3분 안에 실행하세요!

## 🚀 5단계로 시작하기

### 1단계: 환경 변수 확인

`.env` 파일이 이미 생성되어 있습니다:

```env
DATABASE_URL=mysql://root:password@localhost:3306/kanban_board
NEXTAUTH_SECRET=XCb/exE/je7+OoIdtfJLkownoJi2IVthmj9nasjGRiM=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

**MySQL 비밀번호 수정:**
- `.env` 파일을 열고 `DATABASE_URL`의 `password` 부분을 실제 MySQL 비밀번호로 변경하세요.

### 2단계: MySQL 데이터베이스 생성

MySQL에 접속하여 데이터베이스를 생성하세요:

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE kanban_board;
EXIT;
```

### 3단계: 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 스키마 적용
npm run prisma:push
```

### 4단계: 개발 서버 실행

```bash
npm run dev
```

### 5단계: 브라우저에서 확인

[http://localhost:3000](http://localhost:3000) 접속!

---

## ✅ 기능 확인

### 1. 회원가입
1. "회원가입" 버튼 클릭
2. 이름, 이메일, 비밀번호 입력
3. 회원가입 완료

### 2. 로그인
1. 등록한 이메일과 비밀번호로 로그인
2. 보드 목록 페이지로 이동

### 3. 보드 생성
1. "+ 새 보드 만들기" 버튼 클릭
2. 보드 이름과 설명 입력
3. 보드가 자동으로 "To Do", "In Progress", "Done" 컬럼과 함께 생성됨

### 4. 카드 추가
1. 원하는 컬럼의 "+" 버튼 클릭
2. 카드 정보 입력 (제목, 설명, 우선순위, 마감일)
3. 카드 생성 완료

### 5. Drag & Drop
1. 카드를 마우스로 드래그
2. 다른 컬럼으로 이동
3. 위치가 자동으로 저장됨

### 6. 카드 수정/삭제
1. 카드 클릭
2. 상세 정보 수정 또는 삭제

---

## 🐛 문제 해결

### MySQL 연결 실패

**에러:** `Authentication failed against database server`

**해결:**
1. MySQL이 실행 중인지 확인
2. `.env` 파일의 비밀번호가 올바른지 확인
3. 데이터베이스 `kanban_board`가 생성되었는지 확인

### 포트 3000 사용 중

다른 포트로 실행:

```bash
PORT=3001 npm run dev
```

### Prisma 오류

캐시 삭제 후 재시도:

```bash
rm -rf node_modules .next
npm install
npm run prisma:generate
```

---

## 🎯 주요 기능

✅ **로그인/회원가입** - NextAuth.js  
✅ **Drag & Drop** - @dnd-kit  
✅ **실시간 동기화** - Socket.io (커스텀 서버)  
✅ **이슈 관리** - 카드 CRUD, 우선순위, 마감일  
✅ **반응형 UI** - TailwindCSS  

---

## 📚 더 알아보기

- 상세 설치 가이드: [SETUP.md](./SETUP.md)
- 프로젝트 문서: [README.md](./README.md)
- Prisma Studio: `npx prisma studio`

---

**축하합니다! 🎉 실시간 칸반 보드가 실행되었습니다!**

