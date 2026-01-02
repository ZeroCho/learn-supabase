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
