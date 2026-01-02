# 섹션 5: Edge Functions - 서버리스 함수

## 목표

Supabase Edge Functions로 API 엔드포인트를 구현합니다.

## 학습 내용

### 1. 백엔드 통신의 핵심: HTTP와 네트워크
Edge Functions는 웹 표준 Request/Response 객체를 사용하는 HTTP 서버입니다.
- **Method**: GET, POST, PUT, DELETE 등 요청의 목적을 구분합니다.
- **Status Code**: 200(성공), 400(잘못된 요청), 401(인증 실패), 500(서버 오류) 등 처리 결과를 명확히 전달해야 합니다.
- **CORS**: 브라우저에서 직접 호출하려면 CORS(Cross-Origin Resource Sharing) 헤더 설정이 필수적입니다.

### 2. Edge Functions 아키텍처 (Deno)
Supabase Edge Functions는 Node.js가 아닌 **Deno** 런타임에서 실행됩니다.
- **TypeScript 기본 지원**: 별도의 설정 없이 TypeScript를 바로 실행할 수 있습니다.
- **URL Import**: npm install 대신 URL을 통해 패키지를 임포트합니다 (예: `import ... from "https://deno.land/..."`).
- **Edge 배포**: 전 세계 곳곳에 있는 서버(Edge)에 배포되어 사용자에게 가장 가까운 곳에서 실행되므로 응답 속도가 빠릅니다.

### 3. 환경 변수 관리
API 키나 비밀번호 같은 민감한 정보는 코드에 하드코딩하지 않고 환경 변수로 관리합니다.
- **설정**: `supabase secrets set MY_KEY=value` 명령어나 대시보드에서 설정합니다.
- **사용**: 코드 내에서 `Deno.env.get("MY_KEY")`로 접근합니다.

### 4. 외부 API 연동
Edge Functions는 외부 서비스(OpenAI, Stripe, Slack 등)와 연동하는 접착제 역할을 하기에 가장 적합합니다.
- 데이터베이스 트리거(Webhook)와 연동하여 데이터 변경 시 알림을 보내거나, AI 처리를 수행할 수 있습니다.

## 실습 예제

### Edge Function 생성 및 배포

Edge Functions는 주로 Supabase CLI를 사용하여 개발하고 배포합니다.

1.  **Supabase CLI 설치 및 로그인:**
    ```bash
    npm install -g supabase
    supabase login
    ```

2.  **프로젝트 초기화 (이미 되어있다면 생략):**
    ```bash
    supabase init
    ```

3.  **새 함수 생성:**
    ```bash
    supabase functions new hello-world
    ```
    이 명령은 `supabase/functions/hello-world/index.ts` 파일을 생성합니다.

4.  **로컬 테스트:**
    ```bash
    supabase start
    supabase functions serve hello-world --no-verify-jwt
    ```

5.  **배포:**
    ```bash
    supabase functions deploy hello-world
    ```
    배포 후 Dashboard의 `Edge Functions` 메뉴에서 함수 URL과 로그를 확인할 수 있습니다.

### Edge Function 예제 코드

```typescript
// src/05-edge-functions/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS 헤더 설정 (브라우저에서 호출 시 필요)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // OPTIONS 요청 처리 (CORS Preflight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 환경 변수 가져오기 (Supabase Dashboard에서 설정)
    const MY_SECRET = Deno.env.get("MY_SECRET_KEY");

    // 요청 바디 파싱
    const { name } = await req.json();

    // 비즈니스 로직 처리
    const message = `Hello ${name}! Secret is ${MY_SECRET ? "set" : "not set"}`;

    // 응답 반환
    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

## 공식 문서

- [Edge Functions 가이드](https://supabase.com/docs/guides/functions)
- [Edge Functions 예제](https://supabase.com/docs/guides/functions/examples)
