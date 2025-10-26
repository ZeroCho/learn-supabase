import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../../lib/supabase";

async function oauthLogin() {
  console.log("=== OAuth 소셜 로그인 ===\n");

  // OAuth 로그인 URL 생성
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("OAuth 오류:", error.message);
    return;
  }

  console.log("✅ OAuth URL 생성 완료");
  console.log("URL:", data.url);
  console.log("\n💡 이 URL을 브라우저에서 열어 로그인하세요.");
}

// 콜백 처리 예제
async function handleOAuthCallback() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("세션 오류:", error.message);
    return;
  }

  if (data.session) {
    console.log("✅ 로그인 성공");
    console.log("사용자:", data.session.user.email);
    console.log("공급자:", data.session.user.app_metadata.provider);
  }
}

oauthLogin().catch(console.error);
