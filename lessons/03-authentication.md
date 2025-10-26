# 섹션 3: Authentication - 인증 시스템

## 목표
다양한 인증 방식을 구현하고 JWT 토큰 관리를 학습합니다.

## 학습 내용

### 1. Email/Password 인증

가장 기본적인 인증 방식으로, 이메일과 비밀번호를 사용합니다.

**특징:**
- 이메일 중복 확인
- 비밀번호 해싱 (자동)
- 세션 관리

### 2. OAuth 공급자 연동

소셜 로그인을 통해 사용자 인증을 처리합니다.

**지원 공급자:**
- Google
- GitHub
- Apple
- Discord
- Facebook
- Twitter
- 등등...

### 3. Magic Link 인증

비밀번호 없이 이메일 링크로 로그인하는 방식입니다.

**장점:**
- 비밀번호 관리 불필요
- 높은 보안성
- UX 개선

### 4. JWT 토큰 관리

Supabase는 JWT를 사용하여 세션을 관리합니다.

**토큰 구성:**
- Access Token: API 요청 인증
- Refresh Token: Access Token 갱신
- Expiry: 토큰 만료 시간

### 5. 사용자 메타데이터 활용

사용자 정보를 추가로 저장하고 관리합니다.

**메타데이터 예시:**
- 이름, 아바타, 설정 등

### 6. 세션 관리

세션 생성, 조회, 갱신, 삭제를 관리합니다.

## 실습

### 실습 1: Email/Password 회원가입 및 로그인

`src/examples/auth/01-email-password.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../../lib/supabase';

async function emailPasswordAuth() {
  console.log('=== Email/Password 인증 ===\n');

  const email = 'test@example.com';
  const password = 'securePassword123!';

  // 1. 회원가입
  console.log('1. 회원가입');
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Test User',
        username: 'testuser'
      }
    }
  });

  if (signUpError) {
    console.error('회원가입 오류:', signUpError.message);
  } else {
    console.log('✅ 회원가입 성공:', signUpData.user?.email);
    console.log('이메일 확인이 필요할 수 있습니다.');
  }

  // 2. 로그인
  console.log('\n2. 로그인');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error('로그인 오류:', signInError.message);
  } else {
    console.log('✅ 로그인 성공');
    console.log('사용자 ID:', signInData.user?.id);
    console.log('세션:', signInData.session ? '활성화됨' : '없음');
  }

  // 3. 현재 세션 확인
  console.log('\n3. 세션 확인');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('세션 오류:', sessionError.message);
  } else {
    console.log('✅ 현재 세션:', session ? '활성화됨' : '없음');
    if (session) {
      console.log('사용자:', session.user.email);
      console.log('만료 시간:', new Date(session.expires_at! * 1000).toLocaleString());
    }
  }

  // 4. 로그아웃
  console.log('\n4. 로그아웃');
  const { error: signOutError } = await supabase.auth.signOut();
  
  if (signOutError) {
    console.error('로그아웃 오류:', signOutError.message);
  } else {
    console.log('✅ 로그아웃 완료');
  }
}

emailPasswordAuth().catch(console.error);
```

### 실습 2: OAuth 소셜 로그인

`src/examples/auth/02-oauth.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../../lib/supabase';

async function oauthLogin() {
  console.log('=== OAuth 소셜 로그인 ===\n');

  // OAuth 로그인 URL 생성
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  });

  if (error) {
    console.error('OAuth 오류:', error.message);
    return;
  }

  console.log('✅ OAuth URL 생성 완료');
  console.log('URL:', data.url);
  console.log('\n💡 이 URL을 브라우저에서 열어 로그인하세요.');
}

// 콜백 처리 예제
async function handleOAuthCallback(url: string) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('세션 오류:', error.message);
    return;
  }

  if (data.session) {
    console.log('✅ 로그인 성공');
    console.log('사용자:', data.session.user.email);
    console.log('공급자:', data.session.user.app_metadata.provider);
  }
}

oauthLogin().catch(console.error);
```

### 실습 3: Magic Link 인증

`src/examples/auth/03-magic-link.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../../lib/supabase';

async function magicLinkAuth() {
  console.log('=== Magic Link 인증 ===\n');

  const email = 'test@example.com';

  // Magic Link 전송
  console.log('1. Magic Link 전송');
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'http://localhost:3000/auth/callback'
    }
  });

  if (error) {
    console.error('Magic Link 오류:', error.message);
    return;
  }

  console.log('✅ Magic Link 전송 완료');
  console.log('이메일을 확인하고 링크를 클릭하세요.');
  console.log('반환 데이터:', data);
}

magicLinkAuth().catch(console.error);
```

### 실습 4: 비밀번호 재설정

`src/examples/auth/04-reset-password.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../../lib/supabase';

async function resetPassword() {
  console.log('=== 비밀번호 재설정 ===\n');

  const email = 'test@example.com';

  // 비밀번호 재설정 이메일 전송
  console.log('1. 비밀번호 재설정 이메일 전송');
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/reset-password'
  });

  if (error) {
    console.error('재설정 오류:', error.message);
    return;
  }

  console.log('✅ 재설정 이메일 전송 완료');
  console.log('이메일을 확인하고 링크를 클릭하세요.');
}

// 비밀번호 업데이트
async function updatePassword(newPassword: string) {
  console.log('\n2. 새 비밀번호 설정');
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    console.error('업데이트 오류:', error.message);
    return;
  }

  console.log('✅ 비밀번호 변경 완료');
}

resetPassword().catch(console.error);
```

### 실습 5: 사용자 프로필 관리

`src/examples/auth/05-user-profile.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../../lib/supabase';

async function userProfile() {
  console.log('=== 사용자 프로필 관리 ===\n');

  // 로그인 (예시)
  await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'securePassword123!'
  });

  // 1. 현재 사용자 정보 가져오기
  console.log('1. 사용자 정보 조회');
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('사용자 오류:', userError.message);
    return;
  }

  console.log('✅ 사용자 정보:');
  console.log('ID:', user.id);
  console.log('이메일:', user.email);
  console.log('생성일:', user.created_at);
  console.log('메타데이터:', user.user_metadata);

  // 2. 사용자 메타데이터 업데이트
  console.log('\n2. 메타데이터 업데이트');
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    data: {
      full_name: 'Updated Name',
      avatar_url: 'https://example.com/avatar.jpg',
      preferences: {
        theme: 'dark',
        language: 'ko'
      }
    }
  });

  if (updateError) {
    console.error('업데이트 오류:', updateError.message);
  } else {
    console.log('✅ 메타데이터 업데이트 완료');
    console.log('새 메타데이터:', updateData.user.user_metadata);
  }

  // 3. 이메일 변경
  console.log('\n3. 이메일 변경');
  const { error: emailError } = await supabase.auth.updateUser({
    email: 'newemail@example.com'
  });

  if (emailError) {
    console.error('이메일 오류:', emailError.message);
  } else {
    console.log('✅ 이메일 변경 요청 완료');
    console.log('이메일 인증이 필요합니다.');
  }
}

userProfile().catch(console.error);
```

### 실습 6: 세션 관리

`src/examples/auth/06-session-management.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../../lib/supabase';

async function sessionManagement() {
  console.log('=== 세션 관리 ===\n');

  // 로그인
  await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'securePassword123!'
  });

  // 1. 현재 세션 가져오기
  console.log('1. 현재 세션');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('세션 오류:', sessionError.message);
    return;
  }

  if (session) {
    console.log('✅ 세션 정보:');
    console.log('Access Token:', session.access_token.substring(0, 20) + '...');
    console.log('만료 시간:', new Date(session.expires_at! * 1000).toLocaleString());
  }

  // 2. 토큰 새로고침
  console.log('\n2. 토큰 새로고침');
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError) {
    console.error('새로고침 오류:', refreshError.message);
  } else {
    console.log('✅ 토큰 새로고침 완료');
    console.log('새 만료 시간:', new Date(refreshData.session!.expires_at! * 1000).toLocaleString());
  }

  // 3. 모든 세션 조회
  console.log('\n3. 모든 세션 조회');
  const { data: sessionsData, error: sessionsError } = await supabase.auth.getUser();

  if (sessionsError) {
    console.error('세션 조회 오류:', sessionsError.message);
  } else {
    console.log('✅ 사용자 세션 정보 조회 완료');
    console.log('마지막 로그인:', sessionsData.user?.last_sign_in_at);
  }

  // 4. 로그아웃
  console.log('\n4. 로그아웃');
  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.error('로그아웃 오류:', signOutError.message);
  } else {
    console.log('✅ 로그아웃 완료');
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
