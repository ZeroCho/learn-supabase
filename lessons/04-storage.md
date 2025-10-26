# 섹션 4: Storage - 파일 관리

## 목표
파일 업로드/다운로드 및 이미지 최적화 방법을 학습합니다.

## 학습 내용

### 1. Storage 버킷 생성 및 정책 설정

**버킷이란?**
- 파일을 저장하는 컨테이너
- 공개/비공개 설정 가능
- 정책으로 접근 제어

**정책 예시:**
- 공개 읽기, 인증된 사용자만 쓰기
- 특정 사용자만 접근

### 2. 파일 업로드/다운로드

**지원 기능:**
- 단일/다중 파일 업로드
- 진행률 추적
- 미리보기 URL 생성

### 3. 공개/비공개 파일 관리

**공개 파일:**
- 누구나 접근 가능
- URL로 직접 접근

**비공개 파일:**
- 인증 필요
- Signed URL 사용

### 4. 이미지 리사이징 및 최적화

**Supabase Image Transformation:**
- 자동 리사이징
- 포맷 변환
- 압축

### 5. 대용량 파일 처리

**전략:**
- 청크 업로드
- 진행률 추적
- 재시도 메커니즘

## 실습

### 실습 1: 버킷 생성

Supabase 대시보드에서:
1. Storage → New bucket
2. Name: `avatars` (공개)
3. Name: `private-docs` (비공개)

### 실습 2: 파일 업로드

`src/examples/storage/01-upload.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function uploadFile() {
  console.log('=== 파일 업로드 ===\n');

  const bucketName = 'avatars';
  const filePath = './test-image.jpg';
  
  // 파일 읽기
  const file = fs.readFileSync(filePath);
  const fileName = `user-${Date.now()}.jpg`;

  // 업로드
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (error) {
    console.error('업로드 오류:', error.message);
    return;
  }

  console.log('✅ 파일 업로드 성공');
  console.log('Path:', data.path);

  // 공개 URL 가져오기
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  console.log('공개 URL:', urlData.publicUrl);
}

uploadFile().catch(console.error);
```

### 실습 3: 파일 다운로드

`src/examples/storage/02-download.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../../lib/supabase';
import * as fs from 'fs';

async function downloadFile() {
  console.log('=== 파일 다운로드 ===\n');

  const bucketName = 'avatars';
  const filePath = 'user-1234567890.jpg';

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);

  if (error) {
    console.error('다운로드 오류:', error.message);
    return;
  }

  console.log('✅ 파일 다운로드 성공');

  // 파일로 저장
  const buffer = await data.arrayBuffer();
  fs.writeFileSync('./downloaded-image.jpg', Buffer.from(buffer));
  console.log('파일 저장 완료');
}

downloadFile().catch(console.error);
```

### 실습 4: 이미지 변환

`src/examples/storage/03-image-transform.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../../lib/supabase';

async function imageTransform() {
  console.log('=== 이미지 변환 ===\n');

  const bucketName = 'avatars';
  const filePath = 'user-1234567890.jpg';

  // 원본 URL
  const { data: originalUrl } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  console.log('원본:', originalUrl.publicUrl);

  // 리사이즈된 URL (300x300)
  const { data: resizedUrl } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath, {
      transform: {
        width: 300,
        height: 300,
        resize: 'cover'
      }
    });

  console.log('리사이즈:', resizedUrl.publicUrl);

  // WebP 변환
  const { data: webpUrl } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath, {
      transform: {
        format: 'webp',
        quality: 80
      }
    });

  console.log('WebP:', webpUrl.publicUrl);
}

imageTransform().catch(console.error);
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
