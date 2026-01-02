import { supabase } from "../lib/supabase";

async function crudOperations() {
  console.log("=== CRUD 작업 예제 ===\n");

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

  // 1. CREATE - 데이터 삽입
  console.log("1. CREATE 작업");
  const { data: insertedTodo, error: insertError } = await supabase
    .from("todos")
    .insert({
      title: "Supabase 학습하기",
      description: "TypeScript로 Supabase 다루기",
      completed: false,
      user_id: session?.user.id || "",
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
      .eq("todo_id", insertedTodo.todo_id)
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
      .eq("todo_id", insertedTodo.todo_id);

    if (deleteError) {
      console.error("삭제 오류:", deleteError.message);
    } else {
      console.log("✅ TODO 삭제 완료");
    }
  }
}

crudOperations().catch(console.error);
