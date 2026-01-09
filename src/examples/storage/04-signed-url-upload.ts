import { supabase } from "../../lib/supabase";
import * as fs from "fs";
import * as path from "path";
/**
 * Signed URL을 사용한 파일 업로드 예제
 *
 * 이 방식은 프론트엔드에서 직접 업로드할 때 유용합니다:
 * 1. 서버/백엔드에서 createSignedUploadUrl()로 업로드용 URL 생성
 * 2. 프론트엔드에서 해당 URL로 PUT 요청을 보내 파일 업로드
 *
 * 장점:
 * - 서버를 거치지 않고 직접 업로드하여 서버 부하 감소
 * - Private bucket에도 안전하게 업로드 가능
 * - 업로드 URL에 유효기간이 있어 보안 강화
 */
async function uploadWithSignedUrl() {
  console.log("=== Signed URL을 사용한 파일 업로드 ===\n");

  const bucketName = "avatars";
  const fileName = `public/user-${Date.now()}.jpg`;

  // 테스트용 이미지 파일
  const filePath = path.join(__dirname, "test-image.png");
  if (!fs.existsSync(filePath)) {
    console.error("테스트용 이미지 파일이 없습니다:", filePath);
    console.log("임시 파일을 생성합니다...");
    fs.writeFileSync(filePath, "dummy image content");
  }

  // 1. 서버에서 업로드용 Signed URL 생성
  console.log("1. 업로드용 Signed URL 생성 중...");
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(fileName);

  if (urlError) {
    console.error("Signed URL 생성 오류:", urlError.message);
    return;
  }

  console.log("✅ Signed URL 생성 성공");
  console.log("파일명:", fileName);
  console.log("Signed URL:", signedUrlData.signedUrl);
  console.log("토큰:", signedUrlData.token);

  // 2. 파일 읽기
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: "image/jpeg" });

  // 3. 프론트엔드에서 Signed URL로 PUT 요청 (업로드)
  console.log("\n2. Signed URL로 파일 업로드 중...");
  const uploadResponse = await fetch(signedUrlData.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/png",
      Authorization: `Bearer ${signedUrlData.token}`,
    },
    body: fileBlob,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error("업로드 실패:", uploadResponse.status, errorText);
    return;
  }

  console.log("✅ 파일 업로드 성공");
  console.log("Status:", uploadResponse.status);

  // 4. 업로드된 파일의 공개 URL 가져오기
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log("\n3. 업로드된 파일 정보:");
  console.log("공개 URL:", urlData.publicUrl);
}

/**
 * 프론트엔드에서 upload() 메서드 사용 예제
 *
 * 프론트엔드(브라우저)에서도 upload() 메서드를 직접 사용할 수 있습니다.
 * 인증된 사용자(supabase.auth.getSession()으로 세션 확인)이고 RLS 정책을 통과하면 가능합니다.
 *
 * ```typescript
 * // 브라우저 환경에서 (React, Vue, Vanilla JS 등)
 * import { createClient } from '@supabase/supabase-js';
 *
 * const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 *
 * // 1. 파일 선택 (HTML input[type="file"]에서)
 * const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
 * const file = fileInput.files?.[0];
 *
 * if (!file) return;
 *
 * // 2. upload()로 직접 업로드 (인증된 사용자만 가능)
 * const { data, error } = await supabase.storage
 *   .from('avatars')
 *   .upload(`user-${Date.now()}.jpg`, file, {
 *     contentType: file.type,
 *     upsert: false
 *   });
 *
 * if (error) {
 *   console.error('업로드 실패:', error);
 *   return;
 * }
 *
 * console.log('업로드 성공:', data.path);
 *
 * // 3. 공개 URL 가져오기
 * const { data: urlData } = supabase.storage
 *   .from('avatars')
 *   .getPublicUrl(data.path);
 *
 * console.log('공개 URL:', urlData.publicUrl);
 * ```
 */

/**
 * 프론트엔드에서 Signed URL 사용 예제
 *
 * Signed URL 방식을 사용할 수도 있습니다:
 *
 * ```typescript
 * // 1. 서버/Edge Function에서 Signed URL 생성 API 호출
 * const response = await fetch('/api/upload-url', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ fileName: 'avatar.jpg' })
 * });
 * const { signedUrl, token } = await response.json();
 *
 * // 2. 파일 선택 (HTML input[type="file"]에서)
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 *
 * // 3. Signed URL로 업로드
 * await fetch(signedUrl, {
 *   method: 'PUT',
 *   headers: {
 *     'Content-Type': file.type,
 *     'Authorization': `Bearer ${token}`
 *   },
 *   body: file
 * });
 * ```
 */

uploadWithSignedUrl().catch(console.error);
