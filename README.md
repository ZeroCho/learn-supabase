# Supabase TypeScript 강의 예제 코드

이 저장소는 TypeScript와 Node.js를 사용하여 Supabase를 학습하기 위한 예제 코드입니다.

## 📚 강의 구성

### 섹션 1: Supabase 입문

- Supabase 클라이언트 초기화
- 연결 테스트

### 섹션 2: Database - SQL & ORM

- CRUD 작업
- Row Level Security (RLS)
- PostgreSQL 함수

### 섹션 3: Authentication - 인증 시스템

- Email/Password 인증
- OAuth 소셜 로그인

### 섹션 4: Storage - 파일 관리

- 파일 업로드/다운로드
- 이미지 변환

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. 예제 실행

```bash
# 연결 테스트
npm run test:connection

# 다른 예제들
ts-node src/examples/02-crud-operations.ts
ts-node src/examples/auth/01-email-password.ts
ts-node src/examples/storage/01-upload.ts
```

## 📁 프로젝트 구조

```
.
├── src/
│   ├── lib/
│   │   └── supabase.ts         # Supabase 클라이언트
│   ├── examples/
│   │   ├── 01-connection-test.ts
│   │   ├── 02-crud-operations.ts
│   │   ├── auth/
│   │   │   ├── 01-email-password.ts
│   │   │   └── 02-oauth.ts
│   │   └── storage/
│   │       └── 01-upload.ts
├── database/
│   └── schema.sql              # 데이터베이스 스키마
├── lessons/
│   ├── 01-supabase-introduction.md
│   ├── 02-database-sql-orm.md
│   ├── 03-authentication.md
│   └── ...
├── package.json
└── tsconfig.json
```

## 📖 강의 자료

각 강의의 자세한 내용은 `lessons/` 디렉토리에서 확인할 수 있습니다.

## 🔗 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [JavaScript 참조](https://supabase.com/docs/reference/javascript/introduction)

## 📝 라이선스

ISC
