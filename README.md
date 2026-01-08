# 🚀 팀 협업 칸반 보드

Next.js 16 + TypeScript + Prisma(SQLite) + Socket.io 기반 **실시간 협업 칸반**입니다. 드래그앤드롭, 역할 기반 멤버 관리, 실시간 알림/댓글/체크리스트를 포함해 바로 체험 가능한 데모 환경을 제공합니다.

---

## 🔎 한눈에 보기
- 실시간 동기화: 카드/댓글/초대/알림이 Socket.io로 즉시 반영
- 드래그앤드롭: @dnd-kit로 컬럼·카드 이동/정렬
- 팀 권한: 초대, Admin/Member 역할 분리, 컬럼/라벨 관리 권한 제어
- 카드 확장: 라벨, 우선순위, 담당자, 마감일, 체크리스트, 댓글
- 활동/알림: 10초 주기 활동 로그, 마감 임박/지연 알림, 카드/초대/댓글 알림
- 테마/접근성: 다크 모드, 반응형, 키보드 포커스 스타일

---

## ⚡ 5분 설치
필수: Node.js 18+, npm 9+

```bash
# 1) 의존성 + .env + DB + 시드까지 한번에
npm run setup

# 2) 개발 서버
npm run dev
# http://localhost:3000
```

---

## 🧪 테스트 계정 (비밀번호 `password123`)
| 이메일 | 역할 |
| --- | --- |
| admin@kanban.com | 관리자 |
| dev@kanban.com | 개발자 |
| designer@kanban.com | 디자이너 |

---

## 🖥️ 주요 화면
- 홈/랜딩: 브랜드 톤(블루-인디고-퍼플) CTA
- 로그인/회원가입: NextAuth 기반, 동일 팔레트 적용
- 보드 목록: 카드형 리스트, 새 보드 생성 모달
- 보드 상세: 컬럼/카드 드래그, 카드 상세(라벨·체크리스트·댓글·담당자·마감일·우선순위)
- 알림/활동: 카드/초대/댓글 알림, 10초 주기 활동 로그

---

## 🛠️ 기술 스택
- Frontend: Next.js 16(App Router), TypeScript, TailwindCSS 3.4, @dnd-kit
- Backend: Next.js API Routes, Prisma(SQLite), NextAuth v5, Socket.io, Zod
- Tooling: npm scripts(`setup`, `prisma:push`, `prisma:seed`), Prisma Studio

---

## 📁 프로젝트 구조 (요약)
```
app/            # App Router & API Routes
components/     # UI 및 보드 컴포넌트
lib/            # auth, prisma, socket 유틸
prisma/         # schema.prisma, seed.ts, dev.db
server.js       # Socket.io 엔트리
```

---

## 🔧 개발 명령어
```bash
npm run setup           # 설치 + env + DB push + seed
npm run dev             # 개발 서버
npm run prisma:generate # Prisma Client 생성
npm run prisma:push     # 스키마 반영
npm run prisma:seed     # 샘플 데이터
npm run build           # 프로덕션 빌드
npm start               # 프로덕션 실행
```

Prisma Studio
```bash
npx prisma studio  # http://localhost:5555
```

---

## 🐛 트러블슈팅
- dev.db 미생성: `npx prisma generate && npx prisma db push && npm run prisma:seed`
- .env 없음: `npm run create-env` 후 `npx prisma db push && npm run prisma:seed`
- EPERM/권한 오류: 서버 종료(Ctrl+C) 후 `npm run setup`

---

## 🙌 About
**칸반 보드 개발 김평화** — 실시간 협업/보드 경험을 빠르게 시연할 수 있는 경량 데모. GitHub에서 소스와 실행 가이드를 확인하고 5분 안에 로컬 체험이 가능합니다.
