import { supabase } from "../lib/supabase";
import { Tables } from "../types/database";

async function joinQueries() {
  console.log("=== JOIN 쿼리 예제 ===\n");

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

  // 1. profiles를 통한 JOIN 예제
  console.log("\n1. profiles 테이블을 통한 JOIN 예제");
  const { data: todosWithProfiles, error: joinError } = await supabase
    .from("todos")
    .select(
      `
      *,
      owner: profiles (
        fullName: full_name,
        avatarUrl: avatar_url,
        createdAt: created_at
      )
    `
    )
    .eq("user_id", signInData.user?.id || "")
    .order("created_at", { ascending: false })
    .limit(10);

  if (joinError) {
    console.error("JOIN 오류:", joinError.message);
    console.log("💡 profiles 테이블이 없거나 RLS 정책을 확인하세요.");
  } else {
    console.log("✅ TODO 목록 (프로필 정보 포함):");
    todosWithProfiles?.forEach((todo: any) => {
      console.log(`
      - 제목: ${todo.title}
      - 작성자: ${todo.owner?.fullName || "Unknown"}
      - 완료 여부: ${todo.completed ? "✅" : "⏳"}
      - 생성일: ${new Date(todo.created_at).toLocaleString()}
    `);
    });
  }

  // 2. auth.users 직접 JOIN 시도 (실패 예제)
  console.log("\n2. auth.users 직접 JOIN 시도 (실패 예제)");
  console.log("⚠️ 아래 코드는 작동하지 않습니다. 참고용입니다.\n");

  const { data: failedData, error: failedError } = await supabase
    .from("todos")
    .select(
      `
      *,
      auth.users (
        id,
        email
      )
    `
    )
    .limit(5);

  if (failedError) {
    console.log("예상된 오류:", failedError.message);
    console.log(
      "💡 auth.users는 직접 JOIN할 수 없습니다. profiles 테이블을 사용하세요."
    );
  } else {
    console.log("데이터:", failedData);
  }

  // 3. Tags와 다대다 관계 예제
  console.log("\n3. Tags와 다대다 관계 예제");
  console.log(`
  다대다 관계란?
  - 하나의 TODO는 여러 개의 태그를 가질 수 있고
  - 하나의 태그는 여러 개의 TODO에 사용될 수 있습니다
  - 이를 위해 중간 테이블(todo_tags)이 필요합니다
  `);

  // 3-1. 태그 생성
  console.log("\n3-1. 태그 생성");
  const tagNames = ["중요", "업무", "개인"];
  const createdTags: { tag_id: string }[] = [];

  for (const tagName of tagNames) {
    // 태그가 이미 존재하는지 확인
    const { data: existingTag } = await supabase
      .from("tags")
      .select("tag_id")
      .eq("name", tagName)
      .single();

    if (existingTag) {
      console.log(`✅ 태그 "${tagName}" 이미 존재함`);
      createdTags.push(existingTag);
    } else {
      const { data: newTag, error: tagError } = await supabase
        .from("tags")
        .insert({
          name: tagName,
          color:
            tagName === "중요"
              ? "#ff0000"
              : tagName === "업무"
              ? "#0000ff"
              : "#00ff00",
        })
        .select()
        .single();

      if (tagError) {
        console.error(`태그 "${tagName}" 생성 오류:`, tagError.message);
      } else {
        console.log(`✅ 태그 생성:`, newTag);
        createdTags.push(newTag);
      }
    }
  }

  // 3-2. 기존 TODO 조회 (태그 연결을 위해)
  console.log("\n3-2. 기존 TODO 조회");
  const { data: existingTodos, error: todosError } = await supabase
    .from("todos")
    .select("*")
    .limit(1);

  if (todosError || !existingTodos || existingTodos.length === 0) {
    console.log("💡 태그 연결을 위한 TODO가 없습니다. 먼저 TODO를 생성하세요.");
  } else {
    const targetTodo = existingTodos[0];
    const todoId = targetTodo.todo_id;

    // 3-3. TODO에 태그 연결 (다대다 관계)
    console.log("\n3-3. TODO에 태그 연결");
    if (createdTags.length > 0) {
      // 기존 태그 연결 확인
      const { data: existingTodoTags } = await supabase
        .from("todo_tags")
        .select("tag_id")
        .eq("todo_id", todoId);

      const existingTagIds =
        existingTodoTags?.map((et: any) => et.tag_id) || [];

      // 새로운 태그 연결 생성
      const newTodoTags = createdTags
        .filter((tag) => !existingTagIds.includes(tag.tag_id))
        .map((tag) => ({
          todo_id: todoId,
          tag_id: tag.tag_id,
        }));

      if (newTodoTags.length > 0) {
        const { data: linkedTags, error: linkError } = await supabase
          .from("todo_tags")
          .insert(newTodoTags)
          .select();

        if (linkError) {
          console.error("태그 연결 오류:", linkError.message);
        } else {
          console.log("✅ TODO에 태그 연결 완료:", linkedTags);
        }
      } else {
        console.log("✅ 모든 태그가 이미 연결되어 있습니다.");
      }
    }

    // 3-4. TODO와 태그를 함께 조회 (다대다 관계 조회)
    console.log("\n3-4. TODO와 태그를 함께 조회");

    const { data: todoWithTags, error: tagsError } = await supabase
      .from("todos")
      .select(
        `
        *,
        tags (
          tag_id,
          name,
          color
        )
      `
      )
      .eq("todo_id", todoId)
      .single();

    if (tagsError) {
      console.error("태그 조회 오류:", tagsError.message);
      console.log("💡 todo_tags 테이블과 관계가 설정되지 않았을 수 있습니다.");
    } else {
      console.log("✅ TODO와 연결된 태그:");
      console.log(todoWithTags);
    }
  }

  // 3-5. 특정 태그를 가진 모든 TODO 조회
  console.log("\n3-5. 특정 태그를 가진 모든 TODO 조회");
  if (createdTags.length > 0) {
    const targetTag = createdTags[0];
    const { data: todosWithTag, error: tagQueryError } = await supabase
      .from("tags")
      .select(
        `
        *,
        todo_tags (
          todos (
            todo_id,
            title,
            completed,
            created_at
          )
        )
      `
      )
      .eq("tag_id", targetTag.tag_id);

    if (tagQueryError) {
      console.error("태그별 TODO 조회 오류:", tagQueryError.message);
      console.log("💡 todo_tags 테이블과 관계가 설정되지 않았을 수 있습니다.");
    } else {
      console.log(`✅ "${targetTag.tag_id}" 태그를 가진 TODO 목록:`);
      console.log(todosWithTag[0].todo_tags[0].todos);
    }
  }
}

joinQueries().catch(console.error);
