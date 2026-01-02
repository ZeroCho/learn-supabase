-- 1. pg_net 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. HTTP GET 요청 (비동기)
-- 외부 API를 호출하고 결과를 기다리지 않고 바로 리턴합니다.
SELECT net.http_get(
    'https://jsonplaceholder.typicode.com/todos/1'
);

-- 3. HTTP POST 요청 (JSON 데이터 전송)
-- headers와 body를 포함하여 POST 요청을 보냅니다.
SELECT net.http_post(
    url := 'https://jsonplaceholder.typicode.com/posts',
    body := '{"title": "foo", "body": "bar", "userId": 1}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
);

-- 4. 요청 상태 확인
-- 최근 요청들의 상태(성공/실패 여부, 응답 코드 등)를 확인합니다.
SELECT * FROM net.http_request_queue ORDER BY created DESC LIMIT 5;

-- 5. 트리거와 함께 사용하기 (예시)
-- 테이블에 데이터가 입력될 때마다 웹훅을 호출하는 트리거 함수 예시입니다.
/*
CREATE OR REPLACE FUNCTION notify_webhook()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://my-webhook-service.com/hook',
    body := jsonb_build_object('record', NEW),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_user_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION notify_webhook();
*/
