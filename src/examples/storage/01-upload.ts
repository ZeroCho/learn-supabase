import dotenv from "dotenv";
dotenv.config();
import { supabase } from "../../lib/supabase";
import * as fs from "fs";

async function uploadFile() {
  console.log("=== 파일 업로드 ===\n");

  const bucketName = "avatars";
  
  // 테스트를 위한 더미 파일 데이터 생성
  const fileName = `user-${Date.now()}.txt`;
  const fileContent = "This is a test file for Supabase Storage";

  // 업로드
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileContent, {
      contentType: "text/plain",
      upsert: false,
    });

  if (error) {
    console.error("업로드 오류:", error.message);
    console.log("💡 버킷이 생성되지 않았거나 권한이 없을 수 있습니다.");
    return;
  }

  console.log("✅ 파일 업로드 성공");
  console.log("Path:", data.path);

  // 공개 URL 가져오기
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  console.log("공개 URL:", urlData.publicUrl);
}

uploadFile().catch(console.error);
