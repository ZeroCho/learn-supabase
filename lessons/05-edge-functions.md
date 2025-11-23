# 섹션 5: Edge Functions - 서버리스 함수

## 목표

Supabase Edge Functions로 API 엔드포인트를 구현합니다.

## 학습 내용

### 1. 백엔드 통신의 핵심: HTTP와 네트워크

Edge Functions를 다루기 전에, 웹 통신의 기본인 HTTP에 대해 알아야 합니다.

**HTTP Method (요청의 종류):**
- **GET**: 데이터를 조회할 때 (예: 게시글 목록 불러오기)
- **POST**: 데이터를 생성할 때 (예: 새 글 쓰기)
- **PUT / PATCH**: 데이터를 수정할 때
- **DELETE**: 데이터를 삭제할 때

**HTTP Status Code (응답의 상태):**
- **200 OK**: 성공!
- **201 Created**: 생성 성공!
- **400 Bad Request**: 요청이 잘못됨 (클라이언트 실수)
- **401 Unauthorized**: 로그인 필요
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 찾을 수 없음
- **500 Internal Server Error**: 서버 에러 (개발자 실수)

> **Tip**: Edge Functions에서 응답을 보낼 때, 적절한 Status Code를 설정하는 것이 중요합니다.

### 2. Edge Functions 아키텍처

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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { name } = await req.json();

    const data = {
      message: `Hello ${name}!`,
    };

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

## 공식 문서

- [Edge Functions 가이드](https://supabase.com/docs/guides/functions)
- [Edge Functions 예제](https://supabase.com/docs/guides/functions/examples)
