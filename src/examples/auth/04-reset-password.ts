import { supabase } from "../../lib/supabase";

async function resetPassword() {
  console.log("=== 비밀번호 재설정 ===\n");

  const email = "zerohch.0@gmail.com";

  // 비밀번호 재설정 이메일 전송
  console.log("1. 비밀번호 재설정 이메일 전송");
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) {
    console.error("재설정 오류:", error.message);
    return;
  }

  console.log("✅ 재설정 이메일 전송 완료");
  console.log("이메일을 확인하고 링크를 클릭하세요.");
}

// 비밀번호 업데이트 (실제로는 재설정 링크를 타고 들어온 페이지에서 실행)
async function updatePassword(newPassword: string) {
  console.log("\n2. 새 비밀번호 설정");
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("업데이트 오류:", error.message);
    return;
  }

  console.log("✅ 비밀번호 변경 완료");
}

resetPassword().catch(console.error);
