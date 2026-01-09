import { supabase } from "../../lib/supabase";

async function imageTransform() {
  console.log("=== 이미지 변환 ===\n");

  const bucketName = "avatars";
  // 변환할 이미지 파일 경로 (업로드 예제에서 생성된 파일명으로 교체 필요)
  const filePath = "public/user-1767602513170.png";

  // 원본 URL
  const { data: signedUrlData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 3600, {
      transform: {
        width: 300,
        height: 300,
        resize: "cover",
      },
    });

  console.log("원본:", signedUrlData?.signedUrl);

  // 리사이즈된 URL (300x300)
  const { data: resizedUrl } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath, {
      transform: {
        width: 300,
        height: 300,
        resize: "cover",
      },
    });

  console.log("리사이즈:", resizedUrl.publicUrl);

  // WebP 변환
  const { data: webpUrl } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath, {
      transform: {
        // format: "origin", // origin이면 원본 유지, 아니면 webp로 변환됨
        quality: 80,
      },
    });

  console.log("WebP:", webpUrl.publicUrl);
}

imageTransform().catch(console.error);
