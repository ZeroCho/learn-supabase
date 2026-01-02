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