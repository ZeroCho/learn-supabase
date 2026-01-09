# 섹션 10: 실전 프로젝트 - 협업 칸반보드

## 목표

전체 기능을 통합한 협업 칸반보드 애플리케이션을 개발합니다. 여러 사용자가 함께 작업할 수 있는 실시간 협업 도구를 만들어봅니다.

## 프로젝트 개요

이 프로젝트는 팀원들과 함께 사용할 수 있는 협업 칸반보드입니다. 각 사용자는 자신의 할일을 만들고, 다른 팀원들의 작업도 함께 볼 수 있어 전체 프로젝트 진행 상황을 한눈에 파악할 수 있습니다.

## 강의 진행 단계

### 1단계: 회원가입/로그인 만들기

- Supabase Auth를 사용한 이메일/비밀번호 인증 구현
- 회원가입 및 로그인 폼 생성
- 세션 관리 및 인증 상태 확인
- 사용자 프로필 정보 표시

### 2단계: 할일 목록 데이터베이스에 집어넣기

- Supabase Database에 todos 테이블 생성
- RLS(Row Level Security) 정책 설정으로 모든 사용자가 할일을 볼 수 있도록 구성
- 칸반보드 형태로 할일 표시 (Todo, In Progress, Done)
- 할일 생성, 수정, 삭제 기능 구현
- 사용자별 할일 구분 표시

### 3단계: 이미지 업로드 기능 추가하기

- Supabase Storage를 사용한 이미지 업로드 기능 구현
- 할일별 이미지 첨부 기능
- 이미지 미리보기 및 삭제 기능
- Storage 버킷 및 RLS 정책 설정

### 4단계: AI한테 구체적인 내용 작성해달라고 하기

- Supabase Edge Functions를 사용한 AI 설명 생성 기능
- 할일 제목을 입력하면 AI가 상세한 설명을 자동 생성
- OpenAI API 또는 Supabase AI 기능 활용
- 생성된 설명을 할일의 description 필드에 저장

### 5단계: 실시간으로 업데이트되게 만들기

- Supabase Realtime을 사용한 실시간 동기화
- 다른 사용자가 할일을 추가/수정/삭제하면 즉시 반영
- 실시간 상태 변경 감지 및 UI 업데이트
- 사용자별 실시간 활동 표시
- **Presence 기능으로 팀원 접속 상태 확인**
  - 현재 접속 중인 사용자 목록 표시
  - 온라인/오프라인 상태 실시간 업데이트
- **편집 중인 할일 표시**
  - 특정 할일을 편집 중인 사용자 표시
  - "편집 중..." 인디케이터로 동시 편집 방지
  - Presence를 사용한 실시간 편집 상태 추적

## 프로젝트 요구사항

1. **인증**: Email/Password 인증
2. **Database**: CRUD + RLS (모든 사용자 읽기 권한)
3. **Storage**: 이미지 파일 첨부
4. **Realtime**: 실시간 협업 업데이트
5. **Edge Functions**: AI 기반 설명 생성

## 구현 가이드

### 데이터베이스 설정

1. **마이그레이션 실행**

   ```bash
   supabase db push
   ```

   또는 Supabase Dashboard에서 SQL 에디터를 사용하여 마이그레이션 파일의 SQL을 실행합니다.

2. **Storage 버킷 생성**

   - Supabase Dashboard → Storage → New bucket

   **todo-images 버킷 (할일 이미지용):**

   - 버킷 이름: `todo-images`
   - Public bucket 활성화
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

   **avatars 버킷 (사용자 아바타용):**

   - 버킷 이름: `avatars`
   - Public bucket 활성화
   - File size limit: 2MB
   - Allowed MIME types: `image/*`

   **Storage RLS 정책 (avatars 버킷):**

   ```sql
   CREATE POLICY "Avatar images are publicly accessible"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'avatars');
   ```

3. **RLS 정책 확인**
   - 모든 인증된 사용자가 todos 테이블을 읽을 수 있도록 정책이 설정되어 있는지 확인합니다.

### Edge Function 배포

1. **함수 배포**

   ```bash
   supabase functions deploy generate-todo-description
   ```

2. **환경 변수 설정 (선택사항)**

   - Supabase Dashboard → Edge Functions → Settings
   - `ANTHROPIC_API_KEY` 환경 변수 추가 (Claude API를 사용하는 경우)

   **Claude API 키 발급:**

   - [Anthropic Console](https://console.anthropic.com/) 접속
   - API Keys 메뉴에서 새 키 생성

### 프로젝트 실행

1. **환경 변수 설정**

   - `.env` 파일 생성
   - `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY` 설정

2. **의존성 설치 및 실행**
   ```bash
   npm install
   npm run dev
   ```

## 각 단계별 체크리스트

### ✅ 1단계: 회원가입/로그인 만들기

- [ ] Auth 컴포넌트가 정상 작동하는지 확인
- [ ] 회원가입 후 이메일 인증 확인
- [ ] 로그인 후 세션이 유지되는지 확인

### ✅ 2단계: 할일 목록 데이터베이스에 집어넣기

- [ ] todos 테이블에 데이터가 정상적으로 저장되는지 확인
- [ ] 칸반보드에 할일이 표시되는지 확인
- [ ] 다른 사용자의 할일도 보이는지 확인 (협업 기능)
- [ ] 상태 변경이 정상 작동하는지 확인

### ✅ 3단계: 이미지 업로드 기능 추가하기

- [ ] Storage 버킷이 생성되어 있는지 확인
- [ ] 이미지 업로드가 정상 작동하는지 확인
- [ ] 업로드된 이미지가 할일 카드에 표시되는지 확인

### ✅ 4단계: AI한테 구체적인 내용 작성해달라고 하기

- [ ] Edge Function이 배포되어 있는지 확인
- [ ] AI 설명 생성 버튼이 정상 작동하는지 확인
- [ ] 생성된 설명이 할일 카드에 표시되는지 확인

### ✅ 5단계: 실시간으로 업데이트되게 만들기

- [ ] 다른 브라우저/탭에서 할일을 추가/수정/삭제했을 때 즉시 반영되는지 확인
- [ ] 실시간 업데이트가 정상 작동하는지 확인
- [ ] 현재 접속 중인 팀원 목록이 표시되는지 확인
- [ ] 다른 사용자가 접속/접속 해제할 때 목록이 실시간으로 업데이트되는지 확인
- [ ] 특정 할일을 편집 중인 사용자가 표시되는지 확인
- [ ] 편집 중인 할일 카드에 "편집 중..." 인디케이터가 표시되는지 확인

## 5단계 상세 구현 가이드

### Presence를 사용한 접속 상태 확인

Supabase Realtime의 Presence 기능을 사용하여 현재 접속 중인 사용자를 추적합니다.

```typescript
const presenceChannel = supabase.channel("kanban-presence");

presenceChannel
  .on("presence", { event: "sync" }, () => {
    const state = presenceChannel.presenceState();
    // 접속 중인 사용자 목록 업데이트
  })
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      // 내 접속 상태 전송
      await presenceChannel.track({
        user_id: currentUserId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

### 편집 중인 할일 표시

Presence를 사용하여 특정 할일을 편집 중인 사용자를 추적합니다.

```typescript
// 할일 카드에 마우스를 올리면 편집 시작
onMouseEnter={() => onStartEditing(todo.todo_id)}

// 마우스를 떼면 편집 종료
onMouseLeave={() => onStopEditing()}

// Presence로 편집 상태 전송
presenceChannel.track({
  user_id: currentUserId,
  online_at: new Date().toISOString(),
  editing_todo_id: todoId, // 편집 중인 할일 ID
});
```

### UI 컴포넌트

1. **OnlineUsers 컴포넌트**: 접속 중인 사용자 목록 표시
2. **KanbanBoard 컴포넌트**: 편집 중인 할일에 "편집 중..." 인디케이터 표시

## 공식 문서

- [Realtime 가이드](https://supabase.com/docs/guides/realtime)
- [Realtime Presence](https://supabase.com/docs/guides/realtime/presence)
- [Storage 가이드](https://supabase.com/docs/guides/storage)
- [Edge Functions 가이드](https://supabase.com/docs/guides/functions)

## 마치며: 당신은 이제 풀스택 개발자입니다

축하합니다! 이 강의를 통해 여러분은 프론트엔드부터 백엔드, 데이터베이스, AI 기능까지 모두 다루는 경험을 했습니다.

이제 여러분은 단순히 "화면을 그리는 사람"이 아닙니다.
**"아이디어를 실제 서비스로 구현하고, 배포하여 사용자에게 가치를 전달하는 메이커(Maker)"**입니다.

AI 시대, 기술의 장벽은 점점 낮아지고 있습니다. 중요한 것은 **"무엇을 만들 것인가"**입니다.
Supabase라는 강력한 무기를 손에 쥔 여러분이 만들어갈 멋진 서비스들을 기대하겠습니다.

화이팅! 🚀
