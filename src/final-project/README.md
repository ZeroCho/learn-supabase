# 협업 칸반보드 프로젝트

Supabase를 활용한 실시간 협업 칸반보드 애플리케이션입니다.

## 기능

### 1단계: 회원가입/로그인

- Supabase Auth를 사용한 이메일/비밀번호 인증
- 회원가입 및 로그인 기능
- 세션 관리

### 2단계: 할일 목록 데이터베이스

- Supabase Database에 todos 테이블 사용
- 칸반보드 형태로 할일 표시 (할 일, 진행 중, 완료)
- 모든 사용자의 할일을 볼 수 있는 협업 기능
- 할일 생성, 수정, 삭제 기능

### 3단계: 이미지 업로드

- Supabase Storage를 사용한 이미지 업로드
- 할일별 이미지 첨부 기능
- 이미지 미리보기

### 4단계: AI 설명 생성

- Supabase Edge Functions를 사용한 AI 설명 생성
- 할일 제목을 입력하면 AI가 상세한 설명을 자동 생성
- OpenAI API 연동 (선택사항)

### 5단계: 실시간 업데이트

- Supabase Realtime을 사용한 실시간 동기화
- 다른 사용자가 할일을 추가/수정/삭제하면 즉시 반영
- 실시간 상태 변경 감지

## 시작하기

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 데이터베이스 설정

### 마이그레이션 실행

```bash
# Supabase CLI로 마이그레이션 적용
supabase db push
```

또는 Supabase Dashboard에서 다음 SQL을 실행하세요:

```sql
-- status 컬럼 추가
ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo';

-- image_url 컬럼 추가
ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ai_description 컬럼 추가
ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS ai_description TEXT;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_todos_status ON public.todos(status);

-- RLS 정책: 모든 인증된 사용자가 할일을 볼 수 있도록
DROP POLICY IF EXISTS "Users can view all todos" ON public.todos;
CREATE POLICY "Users can view all todos"
ON public.todos FOR SELECT
TO authenticated
USING (true);
```

### Storage 버킷 생성

1. Supabase Dashboard에서 Storage로 이동
2. "Create a new bucket" 클릭

**todo-images 버킷 (할일 이미지용):**

- 버킷 이름: `todo-images`
- Public bucket: 활성화
- File size limit: 5MB
- Allowed MIME types: `image/*`

**avatars 버킷 (사용자 아바타용):**

- 버킷 이름: `avatars`
- Public bucket: 활성화
- File size limit: 2MB
- Allowed MIME types: `image/*`

**Storage RLS 정책 설정:**

avatars 버킷의 경우, 모든 사용자가 읽을 수 있도록 정책을 설정하세요:

```sql
-- avatars 버킷 정책: 모든 인증된 사용자가 읽기 가능
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Edge Function 배포

### AI 설명 생성 함수 배포

```bash
# Edge Function 배포
supabase functions deploy generate-todo-description
```

### Claude API 키 설정 (선택사항)

Supabase Dashboard에서 Edge Functions의 환경 변수에 `ANTHROPIC_API_KEY`를 추가하세요.

**Claude API 키 발급:**
1. [Anthropic Console](https://console.anthropic.com/) 접속
2. API Keys 메뉴에서 새 키 생성
3. Supabase Dashboard → Edge Functions → Settings → Secrets에 추가

Claude API 키가 없어도 기본 설명이 생성됩니다.

## 프로젝트 구조

```
src/
├── components/
│   ├── Auth.tsx          # 인증 컴포넌트
│   ├── Dashboard.tsx     # 대시보드 통계
│   └── KanbanBoard.tsx   # 칸반보드 메인 컴포넌트
├── pages/
│   └── Home.tsx          # 메인 페이지
├── supabaseClient.ts     # Supabase 클라이언트
└── types/
    └── database.ts       # 데이터베이스 타입
```

## 기술 스택

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase
  - Auth: 인증
  - Database: PostgreSQL
  - Storage: 파일 저장
  - Realtime: 실시간 동기화
  - Edge Functions: 서버리스 함수

## 라이선스

MIT
