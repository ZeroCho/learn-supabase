import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../lib/supabase";

async function testConnection() {
  try {
    // 클라이언트 정보 출력
    console.log("=== Supabase 연결 테스트 ===\n");
    console.log("URL:", supabase.supabaseUrl);
    console.log(
      "Key 사용 중:",
      supabase.supabaseKey.substring(0, 20) + "...\n"
    );

    // 서버 정보 가져오기
    const { data, error } = await supabase
      .from("_realtime")
      .select("*")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      console.error("연결 오류:", error.message);
      return;
    }

    console.log("✅ Supabase에 성공적으로 연결되었습니다!");

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
