import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../lib/supabase";

async function crudOperations() {
  console.log("=== CRUD 작업 예제 ===\n");

  // 1. CREATE - 데이터 삽입
  console.log("1. CREATE 작업");
  const { data: insertedTodo, error: insertError } = await supabase
    .from("todos")
    .insert({
      title: "Supabase 학습하기",
      description: "TypeScript로 Supabase 다루기",
      completed: false,
      user_id: "USER_ID_PLACEHOLDER" // 실제 실행 시 유효한 UUID로 교체 필요
    })
    .select()
    .single();

  if (insertError) {
    console.error("삽입 오류:", insertError.message);
    console.log("💡 로그인이 필요하거나 RLS 정책을 확인하세요.\n");
  } else {
    console.log("✅ 생성된 TODO:", insertedTodo);
  }

  // 2. READ - 데이터 조회
  console.log("\n2. READ 작업");
  const { data: todos, error: readError } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (readError) {
    console.error("조회 오류:", readError.message);
  } else {
    console.log("✅ TODO 목록:", todos);
  }

  // 3. UPDATE - 데이터 업데이트
  console.log("\n3. UPDATE 작업");
  if (insertedTodo) {
    const { data: updatedTodo, error: updateError } = await supabase
      .from("todos")
      .update({ completed: true })
      .eq("id", insertedTodo.id)
      .select()
      .single();

    if (updateError) {
      console.error("업데이트 오류:", updateError.message);
    } else {
      console.log("✅ 업데이트된 TODO:", updatedTodo);
    }
  }

  // 4. DELETE - 데이터 삭제
  console.log("\n4. DELETE 작업");
  if (insertedTodo) {
    const { error: deleteError } = await supabase
      .from("todos")
      .delete()
      .eq("id", insertedTodo.id);

    if (deleteError) {
      console.error("삭제 오류:", deleteError.message);
    } else {
      console.log("✅ TODO 삭제 완료");
    }
  }
}

crudOperations().catch(console.error);
