# 섹션 5: Edge Functions - 서버리스 함수

## 목표
Supabase Edge Functions로 API 엔드포인트를 구현합니다.

## 학습 내용

### 1. Edge Functions 아키텍처
- Deno 런타임
- 서버리스 실행
- 글로벌 배포

### 2. TypeScript로 함수 작성
- Handler 패턴
- 요청/응답 처리
- 미들웨어 활용

### 3. 환경 변수 관리
- Secrets 설정
- 보안 베스트 프랙티스

### 4. 외부 API 연동
- REST API 호출
- 에러 핸들링

## 실습 예제

### Edge Function 생성

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { name } = await req.json()
    
    const data = {
      message: `Hello ${name}!`,
    }

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
})
```

## 공식 문서
- [Edge Functions 가이드](https://supabase.com/docs/guides/functions)
- [Edge Functions 예제](https://supabase.com/docs/guides/functions/examples)
