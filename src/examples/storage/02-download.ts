import { supabase } from "../../lib/supabase";
import * as fs from "fs";

async function downloadFile() {
  console.log("=== 파일 다운로드 ===\n");

  const bucketName = "avatars";
  // 다운로드할 파일 경로 (업로드 예제에서 생성된 파일명으로 교체 필요)
  const filePath = "public/user-1767602513170.png";

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);

  if (error) {
    console.error("다운로드 오류:", error.message);
    console.log("💡 파일이 존재하는지 확인하세요.");
    return;
  }

  console.log("✅ 파일 다운로드 성공");

  // 파일로 저장
  const buffer = await data.arrayBuffer();
  fs.writeFileSync("./downloaded-image.png", Buffer.from(buffer));
  console.log("파일 저장 완료: ./downloaded-image.png");
}

downloadFile().catch(console.error);
