import { supabase } from "../../lib/supabase";
import * as fs from "fs";
import * as path from "path";

async function uploadFile() {
  console.log("=== 파일 업로드 ===\n");

  const bucketName = "avatars";
  // 테스트용 이미지 파일이 필요합니다.
  const filePath = path.join(__dirname, "test-image.png");

  if (!fs.existsSync(filePath)) {
    console.error("테스트용 이미지 파일이 없습니다:", filePath);
    console.log("임시 파일을 생성합니다...");
    fs.writeFileSync(filePath, "dummy image content");
  }

  // 파일 읽기
  const file = fs.readFileSync(filePath);
  const fileName = `public/user-${Date.now()}.png`;

  // 업로드
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    console.error("업로드 오류:", error.message);
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
