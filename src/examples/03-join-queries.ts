import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../lib/supabase";

async function joinQueries() {
  console.log("=== JOIN 쿼리 예제 ===\n");

  // 사용자의 TODO와 프로필 정보를 함께 가져오기
  // profiles!todos_user_id_fkey는 외래 키 제약 조건 이름에 따라 달라질 수 있음
  const { data, error } = await supabase
    .from("todos")
    .select(
      `
      *,
      profiles (
        username,
        full_name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("오류:", error.message);
    return;
  }

  console.log("✅ TODO 목록 (프로필 정보 포함):");
  data?.forEach((todo: any) => {
    console.log(`
      - 제목: ${todo.title}
      - 작성자: ${todo.profiles?.full_name || todo.profiles?.username || "Unknown"}
      - 완료 여부: ${todo.completed ? "✅" : "⏳"}
      - 생성일: ${new Date(todo.created_at).toLocaleString()}
    `);
  });
}

joinQueries().catch(console.error);
