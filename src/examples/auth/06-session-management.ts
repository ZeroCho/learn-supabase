import { supabase } from "../../lib/supabase";

async function sessionManagement() {
  console.log("=== 세션 관리 ===\n");

  // 로그인
  await supabase.auth.signInWithPassword({
    email: "zerohch.0@gmail.com",
    password: "Zer0supabase@@",
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
    console.log(
      "  - 세션은 Access Token, Refresh Token, 사용자 정보를 포함합니다"
    );
    console.log(
      "  - Access Token:",
      session.access_token.substring(0, 20) + "..."
    );
    console.log(
      "  - 만료 시간:",
      new Date(session.expires_at! * 1000).toLocaleString()
    );
  }

  // 2. 세션 새로고침 (세션 내의 Access Token을 Refresh Token으로 갱신)
  console.log("\n2. 세션 새로고침");
  console.log("   (세션을 새로고침하면 내부의 Access Token이 갱신됩니다)");
  const { data: refreshData, error: refreshError } =
    await supabase.auth.refreshSession();

  if (refreshError) {
    console.error("새로고침 오류:", refreshError.message);
  } else {
    console.log("✅ 세션 새로고침 완료");
    console.log("  - 새로운 Access Token이 발급되었습니다");
    console.log(
      "  - 새 만료 시간:",
      new Date(refreshData.session!.expires_at! * 1000).toLocaleString()
    );
  }

  // 3. 사용자 정보 조회 (세션과 별개)
  console.log("\n3. 사용자 정보 조회");
  const { data: sessionsData, error: sessionsError } =
    await supabase.auth.getUser();

  if (sessionsError) {
    console.error("사용자 정보 조회 오류:", sessionsError.message);
  } else {
    console.log("✅ 사용자 정보 조회 완료");
    console.log("  - 사용자 ID:", sessionsData.user?.id);
    console.log("  - 이메일:", sessionsData.user?.email);
    console.log("  - 마지막 로그인:", sessionsData.user?.last_sign_in_at);
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
