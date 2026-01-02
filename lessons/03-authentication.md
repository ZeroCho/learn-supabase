# 섹션 3: Authentication - 인증 시스템

## 목표

다양한 인증 방식을 구현하고 JWT 토큰 관리를 학습합니다.

## 학습 내용

### 1. Email/Password 인증

가장 전통적이고 기본적인 인증 방식입니다. 사용자의 이메일과 비밀번호를 받아 Supabase Auth 서버에서 검증합니다.

- **보안**: 비밀번호는 데이터베이스에 평문으로 저장되지 않고, 안전한 해시 알고리즘(bcrypt 등)을 통해 암호화되어 저장됩니다.
- **이메일 확인**: 가입 시 이메일 소유 여부를 확인하는 메일을 자동 발송하여 보안을 강화할 수 있습니다.

### 2. OAuth 공급자 연동

Google, GitHub, Kakao 등 외부 서비스의 계정을 사용하여 로그인하는 방식입니다.

- **편의성**: 사용자가 별도의 회원가입 절차 없이 기존 계정으로 즉시 로그인할 수 있어 진입 장벽을 낮춥니다.
- **설정**: 각 공급자(Provider)의 개발자 콘솔에서 Client ID와 Secret을 발급받아 Supabase 대시보드에 등록해야 합니다.

### 3. Magic Link 인증 (Passwordless)

비밀번호 없이 이메일로 전송된 일회용 링크(OTP)를 클릭하여 로그인하는 방식입니다.

- **보안성**: 비밀번호 탈취 위험이 원천적으로 차단됩니다.
- **UX**: 사용자가 복잡한 비밀번호를 기억할 필요가 없어 편리합니다.

### 4. JWT (JSON Web Token) 토큰 관리

Supabase는 로그인 성공 시 클라이언트에게 JWT를 발급하여 세션을 관리합니다.

- **Access Token**: 짧은 유효 기간을 가지며, API 요청 시 Authorization 헤더에 담겨 전송됩니다. RLS 정책 확인에 사용됩니다.
- **Refresh Token**: 긴 유효 기간을 가지며, Access Token이 만료되었을 때 새로운 토큰을 발급받는 데 사용됩니다.

### 5. 사용자 메타데이터 (User Metadata)

`auth.users` 테이블에는 기본적인 로그인 정보만 저장되지만, `raw_user_meta_data` 컬럼을 통해 추가 정보를 JSON 형태로 저장할 수 있습니다.

- **활용**: 사용자 닉네임, 프로필 이미지 URL, 환경 설정 등을 저장하는 데 유용합니다.
- **주의**: 중요한 비즈니스 로직에 필요한 데이터는 별도의 `public.profiles` 테이블을 만들어 관리하는 것이 권장됩니다.

#### 5.1. `auth.users.raw_user_meta_data` vs `profiles` 테이블 비교

사용자 정보를 저장하는 두 가지 방법의 장단점을 비교합니다:

**`auth.users.raw_user_meta_data` 사용**

장점:

- ✅ **간단한 설정**: 별도 테이블 생성 불필요
- ✅ **JWT에 자동 포함**: 토큰에 자동으로 포함되어 RLS에서 즉시 사용 가능
- ✅ **빠른 접근**: `user.user_metadata`로 즉시 접근 가능
- ✅ **자동 동기화**: 회원가입 시 자동으로 저장됨

단점:

- ❌ **제한된 크기**: JWT 크기 제한으로 과도한 데이터 저장 비권장
- ❌ **쿼리 제약**: JSONB 필드라서 인덱싱/필터링이 제한적
- ❌ **타입 안정성 부족**: 스키마 검증이 없어 런타임 오류 가능
- ❌ **JOIN 불가**: 다른 테이블과 직접 JOIN 어려움
- ❌ **인덱싱 제한**: 특정 필드만 인덱싱하기 어려움

**별도 `profiles` 테이블 사용**

장점:

- ✅ **강력한 쿼리**: SQL 인덱싱, 필터링, 정렬이 용이
- ✅ **타입 안정성**: 스키마로 데이터 무결성 보장
- ✅ **JOIN 가능**: 다른 테이블과 JOIN으로 복잡한 쿼리 가능
- ✅ **확장성**: 필드 추가/수정이 마이그레이션으로 관리 가능
- ✅ **성능**: 필요한 컬럼만 선택 가능, 인덱스 최적화 가능
- ✅ **RLS 세밀 제어**: 테이블별로 정책을 세밀하게 적용 가능

단점:

- ❌ **추가 설정 필요**: 테이블 생성, RLS 정책, 트리거 등 필요
- ❌ **동기화 필요**: 회원가입 시 프로필 자동 생성 로직 필요
- ❌ **추가 쿼리**: 프로필 조회를 위해 별도 쿼리 필요
- ❌ **JWT 미포함**: RLS에서 사용하려면 별도 조회 필요

**권장 사용 사례**

`user_metadata` 사용 권장:

- 간단한 사용자 정보 (이름, 아바타 URL 등)
- JWT에서 즉시 필요한 정보
- 자주 변경되지 않는 소량 데이터
- 프로토타이핑 단계

`profiles` 테이블 사용 권장:

- 복잡한 프로필 데이터
- 검색/필터링이 필요한 필드 (예: username)
- 다른 테이블과 JOIN이 필요한 경우
- 대용량 데이터
- 프로덕션 환경

**하이브리드 접근법**

두 방식을 함께 사용할 수 있습니다:

```typescript
// 회원가입 시
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      // JWT에 포함되어 즉시 사용 가능한 간단한 정보
      full_name: "Test User",
      avatar_url: "https://..."
    }
  }
});

// 별도 profiles 테이블에는 상세 정보 저장
await supabase.from('profiles').insert({
  user_id: user.id,
  username: "testuser",  // 검색 가능해야 함
  bio: "Long bio text...",  // 긴 텍스트
  preferences: {...}  // 복잡한 구조
});
```

**저장 위치 확인**

`options.data`로 전달한 메타데이터는 `auth.users` 테이블의 `raw_user_meta_data` 컬럼(JSONB 타입)에 저장됩니다:

```sql
-- 데이터베이스에서 직접 확인
SELECT id, email, raw_user_meta_data
FROM auth.users;
```

클라이언트에서는 `user.user_metadata`로 접근할 수 있습니다.

### 6. 세션 관리 (Session Management)

로그인 상태를 유지하고 관리하는 기능입니다.

- **자동 갱신**: Supabase 클라이언트 라이브러리는 백그라운드에서 자동으로 토큰을 갱신(Refresh)하여 로그인이 끊기지 않도록 돕습니다.
- **이벤트 감지**: `onAuthStateChange` 리스너를 통해 로그인, 로그아웃, 토큰 갱신 등의 이벤트를 실시간으로 감지하고 UI를 업데이트할 수 있습니다.

## 실습

### 실습 1: Email/Password 회원가입 및 로그인

`src/examples/auth/01-email-password.ts`:

```typescript
import { supabase } from "../../lib/supabase";

async function emailPasswordAuth() {
  console.log("=== Email/Password 인증 ===\n");

  const email = "test@example.com";
  const password = "securePassword123!";

  // 1. 회원가입
  console.log("1. 회원가입");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Test User",
        username: "testuser",
      },
    },
  });

  if (signUpError) {
    console.error("회원가입 오류:", signUpError.message);
  } else {
    console.log("✅ 회원가입 성공:", signUpData.user?.email);
    console.log("이메일 확인이 필요할 수 있습니다.");
  }

  // 2. 로그인
  console.log("\n2. 로그인");
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    console.error("로그인 오류:", signInError.message);
  } else {
    console.log("✅ 로그인 성공");
    console.log("사용자 ID:", signInData.user?.id);
    console.log("세션:", signInData.session ? "활성화됨" : "없음");
  }

  // 3. 현재 세션 확인
  console.log("\n3. 세션 확인");
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("세션 오류:", sessionError.message);
  } else {
    console.log("✅ 현재 세션:", session ? "활성화됨" : "없음");
    if (session) {
      console.log("사용자:", session.user.email);
      console.log(
        "만료 시간:",
        new Date(session.expires_at! * 1000).toLocaleString()
      );
    }
  }

  // 4. 로그아웃
  console.log("\n4. 로그아웃");
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error("로그아웃 오류:", signOutError.message);
  } else {
    console.log("✅ 로그아웃 완료");
  }
}

emailPasswordAuth().catch(console.error);
```

### 실습 2: OAuth 소셜 로그인

`src/examples/auth/02-oauth.ts`:

```typescript
import { supabase } from "../../lib/supabase";

async function oauthLogin() {
  console.log("=== OAuth 소셜 로그인 ===\n");

  // OAuth 로그인 URL 생성
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("OAuth 오류:", error.message);
    return;
  }

  console.log("✅ OAuth URL 생성 완료");
  console.log("URL:", data.url);
  console.log("\n💡 이 URL을 브라우저에서 열어 로그인하세요.");
}

// 콜백 처리 예제
async function handleOAuthCallback(url: string) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("세션 오류:", error.message);
    return;
  }

  if (data.session) {
    console.log("✅ 로그인 성공");
    console.log("사용자:", data.session.user.email);
    console.log("공급자:", data.session.user.app_metadata.provider);
  }
}

oauthLogin().catch(console.error);
```

### 실습 3: Magic Link 인증

`src/examples/auth/03-magic-link.ts`:

```typescript
import { supabase } from "../../lib/supabase";

async function magicLinkAuth() {
  console.log("=== Magic Link 인증 ===\n");

  const email = "test@example.com";

  // Magic Link 전송
  console.log("1. Magic Link 전송");
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "http://localhost:3000/auth/callback",
    },
  });

  if (error) {
    console.error("Magic Link 오류:", error.message);
    return;
  }

  console.log("✅ Magic Link 전송 완료");
  console.log("이메일을 확인하고 링크를 클릭하세요.");
  console.log("반환 데이터:", data);
}

magicLinkAuth().catch(console.error);
```

### 실습 4: 비밀번호 재설정

`src/examples/auth/04-reset-password.ts`:

```typescript
import { supabase } from "../../lib/supabase";

async function resetPassword() {
  console.log("=== 비밀번호 재설정 ===\n");

  const email = "test@example.com";

  // 비밀번호 재설정 이메일 전송
  console.log("1. 비밀번호 재설정 이메일 전송");
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/reset-password",
  });

  if (error) {
    console.error("재설정 오류:", error.message);
    return;
  }

  console.log("✅ 재설정 이메일 전송 완료");
  console.log("이메일을 확인하고 링크를 클릭하세요.");
}

// 비밀번호 업데이트
async function updatePassword(newPassword: string) {
  console.log("\n2. 새 비밀번호 설정");
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("업데이트 오류:", error.message);
    return;
  }

  console.log("✅ 비밀번호 변경 완료");
}

resetPassword().catch(console.error);
```

### 실습 5: 사용자 프로필 관리

`src/examples/auth/05-user-profile.ts`:

```typescript
import { supabase } from "../../lib/supabase";

async function userProfile() {
  console.log("=== 사용자 프로필 관리 ===\n");

  // 로그인 (예시)
  await supabase.auth.signInWithPassword({
    email: "test@example.com",
    password: "securePassword123!",
  });

  // 1. 현재 사용자 정보 가져오기
  console.log("1. 사용자 정보 조회");
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("사용자 오류:", userError.message);
    return;
  }

  console.log("✅ 사용자 정보:");
  console.log("ID:", user.id);
  console.log("이메일:", user.email);
  console.log("생성일:", user.created_at);
  console.log("메타데이터:", user.user_metadata);

  // 2. 사용자 메타데이터 업데이트
  console.log("\n2. 메타데이터 업데이트");
  const { data: updateData, error: updateError } =
    await supabase.auth.updateUser({
      data: {
        full_name: "Updated Name",
        avatar_url: "https://example.com/avatar.jpg",
        preferences: {
          theme: "dark",
          language: "ko",
        },
      },
    });

  if (updateError) {
    console.error("업데이트 오류:", updateError.message);
  } else {
    console.log("✅ 메타데이터 업데이트 완료");
    console.log("새 메타데이터:", updateData.user.user_metadata);
  }

  // 3. 이메일 변경
  console.log("\n3. 이메일 변경");
  const { error: emailError } = await supabase.auth.updateUser({
    email: "newemail@example.com",
  });

  if (emailError) {
    console.error("이메일 오류:", emailError.message);
  } else {
    console.log("✅ 이메일 변경 요청 완료");
    console.log("이메일 인증이 필요합니다.");
  }
}

userProfile().catch(console.error);
```

### 실습 6: 세션 관리

`src/examples/auth/06-session-management.ts`:

```typescript
import { supabase } from "../../lib/supabase";

async function sessionManagement() {
  console.log("=== 세션 관리 ===\n");

  // 로그인
  await supabase.auth.signInWithPassword({
    email: "test@example.com",
    password: "securePassword123!",
  });

  // 1. 현재 세션 가져오기
  console.log("1. 현재 세션");
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("세션 오류:", sessionError.message);
    return;
  }

  if (session) {
    console.log("✅ 세션 정보:");
    console.log("Access Token:", session.access_token.substring(0, 20) + "...");
    console.log(
      "만료 시간:",
      new Date(session.expires_at! * 1000).toLocaleString()
    );
  }

  // 2. 토큰 새로고침
  console.log("\n2. 토큰 새로고침");
  const { data: refreshData, error: refreshError } =
    await supabase.auth.refreshSession();

  if (refreshError) {
    console.error("새로고침 오류:", refreshError.message);
  } else {
    console.log("✅ 토큰 새로고침 완료");
    console.log(
      "새 만료 시간:",
      new Date(refreshData.session!.expires_at! * 1000).toLocaleString()
    );
  }

  // 3. 모든 세션 조회
  console.log("\n3. 모든 세션 조회");
  const { data: sessionsData, error: sessionsError } =
    await supabase.auth.getUser();

  if (sessionsError) {
    console.error("세션 조회 오류:", sessionsError.message);
  } else {
    console.log("✅ 사용자 세션 정보 조회 완료");
    console.log("마지막 로그인:", sessionsData.user?.last_sign_in_at);
  }

  // 4. 로그아웃
  console.log("\n4. 로그아웃");
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error("로그아웃 오류:", signOutError.message);
  } else {
    console.log("✅ 로그아웃 완료");
  }
}

sessionManagement().catch(console.error);
```

## 공식 문서

- [인증 가이드](https://supabase.com/docs/guides/auth)
- [JavaScript Auth](https://supabase.com/docs/reference/javascript/auth-api)
- [OAuth 공급자](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Magic Link](https://supabase.com/docs/guides/auth/auth-magic-link)
- [비밀번호 재설정](https://supabase.com/docs/guides/auth/auth-reset-password-email)

## 다음 섹션 미리보기

다음 섹션에서는 Supabase Storage를 다루는 방법을 학습합니다:

- Storage 버킷 생성
- 파일 업로드/다운로드
- 이미지 최적화
- 권한 관리

## 실습 과제

1. Email/Password로 회원가입 및 로그인을 구현하세요
2. Google OAuth 로그인을 구현하세요
3. Magic Link 인증을 테스트하세요
4. 사용자 프로필을 업데이트하는 기능을 구현하세요
5. 세션 관리 기능을 구현하세요
