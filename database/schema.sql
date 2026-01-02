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
ON tags FOR SELECT
TO public
USING (true);

-- 정책: 모든 인증된 사용자는 태그를 생성할 수 있음
CREATE POLICY "Authenticated users can create tags"
ON tags FOR INSERT
TO authenticated
WITH CHECK (true);

-- TODO와 Tags의 다대다 관계를 위한 중간 테이블 (Junction Table)
CREATE TABLE todo_tags (
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(tag_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (todo_id, tag_id)
);

-- RLS 활성화
ALTER TABLE todo_tags ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 TODO에 연결된 태그를 볼 수 있음
CREATE POLICY "Users can view own todo tags"
ON todo_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 TODO에 태그를 연결할 수 있음
CREATE POLICY "Users can create own todo tags"
ON todo_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);

-- 정책: 사용자는 자신의 TODO에서 태그를 제거할 수 있음
CREATE POLICY "Users can delete own todo tags"
ON todo_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM todos
    WHERE todos.id = todo_tags.todo_id
    AND todos.user_id = auth.uid()
  )
);