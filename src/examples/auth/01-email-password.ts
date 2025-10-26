import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../../lib/supabase";

async function emailPasswordAuth() {
  console.log("=== Email/Password 인증 ===\n");

  const email = "test@example.com";
  const password = "securePassword123!";

  // 1. 회원가입
  console.log("1. 회원가입");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Test User",
        username: "testuser",
      },
    },
  });

  if (signUpError) {
    console.error("회원가입 오류:", signUpError.message);
  } else {
    console.log("✅ 회원가입 성공:", signUpData.user?.email);
    console.log("이메일 확인이 필요할 수 있습니다.");
  }

  // 2. 로그인
  console.log("\n2. 로그인");
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    console.error("로그인 오류:", signInError.message);
  } else {
    console.log("✅ 로그인 성공");
    console.log("사용자 ID:", signInData.user?.id);
    console.log("세션:", signInData.session ? "활성화됨" : "없음");
  }

  // 3. 현재 세션 확인
  console.log("\n3. 세션 확인");
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("세션 오류:", sessionError.message);
  } else {
    console.log("✅ 현재 세션:", session ? "활성화됨" : "없음");
    if (session) {
      console.log("사용자:", session.user.email);
      console.log(
        "만료 시간:",
        new Date(session.expires_at! * 1000).toLocaleString()
      );
    }
  }

  // 4. 로그아웃
  console.log("\n4. 로그아웃");
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error("로그아웃 오류:", signOutError.message);
  } else {
    console.log("✅ 로그아웃 완료");
  }
}

emailPasswordAuth().catch(console.error);
