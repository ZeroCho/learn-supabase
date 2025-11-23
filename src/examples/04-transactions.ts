import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../lib/supabase";

async function transactions() {
  console.log("=== 트랜잭션 예제 ===\n");

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
