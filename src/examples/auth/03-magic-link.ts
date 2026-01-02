import { supabase } from "../../lib/supabase";

async function magicLinkAuth() {
  console.log("=== Magic Link 인증 ===\n");

  const email = "zerohch.0@gmail.com";

  // Magic Link 전송
  console.log("1. Magic Link 전송");
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "http://localhost:3000/auth/callback",
    },
  });

  if (error) {
    console.error("Magic Link 오류:", error.message);
    return;
  }

  console.log("✅ Magic Link 전송 완료");
  console.log("이메일을 확인하고 링크를 클릭하세요.");
  console.log("반환 데이터:", data);
}

magicLinkAuth().catch(console.error);
