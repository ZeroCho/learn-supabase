// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS 헤더 설정 (브라우저에서 호출 시 필요)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Credentials": "true",
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
    const message = `Hello ${name}! Secret is ${MY_SECRET}`;

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


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODMyMzI4NzB9.8kUvG8qNHwQWXfmZ4jfPIxeVjp7jb7c4yfIEQgKbP-Gv_QY3MQIFU-KzszP9Y9okhhm_a-KBx1jEcdDgSqa3rA' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
