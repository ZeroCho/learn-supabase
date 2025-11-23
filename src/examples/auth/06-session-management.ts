import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../../lib/supabase";

async function sessionManagement() {
  console.log("=== 세션 관리 ===\n");

  // 로그인
  await supabase.auth.signInWithPassword({
    email: "test@example.com",
    password: "securePassword123!",
  });

  // 1. 현재 세션 가져오기
  console.log("1. 현재 세션");
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("세션 오류:", sessionError.message);
    return;
  }

  if (session) {
    console.log("✅ 세션 정보:");
    console.log("Access Token:", session.access_token.substring(0, 20) + "...");
    console.log(
      "만료 시간:",
      new Date(session.expires_at! * 1000).toLocaleString()
    );
  }

  // 2. 토큰 새로고침
  console.log("\n2. 토큰 새로고침");
  const { data: refreshData, error: refreshError } =
    await supabase.auth.refreshSession();

  if (refreshError) {
    console.error("새로고침 오류:", refreshError.message);
  } else {
    console.log("✅ 토큰 새로고침 완료");
    console.log(
      "새 만료 시간:",
      new Date(refreshData.session!.expires_at! * 1000).toLocaleString()
    );
  }

  // 3. 모든 세션 조회
  console.log("\n3. 모든 세션 조회");
  const { data: sessionsData, error: sessionsError } =
    await supabase.auth.getUser();

  if (sessionsError) {
    console.error("세션 조회 오류:", sessionsError.message);
  } else {
    console.log("✅ 사용자 세션 정보 조회 완료");
    console.log("마지막 로그인:", sessionsData.user?.last_sign_in_at);
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

sessionManagement().catch(console.error);
