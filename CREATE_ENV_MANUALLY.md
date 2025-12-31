# ⚠️ .env 파일 수동 생성 가이드

Windows 환경에서 자동 생성에 문제가 있어서, **직접 만드는 것이 가장 확실**합니다!

---

## 📝 1단계: 메모장으로 .env 파일 생성

### 방법 1: VSCode 사용 (권장)
1. VSCode에서 프로젝트 폴더 열기
2. 새 파일 만들기 (Ctrl + N)
3. 아래 내용을 **정확히** 복사:

```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=kanban-board-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

4. 파일 저장 (Ctrl + S)
5. 파일명을 `.env`로 저장 (**확장자 없이**)
6. 저장 위치: 프로젝트 루트 (`E:\kanban-board-project\.env`)

### 방법 2: 메모장 사용
1. 메모장 열기
2. 아래 내용을 **정확히** 복사:

```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=kanban-board-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

3. 다른 이름으로 저장
4. 파일명: `.env` (따옴표 없이!)
5. 저장 위치: `E:\kanban-board-project`
6. **파일 형식: 모든 파일(*.*)**
7. 인코딩: UTF-8

---

## ✅ 2단계: 확인

터미널에서 실행:
```bash
type .env
```

**올바른 출력:**
```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=kanban-board-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
```

---

## 🚀 3단계: 데이터베이스 생성

```bash
npx prisma db push
```

```bash
npm run prisma:seed
```

```bash
npm run dev
```

---

## ⚠️ 주의사항

- ❌ **따옴표 넣지 마세요!** (DATABASE_URL="file:./dev.db" ❌)
- ✅ **따옴표 없이!** (DATABASE_URL=file:./dev.db ✅)
- ❌ 빈 줄 추가하지 마세요
- ❌ 공백 추가하지 마세요
- ✅ 정확히 3줄만!

---

**이 방법이 가장 확실합니다!** 💪

