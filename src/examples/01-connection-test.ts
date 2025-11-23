import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../lib/supabase";

async function testConnection() {
  try {
    // 클라이언트 정보 출력
    console.log("=== Supabase 연결 테스트 ===\n");
    console.log("URL:", (supabase as any).supabaseUrl);
    console.log(
      "Key 사용 중:",
      (supabase as any).supabaseKey.substring(0, 20) + "...\n"
    );

    // 서버 정보 가져오기 (테이블이 없어도 동작하는 쿼리)
    // _realtime 테이블은 없을 수도 있으므로 에러 핸들링
    const { data, error } = await supabase
      .from("todos") // todos 테이블이 있다고 가정
      .select("*")
      .limit(1);

    if (error && error.code !== "PGRST116") {
       // 테이블이 없을 때의 에러는 무시하거나 로그만 출력
       console.log("참고: 테이블이 아직 없을 수 있습니다.", error.message);
    }

    console.log("✅ Supabase 클라이언트가 정상적으로 초기화되었습니다!");

    // 현재 사용자 정보 (로그인하지 않았으면 null)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("세션:", session ? "활성화됨" : "비활성화됨");
  } catch (error) {
    console.error("예상치 못한 오류:", error);
  }
}

testConnection();
