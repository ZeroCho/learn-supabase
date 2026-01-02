import { supabase } from "../lib/supabase";

async function transactions() {
  console.log("=== 트랜잭션 예제 ===\n");

  console.log("\n1. 로그인");
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: "zerohch0@gmail.com",
      password: "Zer0supabase!!",
    });

  if (signInError) {
    console.error("로그인 오류:", signInError.message);
  } else {
    console.log("✅ 로그인 성공");
    console.log("사용자 ID:", signInData.user?.id);
    console.log("세션:", signInData.session ? "활성화됨" : "없음");
  }

  // PostgreSQL RPC 함수를 사용한 트랜잭션
  // 먼저 데이터베이스에 함수를 생성해야 합니다 (lessons/02-database-sql-orm.md 참고)

  // RPC 호출
  const { data, error } = await supabase.rpc("create_todo_with_tag", {
    todo_title: "새 TODO",
    todo_description: "설명",
    tag_name: "중요",
  });

  if (error) {
    console.error("트랜잭션 오류:", error.message);
    console.log("💡 함수가 데이터베이스에 생성되지 않았을 수 있습니다.");
  } else {
    console.log("✅ 트랜잭션 성공:", data);
  }
}

transactions().catch(console.error);
