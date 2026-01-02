import { supabase } from "../../lib/supabase";

async function userProfile() {
  console.log("=== 사용자 프로필 관리 ===\n");

  // 로그인 (예시)
  await supabase.auth.signInWithPassword({
    email: "zerohch.0@gmail.com",
    password: "Zer0supabase@@",
  });

  // 1. 현재 사용자 정보 가져오기
  console.log("1. 사용자 정보 조회");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("사용자 오류:", userError.message);
    return;
  }

  console.log("✅ 사용자 정보:");
  console.log("ID:", user?.id);
  console.log("이메일:", user?.email);
  console.log("생성일:", user?.created_at);
  console.log("메타데이터:", user?.user_metadata);

  // 2. 사용자 메타데이터 업데이트
  console.log("\n2. 메타데이터 업데이트");
  const { data: updateData, error: updateError } =
    await supabase.auth.updateUser({
      data: {
        full_name: "Updated Name",
        avatar_url: "https://example.com/avatar.jpg",
        preferences: {
          theme: "dark",
          language: "ko",
        },
      },
    });

  if (updateError) {
    console.error("업데이트 오류:", updateError.message);
  } else {
    console.log("✅ 메타데이터 업데이트 완료");
    console.log("새 메타데이터:", updateData.user.user_metadata);
  }

  // 3. 이메일 변경
  console.log("\n3. 이메일 변경");
  const { error: emailError } = await supabase.auth.updateUser({
    email: "newemail@example.com",
  });

  if (emailError) {
    console.error("이메일 오류:", emailError.message);
  } else {
    console.log("✅ 이메일 변경 요청 완료");
    console.log("이메일 인증이 필요합니다.");
  }
}

userProfile().catch(console.error);
