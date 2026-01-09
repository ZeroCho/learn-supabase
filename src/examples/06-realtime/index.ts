import { supabase } from "../../lib/supabase";

async function realtime() {
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: "zerohch0@gmail.com",
      password: "Zer0supabase!!",
    });
  // Row Filter를 사용한 구독 (특정 조건의 행만 수신)
  // PostgREST 필터 문법 사용: 컬럼명=연산자.값
  // 주요 연산자: eq(같음), neq(다름), gt(초과), gte(이상), lt(미만), lte(이하), in(포함), is(NULL 체크)
  const filteredChannel = supabase
    .channel("filtered-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "todos",
        filter: "completed=eq.true", // completed가 true인 행의 변경사항만 수신
      },
      (payload) => {
        console.log("필터링된 변경사항:", payload);
      }
    )
    .subscribe();

  // 2. Broadcast (클라이언트 간 메시지 전송)
  // 예: 마우스 커서 위치, 타이핑 중 표시 등 DB에 저장할 필요 없는 휘발성 데이터
  const roomChannel = supabase.channel("room_1");

  roomChannel
    .on("broadcast", { event: "cursor-pos" }, (payload) => {
      console.log("다른 유저 커서:", payload.payload);
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // 메시지 전송 예시
        roomChannel.send({
          type: "broadcast",
          event: "cursor-pos",
          payload: { x: 100, y: 200 },
        });
      }
    });

  // 3. Presence (사용자 접속 상태 공유)
  // 예: "현재 접속 중인 사용자 목록"
  const presenceChannel = supabase.channel("online-users");

  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();
      console.log("현재 접속자 목록:", state);
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      console.log("입장:", newPresences);
    })
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log("퇴장:", leftPresences);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // 내 상태 전송
        await presenceChannel.track({
          user_id: "user_123",
          online_at: new Date().toISOString(),
        });
      }
    });
}

realtime().catch(console.error);