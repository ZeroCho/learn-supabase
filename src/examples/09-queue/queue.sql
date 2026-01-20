-- 1. pgmq 확장 활성화
-- Supabase Dashboard의 Database → Extensions에서 pgmq를 Enable 한 경우
-- 아래 CREATE EXTENSION는 이미 설치되어 있으면 그대로 통과합니다.
CREATE EXTENSION IF NOT EXISTS pgmq;

-- 2. 큐 생성: 이메일 발송 작업 큐
SELECT pgmq.create_queue('email_jobs');

-- 3. 메시지 추가 (Producer) - 이메일 발송 작업을 큐에 넣기
SELECT pgmq.send(
  'email_jobs',
  jsonb_build_object(
    'to', 'user@example.com',
    'subject', 'Welcome!',
    'body', 'Thank you for signing up.'
  )
);

-- 4. 메시지 읽기 (Consumer) - 워커가 처리할 메시지 가져오기
-- vt = 30초 동안 다른 소비자에게 보이지 않도록 숨김, qty = 1개만 읽기
SELECT * FROM pgmq.read('email_jobs', 30, 1);

-- 5. 메시지 제거(pop) - 처리가 끝난 후 큐에서 제거
SELECT * FROM pgmq.pop('email_jobs');

-- 6. 큐 상태/통계 확인
SELECT * FROM pgmq.q_info('email_jobs');
