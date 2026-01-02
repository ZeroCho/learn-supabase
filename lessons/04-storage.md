# 섹션 4: Storage - 파일 관리

## 목표

파일 업로드/다운로드 및 이미지 최적화 방법을 학습합니다.

## 학습 내용

### 1. Storage 버킷 생성 및 정책 설정

Supabase Storage는 AWS S3를 기반으로 하며, 파일을 담는 최상위 컨테이너인 '버킷(Bucket)' 단위로 관리됩니다.

- **Public Bucket**: 파일의 URL을 알면 누구나 접근할 수 있습니다. 프로필 이미지 등에 적합합니다.
- **Private Bucket**: 인증된 사용자만 접근할 수 있으며, 접근 시 서명된 URL(Signed URL)이나 인증 헤더가 필요합니다.
- **RLS 정책**: Storage도 데이터베이스처럼 RLS 정책을 통해 "누가 업로드/다운로드/삭제할 수 있는지"를 세밀하게 제어할 수 있습니다.

**Storage RLS와 데이터베이스의 관계:**

- Supabase Storage는 파일의 메타데이터를 PostgreSQL 데이터베이스의 `storage.objects` 테이블에 저장합니다.
- 실제 파일은 S3 같은 스토리지에 저장되지만, 파일에 대한 정보(파일명, 경로, 크기, 소유자 등)는 데이터베이스에 저장됩니다.
- Storage RLS는 실제로 `storage.objects` 테이블에 대한 RLS(Row Level Security) 정책입니다.
- 따라서 Storage는 데이터베이스와 밀접하게 연관되어 있으며, 일반 테이블(예: `profiles`, `todos`)과는 별개지만 같은 PostgreSQL 인스턴스를 사용합니다.
- **중요**: 기본적으로 RLS 정책이 없으면 Storage에 업로드할 수 없습니다. Public bucket이라고 해도 업로드를 허용하려면 RLS 정책이 필요합니다.
- Public bucket은 다운로드만 공개적으로 허용하고, 업로드는 RLS 정책으로 제어할 수 있습니다.

### 2. 파일 업로드/다운로드

클라이언트 라이브러리를 통해 간편하게 파일을 전송할 수 있습니다.

- **직접 업로드 (`upload()`)**: `upload()` 함수를 사용하며, 파일 객체(File, Blob)나 바이너리 데이터를 전송합니다. 이미 존재하는 파일 덮어쓰기(`upsert`) 옵션도 지원합니다. 인증된 사용자이고 RLS 정책을 통과하면 사용 가능합니다. 이미지 파일도 동일하게 업로드 가능합니다.
- **Signed URL 업로드 (`createSignedUploadUrl()`)**: 서버에서 업로드용 Signed URL을 생성한 후, 프론트엔드에서 해당 URL로 직접 PUT 요청을 보내 업로드하는 방식입니다. 서버를 거치지 않아 서버 부하를 줄이고, Private bucket에도 안전하게 업로드할 수 있습니다.
- **다운로드**: `download()` 함수로 파일 데이터를 받아오거나, `getPublicUrl()`로 브라우저에서 바로 볼 수 있는 주소를 생성할 수 있습니다.

### 3. 공개/비공개 파일 관리

- **공개 파일**: CDN을 통해 캐싱되어 빠르게 제공됩니다. URL이 영구적입니다.
- **비공개 파일**: `createSignedUrl()`을 통해 유효 기간이 있는 임시 접근 URL을 생성하여 보안을 유지합니다.
- **Signed URL 업로드**: `createSignedUploadUrl()`을 사용하면 Private bucket에도 안전하게 파일을 업로드할 수 있습니다. 생성된 Signed URL은 제한된 시간 동안만 유효하며, 프론트엔드에서 직접 Storage로 업로드할 수 있어 서버 부하를 줄일 수 있습니다.

### 4. 이미지 리사이징 및 최적화 (Image Transformation)

Supabase는 이미지 파일을 요청할 때 실시간으로 변환하는 기능을 제공합니다.

- **URL 파라미터**: URL 뒤에 `?width=300&height=300`과 같은 파라미터를 붙여 원하는 크기로 리사이징할 수 있습니다.
- **포맷 변환**: `format=webp` 등을 사용하여 용량이 작은 차세대 이미지 포맷으로 자동 변환하여 전송 속도를 높일 수 있습니다.

### 5. 대용량 파일 처리 (TUS)

수 기가바이트(GB) 단위의 대용량 파일은 한 번에 올리기 어렵습니다.

- **Resumable Upload**: TUS 프로토콜을 지원하여, 네트워크가 끊겨도 중단된 지점부터 이어 올리기가 가능합니다.
- **Chunking**: 파일을 작은 조각으로 나누어 전송하므로 안정적입니다.

## 실습

### 실습 1: 버킷 생성 및 RLS 정책 설정

Supabase 대시보드에서:

1. Storage → New bucket
2. Name: `avatars` (공개)
3. Name: `private-docs` (비공개)

**RLS 정책 설정 (SQL Editor에서 실행):**

버킷을 생성한 후, RLS 정책을 설정해야 업로드/다운로드가 가능합니다.

```sql
-- avatars 버킷: 모든 사람이 다운로드 가능, 인증된 사용자만 업로드 가능
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- private-docs 버킷: 인증된 사용자만 자신의 파일에 접근 가능
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'private-docs' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'private-docs' AND
  (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
```

**RLS 정책이 필요한 이유:**

- Supabase Storage는 기본적으로 모든 업로드를 차단합니다.
- `storage.objects` 테이블에 대한 RLS 정책을 통해 누가 어떤 작업을 할 수 있는지 제어합니다.
- Public bucket도 업로드를 허용하려면 INSERT 정책이 필요합니다.
- Private bucket은 SELECT, INSERT, UPDATE, DELETE 모두 적절한 정책이 필요합니다.

### 실습 2: 파일 업로드

`src/examples/storage/01-upload.ts`:

이 예제는 Node.js 환경에서 파일을 업로드하는 방법을 보여줍니다.

```typescript
import { supabase } from "../../lib/supabase";
import * as fs from "fs";
import * as path from "path";

async function uploadFile() {
  console.log("=== 파일 업로드 ===\n");

  const bucketName = "avatars";
  const filePath = "./test-image.jpg";

  // 파일 읽기
  const file = fs.readFileSync(filePath);
  const fileName = `user-${Date.now()}.jpg`;

  // 업로드
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      contentType: "image/jpeg",
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
```

**프론트엔드(브라우저)에서 `upload()` 사용하기:**

프론트엔드에서도 `upload()` 메서드를 직접 사용할 수 있습니다. 인증된 사용자이고 RLS 정책을 통과하면 가능합니다.

```typescript
// 브라우저 환경에서 (React, Vue, Vanilla JS 등)
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. 파일 선택 (HTML input[type="file"]에서)
const fileInput = document.querySelector(
  'input[type="file"]'
) as HTMLInputElement;
const file = fileInput.files?.[0];

if (!file) return;

// 2. upload()로 직접 업로드 (인증된 사용자만 가능)
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`user-${Date.now()}.jpg`, file, {
    contentType: file.type,
    upsert: false,
  });

if (error) {
  console.error("업로드 실패:", error);
  return;
}

console.log("업로드 성공:", data.path);

// 3. 공개 URL 가져오기
const { data: urlData } = supabase.storage
  .from("avatars")
  .getPublicUrl(data.path);

console.log("공개 URL:", urlData.publicUrl);
```

**주의사항:**

- `upload()` 메서드는 인증된 사용자만 사용할 수 있습니다 (로그인한 사용자)
- RLS(Row Level Security) 정책이 올바르게 설정되어 있어야 합니다
- Public bucket이거나, Private bucket의 경우 적절한 RLS 정책이 필요합니다

### 실습 3: 파일 다운로드

`src/examples/storage/02-download.ts`:

```typescript
import { supabase } from "../../lib/supabase";
import * as fs from "fs";

async function downloadFile() {
  console.log("=== 파일 다운로드 ===\n");

  const bucketName = "avatars";
  const filePath = "user-1234567890.jpg";

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);

  if (error) {
    console.error("다운로드 오류:", error.message);
    return;
  }

  console.log("✅ 파일 다운로드 성공");

  // 파일로 저장
  const buffer = await data.arrayBuffer();
  fs.writeFileSync("./downloaded-image.jpg", Buffer.from(buffer));
  console.log("파일 저장 완료");
}

downloadFile().catch(console.error);
```

### 실습 4: 이미지 변환

`src/examples/storage/03-image-transform.ts`:

```typescript
import { supabase } from "../../lib/supabase";

async function imageTransform() {
  console.log("=== 이미지 변환 ===\n");

  const bucketName = "avatars";
  const filePath = "user-1234567890.jpg";

  // 원본 URL
  const { data: originalUrl } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  console.log("원본:", originalUrl.publicUrl);

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
        format: "webp",
        quality: 80,
      },
    });

  console.log("WebP:", webpUrl.publicUrl);
}

imageTransform().catch(console.error);
```

### 실습 5: Signed URL을 사용한 프론트엔드 업로드

`src/examples/storage/04-signed-url-upload.ts`:

이 예제는 프론트엔드에서 Signed URL을 사용하여 파일을 업로드하는 방법을 보여줍니다.

```typescript
import { supabase } from "../../lib/supabase";
import * as fs from "fs";

async function uploadWithSignedUrl() {
  console.log("=== Signed URL을 사용한 파일 업로드 ===\n");

  const bucketName = "avatars";
  const fileName = `user-${Date.now()}.jpg`;
  const filePath = "./test-image.jpg";

  // 1. 서버에서 업로드용 Signed URL 생성
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(fileName);

  if (urlError) {
    console.error("Signed URL 생성 오류:", urlError.message);
    return;
  }

  console.log("✅ Signed URL 생성 성공");
  console.log("Signed URL:", signedUrlData.signedUrl);

  // 2. 파일 읽기
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: "image/jpeg" });

  // 3. 프론트엔드에서 Signed URL로 PUT 요청 (업로드)
  const uploadResponse = await fetch(signedUrlData.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "image/jpeg",
      Authorization: `Bearer ${signedUrlData.token}`,
    },
    body: fileBlob,
  });

  if (!uploadResponse.ok) {
    console.error("업로드 실패:", uploadResponse.status);
    return;
  }

  console.log("✅ 파일 업로드 성공");

  // 4. 업로드된 파일의 공개 URL 가져오기
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  console.log("공개 URL:", urlData.publicUrl);
}

uploadWithSignedUrl().catch(console.error);
```

**Signed URL 업로드 방식의 장점:**

- 서버를 거치지 않고 직접 Storage로 업로드하여 서버 부하 감소
- Private bucket에도 안전하게 업로드 가능
- 업로드 URL에 유효기간이 있어 보안 강화
- 프론트엔드에서 대용량 파일을 효율적으로 업로드 가능

**`upload()` vs `createSignedUploadUrl()` 비교:**

| 특징           | `upload()`                    | `createSignedUploadUrl()`                |
| -------------- | ----------------------------- | ---------------------------------------- |
| 사용 위치      | 프론트엔드/백엔드 모두 가능   | 서버에서 URL 생성, 프론트엔드에서 업로드 |
| 인증 필요      | ✅ 인증된 사용자 필요         | 서버에서 생성 시 인증 필요               |
| RLS 정책       | ✅ 필수 (Public/Private 모두) | 서버에서 생성 시만 필요                  |
| 사용 방법      | SDK로 직접 업로드             | Signed URL로 PUT 요청                    |
| Private bucket | ✅ 가능 (RLS 정책 설정 시)    | ✅ 가능                                  |
| Public bucket  | ✅ 가능 (RLS 정책 설정 시)    | ✅ 가능                                  |
| 장점           | 간단하고 직관적               | 서버 부하 감소, 더 세밀한 제어 가능      |
| 단점           | 인증 및 RLS 정책 필요         | 서버 측 코드 필요                        |

**언제 어떤 방식을 사용할까?**

- **`upload()` (프론트엔드)**: 인증된 사용자가 직접 업로드할 때, 간단한 업로드가 필요할 때
- **`upload()` (백엔드)**: 서버에서 직접 파일을 업로드할 때. Service Role Key를 사용하면 RLS 정책을 우회할 수 있어 매우 간단합니다.
- **`createSignedUploadUrl()`**: 프론트엔드에서 직접 업로드하고 싶을 때, 서버 부하를 줄이고 싶을 때

**참고: Private bucket 업로드**

`upload()`와 `createSignedUploadUrl()` 모두 Private bucket에 업로드할 수 있습니다. 둘 다 RLS 정책이 올바르게 설정되어 있으면 가능합니다. 차이점은:

- **`upload()`**: 인증된 사용자의 JWT 토큰을 사용하여 RLS 정책을 통과해야 합니다
- **`createSignedUploadUrl()`**: 서버에서 Signed URL을 생성하므로, 서버 측에서 권한을 확인한 후 URL을 발급할 수 있습니다

**예제: 백엔드에서 upload() 사용**

```typescript
// 백엔드 (Node.js, Edge Function 등)
import { createClient } from "@supabase/supabase-js";

// Service Role Key 사용 (RLS 우회 가능)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ 서버에서만 사용
);

// 직접 업로드 (RLS 정책을 우회)
const { data, error } = await supabase.storage
  .from("avatars")
  .upload("user-123.jpg", fileBuffer, {
    contentType: "image/jpeg",
  });

// 매우 간단하고 직관적!
```

## 공식 문서

- [Storage 가이드](https://supabase.com/docs/guides/storage)
- [Storage API](https://supabase.com/docs/reference/javascript/storage-api)
- [이미지 변환](https://supabase.com/docs/guides/storage/image-transformation)

## 다음 섹션 미리보기

다음 섹션에서는 Edge Functions를 다루는 방법을 학습합니다.

## 실습 과제

1. 버킷을 생성하고 파일을 업로드하세요
2. 파일을 다운로드하는 코드를 작성하세요
3. 이미지 변환 기능을 테스트하세요
4. Signed URL을 사용하여 프론트엔드에서 파일을 업로드하는 코드를 작성하세요
