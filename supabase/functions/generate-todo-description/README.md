# generate-todo-description Edge Function

할일 제목을 받아서 AI가 상세한 설명을 생성하는 Edge Function입니다.

## 배포 방법

### 1. Supabase CLI로 배포

```bash
# 프로젝트 루트에서 실행
supabase functions deploy generate-todo-description
```

### 2. 환경 변수 설정 (선택사항)

Claude API를 사용하려면 환경 변수를 설정하세요:

```bash
# Supabase CLI로 설정
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

또는 Supabase Dashboard에서:
1. Edge Functions → Settings
2. Secrets 섹션에서 `ANTHROPIC_API_KEY` 추가

**Claude API 키 발급 방법:**
1. [Anthropic Console](https://console.anthropic.com/) 접속
2. API Keys 메뉴에서 새 키 생성
3. 생성된 키를 환경 변수에 설정

### 3. Claude API 키 없이 사용

Claude API 키가 없어도 기본 설명이 생성됩니다.

## 함수 구조

```
supabase/functions/generate-todo-description/
└── index.ts  # 메인 함수 파일
```

## 사용 방법

```typescript
const { data, error } = await supabase.functions.invoke(
  "generate-todo-description",
  {
    body: { title: "할일 제목" },
  }
);

if (data) {
  console.log(data.description); // 생성된 설명
}
```

## 응답 형식

```json
{
  "description": "생성된 상세 설명..."
}
```

