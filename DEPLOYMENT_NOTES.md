# 🚢 배포 및 프로덕션 노트

## 📊 현재 상태: SQLite (개발/테스트용)

이 프로젝트는 **SQLite** 데이터베이스를 사용하여 간편한 테스트가 가능합니다.
프로젝트 폴더 내에 `prisma/dev.db` 파일로 모든 데이터가 저장됩니다.

---

## ⚠️ 프로덕션 배포 시 권장사항

### SQLite의 한계
- ❌ 동시 접속자 처리 제한
- ❌ 파일 기반 DB (서버리스 환경 부적합)
- ❌ 백업/복구 복잡
- ❌ 확장성 제한

### 프로덕션 권장 데이터베이스

#### 1️⃣ PostgreSQL (최고 권장)
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**장점**:
- ✅ 강력한 JSON 지원
- ✅ 높은 동시성
- ✅ 무료 호스팅 (Supabase, Neon, Railway)
- ✅ Vercel과 완벽 호환

#### 2️⃣ MySQL/MariaDB
```env
DATABASE_URL="mysql://user:password@host:3306/database"
```

**장점**:
- ✅ 널리 사용됨
- ✅ 안정적
- ✅ 많은 호스팅 옵션

#### 3️⃣ MongoDB (선택)
```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/database"
```

**장점**:
- ✅ NoSQL 유연성
- ✅ Atlas 무료 티어

---

## 🔄 데이터베이스 변경 방법

### 1단계: Prisma Schema 수정
`prisma/schema.prisma` 파일의 `datasource` 변경:

```prisma
datasource db {
  provider = "postgresql"  // 또는 "mysql", "mongodb"
  url      = env("DATABASE_URL")
}
```

### 2단계: 환경 변수 변경
`.env` 파일 수정:

```env
DATABASE_URL="postgresql://..."
```

### 3단계: 마이그레이션
```bash
# Prisma Client 재생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev --name init

# 또는 프로덕션
npx prisma migrate deploy
```

---

## 🌐 Vercel 배포 가이드

### 1️⃣ 데이터베이스 준비
- **Supabase** (PostgreSQL, 무료): https://supabase.com
- **PlanetScale** (MySQL, 무료): https://planetscale.com
- **Neon** (PostgreSQL, 무료): https://neon.tech

### 2️⃣ Vercel 프로젝트 생성
1. Vercel에 GitHub 저장소 연결
2. 환경 변수 설정:
   ```
   DATABASE_URL=your-production-database-url
   NEXTAUTH_SECRET=your-secure-random-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

### 3️⃣ 빌드 설정
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

### 4️⃣ 배포 후 마이그레이션
```bash
# Vercel CLI 사용
vercel env pull
npx prisma migrate deploy
```

---

## 🔐 보안 체크리스트

### 프로덕션 배포 전 확인사항

- [ ] `NEXTAUTH_SECRET` 강력한 랜덤 키로 변경
- [ ] `NEXTAUTH_URL` 프로덕션 도메인으로 변경
- [ ] `.env` 파일 `.gitignore`에 포함 확인
- [ ] 데이터베이스 연결 SSL 활성화
- [ ] CORS 설정 확인
- [ ] Rate Limiting 구현 (선택)
- [ ] 에러 로깅 설정 (Sentry 등)

---

## 📊 성능 최적화

### 데이터베이스 인덱스
Prisma Schema에 이미 주요 인덱스가 설정되어 있습니다:
- `@@index([boardId, createdAt])` - 활동 로그
- `@@index([columnId, position])` - 카드 정렬
- `@@index([userId, isRead])` - 알림

### 캐싱 전략
- Redis 또는 Vercel KV 사용 권장
- 보드 데이터 캐싱 (5분)
- 활동 로그 캐싱 (1분)

### Socket.io 최적화
- Redis Adapter 사용 (다중 서버 환경)
- 룸 기반 이벤트 전송

---

## 🔄 백업 전략

### SQLite (현재)
```bash
# 수동 백업
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
```

### PostgreSQL/MySQL
- 자동 백업 설정 (호스팅 제공자)
- 일일 백업 권장
- Point-in-time Recovery 활성화

---

## 📈 모니터링

### 권장 도구
- **Vercel Analytics** - 트래픽 분석
- **Sentry** - 에러 추적
- **Prisma Pulse** - 데이터베이스 모니터링
- **LogRocket** - 사용자 세션 기록

---

## 🚀 배포 체크리스트

- [ ] 데이터베이스 변경 (SQLite → PostgreSQL/MySQL)
- [ ] 환경 변수 설정
- [ ] Prisma 마이그레이션 실행
- [ ] 빌드 테스트
- [ ] 보안 설정 확인
- [ ] 성능 테스트
- [ ] 백업 설정
- [ ] 모니터링 설정
- [ ] 도메인 연결
- [ ] SSL 인증서 확인

---

**프로덕션 배포 전 이 문서를 꼭 확인하세요!** 🔒

