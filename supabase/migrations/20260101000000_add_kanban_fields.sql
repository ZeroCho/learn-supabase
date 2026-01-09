-- 협업 칸반보드를 위한 필드 추가

-- status 컬럼 추가 (todo, in_progress, done)
ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo';

-- image_url 컬럼 추가 (이미지 첨부용)
ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- status에 대한 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_todos_status ON public.todos(status);

-- RLS 정책 업데이트: 모든 인증된 사용자가 할일을 볼 수 있도록
-- (기존 정책이 있다면 삭제 후 생성)
DROP POLICY IF EXISTS "Users can view own todos" ON public.todos;
CREATE POLICY "Users can view all todos"
ON public.todos FOR SELECT
TO authenticated
USING (true);

-- Storage 버킷 생성 (이미지 업로드용)
-- 주의: 이 SQL은 Storage 버킷을 직접 생성하지 않습니다.
-- Supabase Dashboard에서 수동으로 생성하거나 Storage API를 사용해야 합니다.
-- 버킷 이름: todo-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

