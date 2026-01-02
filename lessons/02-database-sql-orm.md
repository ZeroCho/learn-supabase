# 섹션 2: Database - SQL & ORM

## 목표

Supabase Database를 TypeScript로 다루고, Row Level Security와 PostgreSQL 함수를 활용하는 방법을 학습합니다.

## 학습 내용

### 1. 데이터베이스 설계 기초: 정규화(Normalization)

프론트엔드 개발자가 백엔드를 다룰 때 가장 어려워하는 부분이 바로 "데이터를 어떻게 저장할 것인가?"입니다.
여기서 **정규화(Normalization)**라는 개념이 등장합니다.

**정규화란?**
데이터의 중복을 줄이고, 무결성을 유지하기 위해 데이터를 여러 테이블로 나누는 과정입니다.

**왜 정규화를 해야 할까요?**

- **중복 제거**: 같은 데이터를 여러 곳에 저장하지 않아 용량을 아끼고 관리가 쉬워집니다.
- **데이터 일관성**: 한 곳에서만 수정하면 되므로 데이터 불일치 문제를 방지합니다.

**관계의 종류 (Relationship):**

1.  **1:1 (일대일)**
    - 사용자(User) - 프로필(Profile)
    - 한 명의 사용자는 하나의 프로필만 가집니다.
2.  **1:N (일대다)**
    - 사용자(User) - 게시글(Post)
    - 한 명의 사용자는 여러 개의 게시글을 쓸 수 있습니다.
3.  **N:M (다대다)**
    - 학생(Student) - 수업(Class)
    - 한 학생은 여러 수업을 듣고, 한 수업에는 여러 학생이 있습니다.
    - _중간 테이블(Junction Table)이 필요합니다._

> **Tip**: Supabase는 관계형 데이터베이스(PostgreSQL)이므로, 테이블 간의 관계(Relationship)를 잘 설정하는 것이 핵심입니다.

### 2. 외래 키(Foreign Key)

정규화를 통해 테이블을 여러 개로 쪼개놨다면, 이제 이 테이블들을 논리적으로 연결해 줄 연결 고리가 필요합니다. 그 역할을 하는 것이 바로 **외래 키(Foreign Key)**입니다.

#### 외래 키란? 한 테이블의 필드(컬럼)가 다른 테이블의 **기본 키(Primary Key)**를 참조하도록 설정하는 것입니다.

왜 외래 키를 설정해야 할까요? 단순히 데이터를 연결하는 것을 넘어, **데이터의 무결성(Integrity)**을 보장하기 위함입니다.

- 유효성 검사: 존재하지 않는 사용자 ID로 게시글을 작성할 수 없게 막아줍니다.
- 고아 데이터 방지: 사용자가 탈퇴했을 때, 그 사용자가 쓴 글만 덩그러니 남는 문제를 방지하거나 처리할 수 있습니다.

#### 주요 제약 조건 (Constraints):

외래 키를 설정할 때 가장 중요한 옵션은 "참조하는 데이터가 삭제되었을 때 어떻게 할 것인가?" 입니다.

- NO ACTION / RESTRICT

참조된 데이터(부모)를 삭제하려고 할 때, 이를 참조하는 데이터(자식)가 있다면 삭제를 막습니다.

예: 주문 내역이 있는 상품은 삭제할 수 없음.

- CASCADE (가장 많이 사용)

참조된 데이터(부모)가 삭제되면, 이를 참조하는 데이터(자식)도 함께 삭제됩니다.

예: 사용자가 탈퇴하면 작성한 프로필과 게시글도 같이 삭제됨.

- SET NULL / SET Default

참조된 데이터가 삭제되면, 외래 키 값을 NULL이나 Default 값으로 변경합니다.

예: 담당자가 퇴사하면 담당자 필드를 비워둠.

### 3. Row Level Security (RLS) 개념

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
ON profiles FOR SELECT TO public
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
```

| 역할 이름(Role) | 로그인 여부 | 의미   | 비유                                 |
| --------------- | ----------- | ------ | ------------------------------------ |
| anon            | X           | 비회원 | 가게 앞을 지나가는 행인              |
| authenticated   | O           | 회원   | 가게에 들어온 멤버십 회원            |
| public          | 상관없음    | 모두   | 행인 + 회원 모두 (사람이라면 누구나) |

- USING: 기존 데이터 확인
  SELECT, DELETE에서 사용
- WITH CHECK: 새로운 데이터 검사
  INSERT에서 사용
- UPDATE는 USING과 WITH CHECK 모두 사용 가능.
  - USING: 내가 수정할 수 있는 글인지 확인
  - WITH CHECK: 수정한 내용이 올바른지 확인

SQL 문법이 어렵다면 우측 템플릿을 활용합시다.

### 4. PostgreSQL 함수 이해

Supabase에서는 PostgreSQL 함수를 API 엔드포인트로 자동 노출합니다.

**장점:**

- 서버 로직을 데이터베이스에 배치
- 네트워크 호출 감소
- 트랜잭션 보장

### 5. 성능 최적화: 인덱싱 (Indexing)

**"왜 내 쿼리는 느릴까?"**
데이터가 적을 때는 빠르지만, 10만 건만 넘어가도 쿼리가 느려집니다. 이는 데이터베이스가 데이터를 찾기 위해 모든 행을 다 뒤지기(Full Scan) 때문입니다.

**인덱스란?**
책의 '색인'과 같습니다. 원하는 데이터를 빠르게 찾을 수 있도록 도와주는 별도의 자료구조입니다.

**언제 사용하나요?**

- `WHERE` 절에 자주 사용되는 컬럼 (예: `email`, `user_id`)
- `ORDER BY` 절에 사용되는 컬럼
- `JOIN`의 기준이 되는 컬럼 (Foreign Key는 보통 자동으로 인덱스가 생성되지 않으므로 확인 필요)

```sql
-- 인덱스 생성 예시
CREATE INDEX idx_todos_user_id ON todos(user_id);
```

### 6. 데이터 무결성: 트랜잭션 (Transaction)

**"동시성 문제 해결"**
쇼핑몰 재고가 1개 남았는데 2명이 동시에 결제하면 어떻게 될까요? 프론트엔드 상태 관리로는 해결할 수 없는 문제입니다.

**ACID 원칙:**

- **Atomicity (원자성)**: 모두 성공하거나, 모두 실패해야 함 (All or Nothing).
- **Consistency (일관성)**: 트랜잭션 전후 데이터 상태가 일관되어야 함.
- **Isolation (격리성)**: 동시에 실행되는 트랜잭션은 서로 영향을 주지 않아야 함.
- **Durability (지속성)**: 성공한 트랜잭션은 영구적으로 저장되어야 함.

Supabase에서는 `rpc` 함수를 사용하여 트랜잭션을 구현합니다 (실습 4 참고).

### 7. 협업의 기초: 로컬 개발 & 마이그레이션

혼자 개발할 때는 대시보드에서 클릭으로 수정해도 되지만, 팀 프로젝트에서는 **"DB 스키마도 코드(Infrastructure as Code)"**로 관리해야 합니다.

**마이그레이션이란?**
데이터베이스 스키마 변경 사항을 버전 관리하는 파일입니다. 코드와 마찬가지로 Git으로 관리하여 팀원들과 공유하고, 배포 시 일관된 스키마를 유지할 수 있습니다.

**Supabase CLI 초기화:**

```bash
# Supabase CLI 설치 (이미 설치했다면 생략)
npm install -g supabase

# 프로젝트 초기화
supabase init

# 로컬 Supabase 시작 (Docker 필요)
supabase start
```

**마이그레이션 워크플로우:**

1.  **로컬 DB 실행**: `supabase start`
2.  **변경 사항 적용**: 로컬 대시보드에서 테이블 수정 또는 SQL 직접 실행
3.  **마이그레이션 파일 생성**: `supabase db diff -f migration_name`
4.  **마이그레이션 파일 확인**: `supabase/migrations/` 폴더에 생성된 파일 검토
5.  **Git 커밋**: 생성된 마이그레이션 파일을 팀원과 공유
6.  **배포**: `supabase db push`로 운영 서버에 적용

**마이그레이션 파일 구조:**

마이그레이션 파일은 타임스탬프와 이름으로 구성됩니다:

```
supabase/migrations/
  ├── 20240101000000_initial_schema.sql
  ├── 20240102000000_add_tags_table.sql
  └── 20240103000000_add_indexes.sql
```

**주요 명령어:**

```bash
# 로컬 DB와 원격 DB의 차이점 확인
supabase db diff

# 마이그레이션 파일 생성
supabase db diff -f add_tags_table

# 로컬에 마이그레이션 적용
supabase migration up

# 원격 DB에 마이그레이션 적용
supabase db push

# 마이그레이션 되돌리기 (로컬)
supabase migration down

# 원격 DB 상태 확인
supabase db remote commit
```

### 8. TypeScript 타입 생성 자동화

Supabase CLI를 사용하여 데이터베이스 스키마에서 TypeScript 타입을 자동 생성합니다.

**Supabase CLI 설치:**

```bash
npm install -g supabase
```

**로그인:**

```bash
supabase login
```

**타입 생성:**

```bash
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

### 9. Supabase CLI 사용

**프로젝트 링크:**

```bash
supabase link --project-ref your-project-ref
```

**서버와 싱크 맞추기(도커 필요):**

```bash
supabase db pull
```

**다른 부분 찾기(도커 필요):**

```bash
supabase db diff
```

**마이그레이션 파일 생성:**

```bash
supabase migration new 이름
```

**마이그레이션 진행:**

```bash
supabase db push
```

### 10. Query Builder 패턴

Supabase는 Query Builder 패턴을 사용하여 타입 안전한 쿼리를 작성합니다.

**기본 구조:**

```typescript
const { data, error } = await supabase
  .from("table_name")
  .select("column1, column2")
  .eq("column3", "value")
  .limit(10);
```

## 실습

### 실습 1: 테이블 생성 및 스키마 설계

Supabase 대시보드에서 다음 SQL 실행:

```sql
-- 프로필 테이블
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 프로필을 볼 수 있음
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT TO public
USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 프로필을 업데이트할 수 있음
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO public
USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 프로필을 삽입할 수 있음
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT TO public
WITH CHECK (auth.uid() = user_id);

-- TODO 테이블
CREATE TABLE todos (
  todo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
ON todos FOR SELECT TO public
USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 TODO를 생성할 수 있음
CREATE POLICY "Users can create own todos"
ON todos FOR INSERT TO public
WITH CHECK (auth.uid() = user_id);

-- 정책: 사용자는 자신의 TODO를 업데이트할 수 있음
CREATE POLICY "Users can update own todos"
ON todos FOR UPDATE TO public
USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 TODO를 삭제할 수 있음
CREATE POLICY "Users can delete own todos"
ON todos FOR DELETE TO public
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

-- Tags 테이블 (다대다 관계를 위한 태그 테이블)
CREATE TABLE tags (
  tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 태그를 볼 수 있음
CREATE POLICY "Authenticated users can view tags"
ON tags FOR SELECT TO public
USING (true);

-- 정책: 모든 인증된 사용자는 태그를 생성할 수 있음
CREATE POLICY "Authenticated users can create tags"
ON tags FOR INSERT TO authenticated
WITH CHECK (true);

-- TODO와 Tags의 다대다 관계를 위한 중간 테이블 (Junction Table)
CREATE TABLE todo_tags (
  todo_id UUID REFERENCES todos(todo_id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(tag_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (todo_id, tag_id)
);

-- RLS 활성화
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 TODO에 연결된 태그를 볼 수 있음
CREATE POLICY "Users can view own todo tags"
ON todo_tags FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.todo_id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 TODO에 태그를 연결할 수 있음
CREATE POLICY "Users can create own todo tags"
ON todo_tags FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.todo_id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 TODO에서 태그를 제거할 수 있음
CREATE POLICY "Users can delete own todo tags"
ON todo_tags FOR DELETE TO public
USING (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.todo_id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);
```

### 실습 2: CRUD 작업

`src/examples/02-crud-operations.ts`:

```typescript
import { supabase } from "../lib/supabase";

async function crudOperations() {
  console.log("=== CRUD 작업 예제 ===\n");

  // 1. CREATE - 데이터 삽입
  console.log("1. CREATE 작업");
  const { data: insertedTodo, error: insertError } = await supabase
    .from("todos")
    .insert({
      title: "Supabase 학습하기",
      description: "TypeScript로 Supabase 다루기",
      completed: false,
    })
    .select()
    .single();

  if (insertError) {
    console.error("삽입 오류:", insertError.message);
    console.log("💡 로그인이 필요할 수 있습니다.\n");
  } else {
    console.log("✅ 생성된 TODO:", insertedTodo);
  }

  // 2. READ - 데이터 조회
  console.log("\n2. READ 작업");
  const { data: todos, error: readError } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (readError) {
    console.error("조회 오류:", readError.message);
  } else {
    console.log("✅ TODO 목록:", todos);
  }

  // 3. UPDATE - 데이터 업데이트
  console.log("\n3. UPDATE 작업");
  if (insertedTodo) {
    const { data: updatedTodo, error: updateError } = await supabase
      .from("todos")
      .update({ completed: true })
      .eq("todo_id", insertedTodo.todo_id)
      .select()
      .single();

    if (updateError) {
      console.error("업데이트 오류:", updateError.message);
    } else {
      console.log("✅ 업데이트된 TODO:", updatedTodo);
    }
  }

  // 4. DELETE - 데이터 삭제
  console.log("\n4. DELETE 작업");
  if (insertedTodo) {
    const { error: deleteError } = await supabase
      .from("todos")
      .delete()
      .eq("todo_id", insertedTodo.todo_id);

    if (deleteError) {
      console.error("삭제 오류:", deleteError.message);
    } else {
      console.log("✅ TODO 삭제 완료");
    }
  }
}

crudOperations().catch(console.error);
```

### 실습 3: 조인 쿼리 작성

`src/examples/03-join-queries.ts`:

```typescript
import { supabase } from "../lib/supabase";

async function joinQueries() {
  console.log("=== JOIN 쿼리 예제 ===\n");

  // 사용자의 TODO와 프로필 정보를 함께 가져오기
  const { data, error } = await supabase
    .from("todos")
    .select(
      `
      *,
      owner: profiles (
        full_name: fullName,
        avatar_url: avatarUrl,
        created_at: createdAt
      )
    `
    )
    .order("createdAt", { ascending: false })
    .limit(10);

  if (error) {
    console.error("오류:", error.message);
    return;
  }

  console.log("✅ TODO 목록 (프로필 정보 포함):");
  data?.forEach((todo: any) => {
    console.log(`
      - 제목: ${todo.title}
      - 작성자: ${todo.owner?.fullName}
      - 완료 여부: ${todo.completed ? "✅" : "⏳"}
      - 생성일: ${new Date(todo.createdAt).toLocaleString()}
    `);
  });
}

joinQueries().catch(console.error);
```

### 실습 4: 트랜잭션 처리

`src/examples/04-transactions.ts`:

```typescript
import { supabase } from "../lib/supabase";

async function transactions() {
  console.log("=== 트랜잭션 예제 ===\n");

  // PostgreSQL RPC 함수를 사용한 트랜잭션
  // 먼저 데이터베이스에 함수를 생성해야 합니다:

  /*
  -- 먼저 데이터베이스에 다음 함수를 생성해야 합니다:
  --
  -- 모두 성공하면 COMMIT되고, 하나라도 실패하면 ROLLBACK 됨
  
  CREATE OR REPLACE FUNCTION create_todo_with_tag(
    todo_title TEXT,
    todo_description TEXT,
    tag_name TEXT
  )
  RETURNS UUID AS $$
  DECLARE
    new_todo_id UUID;
    existing_tag_id UUID;
  BEGIN
    -- TODO 생성
    INSERT INTO todos (title, description, user_id)
    VALUES (todo_title, todo_description, auth.uid())
    RETURNING todo_id INTO new_todo_id;
    
    -- 태그가 이미 존재하는지 확인
    SELECT tag_id INTO existing_tag_id
    FROM tags
    WHERE name = tag_name
    LIMIT 1;
    
    -- 태그가 없으면 생성
    IF existing_tag_id IS NULL THEN
      INSERT INTO tags (name)
      VALUES (tag_name)
      RETURNING tag_id INTO existing_tag_id;
    END IF;
    
    -- TODO와 태그 연결
    INSERT INTO todo_tags (todo_id, tag_id)
    VALUES (new_todo_id, existing_tag_id)
    ON CONFLICT (todo_id, tag_id) DO NOTHING;
    
    RETURN new_todo_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  */

  // RPC 호출
  const { data, error } = await supabase.rpc("create_todo_with_tag", {
    todo_title: "새 TODO",
    todo_description: "설명",
    tag_name: "중요",
  });

  if (error) {
    console.error("트랜잭션 오류:", error.message);
    console.log("💡 함수가 데이터베이스에 생성되지 않았을 수 있습니다.");
  } else {
    console.log("✅ 트랜잭션 성공:", data);
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
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          todo_id: string;
          user_id: string;
          title: string;
          description: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          todo_id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          todo_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
```

타입 안전한 클라이언트 사용:

`src/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

이제 자동완성과 타입 체크가 작동합니다!

### 실습 6: Supabase 마이그레이션으로 테이블 생성

이제 대시보드에서 직접 SQL을 실행하는 대신, **마이그레이션 파일**을 사용하여 코드로 스키마를 관리하는 방법을 학습합니다.

**1단계: 마이그레이션 파일 생성**

`supabase/migrations/` 폴더에 새로운 마이그레이션 파일을 생성합니다:

```bash
# 마이그레이션 파일 생성 (자동으로 타임스탬프가 추가됨)
supabase migration new create_tags_table
```

또는 직접 파일을 생성할 수도 있습니다:
`supabase/migrations/20240101000000_create_tags_table.sql`

**2단계: 마이그레이션 파일 작성**

생성된 마이그레이션 파일에 다음 SQL을 작성합니다:

```sql
-- Tags 테이블 생성
CREATE TABLE tags (
  tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자는 태그를 볼 수 있음
CREATE POLICY "Authenticated users can view tags"
ON tags FOR SELECT TO public
USING (true);

-- 정책: 모든 인증된 사용자는 태그를 생성할 수 있음
CREATE POLICY "Authenticated users can create tags"
ON tags FOR INSERT TO authenticated
WITH CHECK (true);

-- TODO와 Tags의 다대다 관계를 위한 중간 테이블
CREATE TABLE todo_tags (
  todo_id UUID REFERENCES todos(todo_id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(tag_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (todo_id, tag_id)
);

-- RLS 활성화
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 TODO에 연결된 태그를 볼 수 있음
CREATE POLICY "Users can view own todo tags"
ON todo_tags FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.todo_id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 TODO에 태그를 연결할 수 있음
CREATE POLICY "Users can create own todo tags"
ON todo_tags FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.todo_id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 TODO에서 태그를 제거할 수 있음
CREATE POLICY "Users can delete own todo tags"
ON todo_tags FOR DELETE TO public
USING (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.todo_id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);
```

**3단계: 원격 DB에 마이그레이션 적용**

```bash
# Supabase 프로젝트와 연결
supabase link --project-ref your-project-ref

# 원격 데이터베이스에 마이그레이션 적용
supabase db push
```

**4단계: 변경 사항 확인**

브라우저에서 표시된 URL로 접속하여 대시보드에서 `tags`와 `todo_tags` 테이블이 생성되었는지 확인합니다.

**마이그레이션의 장점:**

- ✅ **버전 관리**: Git으로 스키마 변경 이력을 추적
- ✅ **협업**: 팀원들이 동일한 스키마를 공유
- ✅ **롤백**: 문제 발생 시 이전 마이그레이션으로 되돌리기 가능
- ✅ **자동화**: CI/CD 파이프라인에서 자동 배포 가능

**💡 Tip**: 대시보드에서 직접 수정한 후 `supabase db diff` 명령어로 변경 사항을 마이그레이션 파일로 추출할 수 있습니다.

## 공식 문서

- [Database 가이드](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL 함수](https://supabase.com/docs/guides/database/functions)
- [Query Builder](https://supabase.com/docs/reference/javascript/select)
- [TypeScript](https://supabase.com/docs/reference/javascript/typescript-support)
- [로컬 개발 환경](https://supabase.com/docs/guides/cli/local-development)
- [데이터베이스 마이그레이션](https://supabase.com/docs/guides/cli/managing-environments)

## 다음 섹션 미리보기

다음 섹션에서는 Supabase Authentication을 다루는 방법을 학습합니다:

- Email/Password 인증
- OAuth 공급자 연동
- Magic Link 인증
- JWT 토큰 관리

## 실습 과제

1. profiles와 todos 테이블을 생성하고 RLS 정책을 설정하세요
2. tags 테이블과 todo_tags 중간 테이블을 생성하여 다대다 관계를 구현하세요
3. CRUD 작업을 수행하는 코드를 작성하세요
4. JOIN 쿼리를 사용하여 관련 데이터를 함께 가져오세요
5. TypeScript 타입을 생성하고 타입 안전성을 확보하세요
6. Supabase 마이그레이션을 사용하여 tags 테이블을 생성하는 마이그레이션 파일을 작성하세요
