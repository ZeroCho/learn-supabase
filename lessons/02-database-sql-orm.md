# 섹션 2: Database - SQL & ORM

## 목표
Supabase Database를 TypeScript로 다루고, Row Level Security와 PostgreSQL 함수를 활용하는 방법을 학습합니다.

## 학습 내용

### 1. Row Level Security (RLS) 개념

Row Level Security는 PostgreSQL의 보안 기능으로, 각 행(row)에 대한 접근을 제어합니다.

**RLS의 필요성:**
- 각 사용자는 자신의 데이터만 볼 수 있어야 함
- 관리자는 모든 데이터에 접근 가능
- 공개 데이터는 누구나 읽을 수 있음

**RLS 활성화:**
```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### 2. PostgreSQL 함수 이해

Supabase에서는 PostgreSQL 함수를 API 엔드포인트로 자동 노출합니다.

**장점:**
- 서버 로직을 데이터베이스에 배치
- 네트워크 호출 감소
- 트랜잭션 보장

### 3. TypeScript 타입 생성 자동화

Supabase CLI를 사용하여 데이터베이스 스키마에서 TypeScript 타입을 자동 생성합니다.

**Supabase CLI 설치:**
```bash
npm install -g supabase
```

**타입 생성:**
```bash
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

### 4. Supabase CLI 사용

**로그인:**
```bash
supabase login
```

**프로젝트 링크:**
```bash
supabase link --project-ref your-project-ref
```

**마이그레이션:**
```bash
supabase db push
```

### 5. Query Builder 패턴

Supabase는 Query Builder 패턴을 사용하여 타입 안전한 쿼리를 작성합니다.

**기본 구조:**
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2')
  .eq('column3', 'value')
  .limit(10);
```

## 실습

### 실습 1: 테이블 생성 및 스키마 설계

Supabase 대시보드에서 다음 SQL 실행:

```sql
-- 프로필 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 프로필을 볼 수 있음
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 정책: 사용자는 자신의 프로필을 업데이트할 수 있음
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 정책: 사용자는 자신의 프로필을 삽입할 수 있음
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- TODO 테이블
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 TODO만 볼 수 있음
CREATE POLICY "Users can view own todos"
ON todos FOR SELECT
USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 TODO를 생성할 수 있음
CREATE POLICY "Users can create own todos"
ON todos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 정책: 사용자는 자신의 TODO를 업데이트할 수 있음
CREATE POLICY "Users can update own todos"
ON todos FOR UPDATE
USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 TODO를 삭제할 수 있음
CREATE POLICY "Users can delete own todos"
ON todos FOR DELETE
USING (auth.uid() = user_id);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 설정
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON todos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 실습 2: CRUD 작업

`src/examples/02-crud-operations.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../lib/supabase';

async function crudOperations() {
  console.log('=== CRUD 작업 예제 ===\n');

  // 1. CREATE - 데이터 삽입
  console.log('1. CREATE 작업');
  const { data: insertedTodo, error: insertError } = await supabase
    .from('todos')
    .insert({
      title: 'Supabase 학습하기',
      description: 'TypeScript로 Supabase 다루기',
      completed: false
    })
    .select()
    .single();

  if (insertError) {
    console.error('삽입 오류:', insertError.message);
    console.log('💡 로그인이 필요할 수 있습니다.\n');
  } else {
    console.log('✅ 생성된 TODO:', insertedTodo);
  }

  // 2. READ - 데이터 조회
  console.log('\n2. READ 작업');
  const { data: todos, error: readError } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (readError) {
    console.error('조회 오류:', readError.message);
  } else {
    console.log('✅ TODO 목록:', todos);
  }

  // 3. UPDATE - 데이터 업데이트
  console.log('\n3. UPDATE 작업');
  if (insertedTodo) {
    const { data: updatedTodo, error: updateError } = await supabase
      .from('todos')
      .update({ completed: true })
      .eq('id', insertedTodo.id)
      .select()
      .single();

    if (updateError) {
      console.error('업데이트 오류:', updateError.message);
    } else {
      console.log('✅ 업데이트된 TODO:', updatedTodo);
    }
  }

  // 4. DELETE - 데이터 삭제
  console.log('\n4. DELETE 작업');
  if (insertedTodo) {
    const { error: deleteError } = await supabase
      .from('todos')
      .delete()
      .eq('id', insertedTodo.id);

    if (deleteError) {
      console.error('삭제 오류:', deleteError.message);
    } else {
      console.log('✅ TODO 삭제 완료');
    }
  }
}

crudOperations().catch(console.error);
```

### 실습 3: 조인 쿼리 작성

`src/examples/03-join-queries.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../lib/supabase';

async function joinQueries() {
  console.log('=== JOIN 쿼리 예제 ===\n');

  // 사용자의 TODO와 프로필 정보를 함께 가져오기
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      profiles!todos_user_id_fkey (
        username,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('오류:', error.message);
    return;
  }

  console.log('✅ TODO 목록 (프로필 정보 포함):');
  data?.forEach((todo: any) => {
    console.log(`
      - 제목: ${todo.title}
      - 작성자: ${todo.profiles?.full_name || todo.profiles?.username}
      - 완료 여부: ${todo.completed ? '✅' : '⏳'}
      - 생성일: ${new Date(todo.created_at).toLocaleString()}
    `);
  });
}

joinQueries().catch(console.error);
```

### 실습 4: 트랜잭션 처리

`src/examples/04-transactions.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../lib/supabase';

async function transactions() {
  console.log('=== 트랜잭션 예제 ===\n');

  // PostgreSQL RPC 함수를 사용한 트랜잭션
  // 먼저 데이터베이스에 함수를 생성해야 합니다:
  
  /*
  CREATE OR REPLACE FUNCTION create_todo_with_tag(
    todo_title TEXT,
    todo_description TEXT,
    tag_name TEXT
  )
  RETURNS UUID AS $$
  DECLARE
    new_todo_id UUID;
  BEGIN
    -- TODO 생성
    INSERT INTO todos (title, description)
    VALUES (todo_title, todo_description)
    RETURNING id INTO new_todo_id;
    
    -- 태그 생성 (예시)
    -- INSERT INTO tags (name) VALUES (tag_name);
    
    RETURN new_todo_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  */

  // RPC 호출
  const { data, error } = await supabase.rpc('create_todo_with_tag', {
    todo_title: '새 TODO',
    todo_description: '설명',
    tag_name: '중요'
  });

  if (error) {
    console.error('트랜잭션 오류:', error.message);
    console.log('💡 함수가 데이터베이스에 생성되지 않았을 수 있습니다.');
  } else {
    console.log('✅ 트랜잭션 성공:', data);
  }
}

transactions().catch(console.error);
```

### 실습 5: 타입 안전성 확보

`src/types/database.ts` (자동 생성된 파일):

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
```

타입 안전한 클라이언트 사용:

`src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

이제 자동완성과 타입 체크가 작동합니다!

## 공식 문서

- [Database 가이드](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL 함수](https://supabase.com/docs/guides/database/functions)
- [Query Builder](https://supabase.com/docs/reference/javascript/select)
- [TypeScript](https://supabase.com/docs/reference/javascript/typescript-support)

## 다음 섹션 미리보기

다음 섹션에서는 Supabase Authentication을 다루는 방법을 학습합니다:
- Email/Password 인증
- OAuth 공급자 연동
- Magic Link 인증
- JWT 토큰 관리

## 실습 과제

1. profiles와 todos 테이블을 생성하고 RLS 정책을 설정하세요
2. CRUD 작업을 수행하는 코드를 작성하세요
3. JOIN 쿼리를 사용하여 관련 데이터를 함께 가져오세요
4. TypeScript 타입을 생성하고 타입 안전성을 확보하세요
