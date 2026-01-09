import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 요청 본문 파싱
    const { title } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Claude API 키 가져오기
    const claudeApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!claudeApiKey) {
      // Claude API 키가 없으면 간단한 설명 생성
      const simpleDescription = `"${title}"에 대한 상세한 작업 계획을 수립하고 단계별로 진행하세요. 필요한 리소스와 예상 소요 시간을 고려하여 체계적으로 접근하시기 바랍니다.`;
      
      return new Response(
        JSON.stringify({ description: simpleDescription }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Claude API 호출 (Anthropic Messages API)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `당신은 프로젝트 관리 전문가입니다. 다음 할일에 대한 구체적이고 실행 가능한 상세 설명을 작성해주세요.\n\n할일 제목: "${title}"\n\n설명은 2-3문장으로 간결하게 작성해주세요.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const description = data.content[0]?.text || "";

    return new Response(
      JSON.stringify({ description }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating description:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

