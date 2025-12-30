# 🚀 칸반 보드 프로젝트 설치 가이드

## 📋 목차
1. [시스템 요구사항](#시스템-요구사항)
2. [데이터베이스 설정](#데이터베이스-설정)
3. [프로젝트 설치](#프로젝트-설치)
4. [환경 변수 설정](#환경-변수-설정)
5. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
6. [개발 서버 실행](#개발-서버-실행)
7. [문제 해결](#문제-해결)

## 💻 시스템 요구사항

- **Node.js**: v20.14.0 이상
- **npm**: v10.7.0 이상
- **MySQL** 또는 **MariaDB**: 5.7 이상
- **운영체제**: Windows, macOS, Linux

### Node.js 버전 확인

\`\`\`bash
node --version
npm --version
\`\`\`

## 🗄️ 데이터베이스 설정

### MySQL/MariaDB 설치

#### Windows
1. [MySQL 공식 사이트](https://dev.mysql.com/downloads/installer/)에서 설치 프로그램 다운로드
2. MySQL Installer 실행
3. "Developer Default" 선택하여 설치
4. Root 비밀번호 설정

#### macOS (Homebrew)
\`\`\`bash
brew install mysql
brew services start mysql
\`\`\`

#### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
\`\`\`

### 데이터베이스 생성

MySQL에 접속:
\`\`\`bash
mysql -u root -p
\`\`\`

데이터베이스 생성:
\`\`\`sql
CREATE DATABASE kanban_board CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
\`\`\`

## 📦 프로젝트 설치

### 1. 의존성 패키지 설치

프로젝트 루트 디렉토리에서:
\`\`\`bash
npm install
\`\`\`

설치되는 주요 패키지:
- Next.js 14 (App Router)
- Prisma ORM
- NextAuth.js
- Socket.io
- @dnd-kit (Drag & Drop)
- TailwindCSS

## 🔐 환경 변수 설정

### 1. .env 파일 생성

프로젝트 루트에 \`.env\` 파일을 생성하세요:

\`\`\`bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
\`\`\`

### 2. 환경 변수 설정

\`.env\` 파일을 열고 다음 값들을 수정하세요:

\`\`\`env
# Database 연결 문자열
# 형식: mysql://사용자명:비밀번호@호스트:포트/데이터베이스명
DATABASE_URL="mysql://root:your_password@localhost:3306/kanban_board"

# NextAuth.js 비밀 키 (아래 명령어로 생성)
NEXTAUTH_SECRET="생성된_비밀키를_여기에_붙여넣기"

# NextAuth.js URL (개발: localhost, 프로덕션: 실제 도메인)
NEXTAUTH_URL="http://localhost:3000"

# Socket.io 서버 URL
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
\`\`\`

### 3. NEXTAUTH_SECRET 생성

**Windows (PowerShell):**
\`\`\`powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

**macOS/Linux:**
\`\`\`bash
openssl rand -base64 32
\`\`\`

생성된 키를 \`NEXTAUTH_SECRET\`에 붙여넣으세요.

### 4. DATABASE_URL 설정 예시

\`\`\`env
# 로컬 개발 환경
DATABASE_URL="mysql://root:password123@localhost:3306/kanban_board"

# 원격 서버
DATABASE_URL="mysql://admin:securepass@192.168.1.100:3306/kanban_board"

# SSL 연결이 필요한 경우
DATABASE_URL="mysql://user:pass@host:3306/db?sslaccept=strict"
\`\`\`

## 🛠️ 데이터베이스 마이그레이션

### 1. Prisma 클라이언트 생성

\`\`\`bash
npx prisma generate
\`\`\`

이 명령어는 Prisma 스키마를 기반으로 TypeScript 타입과 클라이언트를 생성합니다.

### 2. 데이터베이스 스키마 적용

\`\`\`bash
npx prisma db push
\`\`\`

이 명령어는:
- Prisma 스키마를 데이터베이스에 적용
- 테이블, 인덱스, 관계 생성

### 3. (선택사항) Prisma Studio 실행

데이터베이스를 GUI로 확인하고 관리:
\`\`\`bash
npx prisma studio
\`\`\`

브라우저에서 [http://localhost:5555](http://localhost:5555) 열림

## 🎉 개발 서버 실행

### 개발 모드로 실행

\`\`\`bash
npm run dev
\`\`\`

서버가 시작되면:
- 메인 페이지: [http://localhost:3000](http://localhost:3000)
- 로그인: [http://localhost:3000/login](http://localhost:3000/login)
- 회원가입: [http://localhost:3000/register](http://localhost:3000/register)

### 프로덕션 빌드

\`\`\`bash
# 빌드
npm run build

# 프로덕션 서버 시작
npm start
\`\`\`

## 📱 첫 사용자 생성

1. [http://localhost:3000](http://localhost:3000) 접속
2. "회원가입" 클릭
3. 이름, 이메일, 비밀번호 입력
4. 회원가입 완료 후 로그인
5. 보드 생성 시작!

## 🐛 문제 해결

### 데이터베이스 연결 실패

**오류:** \`Can't reach database server\`

**해결방법:**
1. MySQL/MariaDB 서비스가 실행 중인지 확인:
   \`\`\`bash
   # Windows
   net start MySQL

   # macOS
   brew services list

   # Linux
   sudo systemctl status mysql
   \`\`\`

2. \`DATABASE_URL\` 값이 올바른지 확인
3. 방화벽이 포트 3306을 차단하지 않는지 확인

### Prisma 마이그레이션 오류

**오류:** \`P1001: Can't reach database server\`

**해결방법:**
\`\`\`bash
# 데이터베이스 연결 테스트
npx prisma db pull

# Prisma 클라이언트 재생성
npx prisma generate

# 스키마 재적용
npx prisma db push --force-reset
\`\`\`

### Next.js 빌드 오류

**오류:** \`Module not found\` 또는 타입 오류

**해결방법:**
\`\`\`bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 캐시 삭제
rm -rf .next
npm run dev
\`\`\`

### NextAuth 세션 오류

**오류:** \`[next-auth][error][SIGNIN_ERROR]\`

**해결방법:**
1. \`NEXTAUTH_SECRET\`이 설정되어 있는지 확인
2. \`NEXTAUTH_URL\`이 올바른지 확인 (http:// 포함)
3. 브라우저 쿠키 삭제 후 재시도

### 포트 3000 이미 사용 중

**오류:** \`Port 3000 is already in use\`

**해결방법:**
\`\`\`bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID번호> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# 또는 다른 포트 사용
PORT=3001 npm run dev
\`\`\`

### bcryptjs 오류 (Windows)

**오류:** \`bcrypt Error: Unable to find binding.node\`

**해결방법:**
\`\`\`bash
npm uninstall bcrypt
npm install bcryptjs
\`\`\`

## 📊 데이터베이스 스키마

설치 완료 후 다음 테이블이 생성됩니다:

- **User**: 사용자 정보
- **Board**: 보드(프로젝트)
- **BoardMember**: 보드 멤버십
- **Column**: 칸반 컬럼
- **Card**: 카드(이슈)
- **Comment**: 카드 댓글

## 🎯 다음 단계

설치가 완료되었다면:
1. ✅ 회원가입 및 로그인
2. ✅ 첫 번째 보드 생성
3. ✅ 카드 추가 및 관리
4. 🚧 Drag & Drop 기능 구현 (다음 단계)
5. 🚧 실시간 동기화 구현 (다음 단계)

## 💡 개발 팁

### Prisma Studio 사용
\`\`\`bash
npx prisma studio
\`\`\`
데이터베이스를 시각적으로 관리할 수 있습니다.

### 타입 자동 완성
Prisma는 자동으로 TypeScript 타입을 생성하므로, IDE에서 자동 완성이 가능합니다.

### 핫 리로드
개발 모드에서 파일을 수정하면 자동으로 새로고침됩니다.

## 📚 추가 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [NextAuth.js 문서](https://next-auth.js.org)
- [TailwindCSS 문서](https://tailwindcss.com/docs)

## 🆘 지원

문제가 계속되면:
1. GitHub Issues에 문제 보고
2. 에러 메시지 전체 복사
3. 환경 정보 포함 (OS, Node.js 버전 등)

---

**설치 완료!** 이제 칸반 보드 개발을 시작하세요! 🎉

