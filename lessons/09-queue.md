# 섹션 9: Queue - 작업 큐

## 목표
비동기 작업 처리 시스템을 구현합니다.

## 학습 내용
### 1. pg_net 확장 이해
PostgreSQL에서 비동기 HTTP 요청을 보낼 수 있게 해주는 확장 기능입니다. 이를 통해 데이터베이스 이벤트(예: 트리거)에 반응하여 외부 API를 호출하거나, 시간이 오래 걸리는 작업을 큐에 넣어 비동기로 처리할 수 있습니다.

### 2. 큐 생성 및 관리
- `pg_net`은 내부적으로 요청을 관리하는 큐 테이블을 가지고 있습니다.
- 사용자가 직접 큐 자료구조를 만들 필요 없이, 함수 호출만으로 요청을 큐에 적재합니다.

### 3. 작업 추가 및 처리
- `net.http_get`, `net.http_post` 등의 함수를 사용하여 HTTP 요청 작업을 큐에 추가합니다.
- 추가된 작업은 백그라운드 워커에 의해 자동으로 처리됩니다.

### 4. 재시도 전략
- 요청 실패 시 자동으로 재시도하는 로직이 내장되어 있을 수 있거나, 사용자가 직접 재시도 정책을 설정할 수 있습니다.
- 실패한 요청에 대한 로그를 확인하고 분석하여 안정적인 시스템을 구축해야 합니다.

## Queue 설정 방법 (pg_net)

비동기 HTTP 요청을 위해 `pg_net` 확장을 사용합니다.

1.  **Supabase Dashboard** 접속.
2.  **SQL Editor**로 이동.
3.  아래의 "실습 예제" 코드를 복사하여 붙여넣고 **Run** 버튼 클릭.
4.  또는 **Database** -> **Extensions** 메뉴에서 `pg_net`을 검색하여 활성화할 수도 있습니다.
5.  요청 상태는 `net.http_request_queue` 테이블 등에서 확인할 수 있습니다.

## 실습 예제

```sql
-- src/09-queue/queue.sql
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
```

### 코드 설명
- **`net.http_get` / `net.http_post`**: 비동기 HTTP 요청을 생성하여 큐에 넣습니다. 함수는 즉시 반환되며, 실제 요청은 백그라운드에서 처리됩니다.
- **`net.http_request_queue`**: 처리 대기 중이거나 처리된 요청들의 상태를 확인할 수 있는 테이블입니다.
- **트리거 활용**: 데이터베이스의 변경 사항(INSERT, UPDATE 등)에 반응하여 자동으로 외부 API를 호출하는 웹훅 시스템을 구축할 때 유용하게 사용됩니다.

## 공식 문서
- [Queue 예제](https://github.com/supabase/pg_net)
