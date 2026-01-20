# 섹션 9: Queue - 작업 큐 (Supabase Queue / pgmq)

## 목표

Supabase Queue(pgmq)를 사용해 **비동기 작업 처리 시스템**을 구현합니다.

## 학습 내용

### 1. Supabase Queue(pgmq) 이해

`pgmq`는 PostgreSQL용 **메시지 큐(queue) 확장**입니다.  
애플리케이션에서 바로 처리하지 않고 **나중에 처리하고 싶은 작업**(예: 이메일 발송, 썸네일 생성, 외부 API 호출 등)을 메시지 큐에 넣어두고, 워커(consumer)가 비동기로 처리하도록 만들 수 있습니다.

- 메시지는 **큐 이름(queue name)** 기반으로 분류됩니다.
- 각 메시지는 **payload(JSON)**, **가시성 타임아웃(visibility timeout)**, **생성 시각, 시도 횟수** 등의 정보를 가집니다.

### 2. 큐 생성

`pgmq`에서는 SQL 함수로 큐를 생성합니다.

- `pgmq.create_queue(queue_name text)`  
  지정한 이름의 큐를 생성합니다.

예: `email_jobs`라는 큐 생성

```sql
SELECT pgmq.create_queue('email_jobs');
```

### 3. 메시지 추가 (Producer)

작업을 큐에 추가(push)할 때는 `pgmq.send` 함수를 사용합니다.

- `pgmq.send(queue_name text, msg jsonb)`  
  지정한 큐에 JSON payload를 메시지로 저장합니다.

예: 이메일 발송 작업 큐에 메시지 추가

```sql
SELECT pgmq.send(
  'email_jobs',
  jsonb_build_object(
    'to', 'user@example.com',
    'subject', 'Welcome!',
    'body', 'Thank you for signing up.'
  )
);
```

### 4. 메시지 소비 (Consumer)

워커(consumer)는 큐에서 메시지를 가져와 작업을 처리합니다.  
이때 `pgmq.read` / `pgmq.pop` / `pgmq.archive` 등의 함수를 사용합니다.

- `pgmq.read(queue_name text, vt integer, qty integer)`
  - 메시지를 최대 `qty`개까지 가져오고,
  - `vt`초 동안 다른 소비자에게 보이지 않게(가시성 타임아웃) 설정합니다.
- `pgmq.pop(queue_name text)`
  - 가장 오래된 메시지를 즉시 가져오면서 큐에서 제거합니다.

간단한 소비 예시:

```sql
-- 1개 메시지를 가져오고, 30초 동안 다른 소비자에게 숨김
SELECT * FROM pgmq.read('email_jobs', 30, 1);

-- 작업을 모두 끝내고 나서 큐에서 제거(pop)
SELECT * FROM pgmq.pop('email_jobs');
```

### 5. 재시도 및 모니터링

- **재시도**: 워커가 메시지 처리에 실패한 경우,
  - 가시성 타임아웃이 지나면 메시지가 다시 보이게 되어 다른 워커가 재시도할 수 있습니다.
- **모니터링**:
  - `pgmq.q_info(queue_name)` : 큐에 대한 통계 정보(총 메시지 수, 처리된 수 등)를 조회합니다.
  - `pgmq.read` 시에 반환되는 `attempts` 필드를 통해 몇 번째 시도인지 확인할 수 있습니다.

## Supabase에서 Queue(pgmq) 설정 방법

1. **Supabase Dashboard** 접속
2. **Database → Extensions** 메뉴로 이동
3. `pgmq`(또는 `supabase`에서 제공하는 Queue/pgmq 관련 확장)를 검색하여 **Enable/Install**
4. **SQL Editor**로 이동
5. 아래의 "실습 예제" 코드를 복사하여 붙여넣고 **Run** 버튼 클릭

## 실습 예제

`src/examples/09-queue/queue.sql` 파일과 동일한 내용입니다.

```sql
-- src/examples/09-queue/queue.sql

-- 1. pgmq 확장 활성화 (Supabase Dashboard의 Extensions에서 이미 켰다면 생략 가능)
CREATE EXTENSION IF NOT EXISTS pgmq;

-- 2. 큐 생성: 이메일 발송 작업을 위한 큐
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
```

### 코드 설명

- **`pgmq.create_queue`**: 주어진 이름의 큐(메시지 테이블)를 생성합니다.
- **`pgmq.send`**: JSON payload를 큐에 메시지로 추가합니다. 애플리케이션 서버는 이 함수만 호출하고 바로 응답을 반환할 수 있습니다.
- **`pgmq.read`**: 워커가 처리해야 할 메시지를 가져옵니다. 가시성 타임아웃(`vt`) 동안 다른 워커가 같은 메시지를 보지 못하게 해서 **중복 처리**를 줄입니다.
- **`pgmq.pop`**: 처리가 끝난 메시지를 큐에서 제거합니다.
- **`pgmq.q_info`**: 큐의 메시지 수, 처리된 메시지 수 등 통계 정보를 조회하여 모니터링에 활용할 수 있습니다.

## 공식 문서

- **pgmq 공식 GitHub**: [https://github.com/tembo-io/pgmq](https://github.com/tembo-io/pgmq)
- **Supabase Queue 관련 문서**: [링크](https://supabase.com/docs/guides/queues)
