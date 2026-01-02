# 섹션 8: Cron - 스케줄링

## 목표
정기적 작업을 자동화합니다.

## 학습 내용
### 1. pg_cron 확장 이해
PostgreSQL 내에서 직접 크론 작업(스케줄링 작업)을 실행할 수 있게 해주는 확장 기능입니다. 별도의 백엔드 서버 없이 데이터베이스 레벨에서 주기적인 작업을 처리할 수 있어 효율적입니다.

### 2. 크론 표현식 작성
표준 크론 문법을 따릅니다:
- `* * * * *` (분 시 일 월 요일)
- 예: `0 0 * * *` (매일 자정), `*/5 * * * *` (5분마다)

### 3. 스케줄 관리
- **스케줄 등록**: `cron.schedule` 함수를 사용하여 작업을 등록합니다.
- **스케줄 취소**: `cron.unschedule` 함수를 사용하여 등록된 작업을 제거할 수 있습니다.
- **작업 목록 확인**: `cron.job` 테이블을 조회하여 현재 등록된 모든 스케줄을 확인할 수 있습니다.

### 4. 로그 및 모니터링
- 작업 실행 결과와 상태는 `cron.job_run_details` 테이블에 기록됩니다.
- 작업이 실패했는지, 성공했는지, 실행 시간은 얼마나 걸렸는지 등을 모니터링할 수 있습니다.

## Cron 설정 방법

스케줄링을 사용하려면 `pg_cron` 확장을 설치해야 합니다.

1.  **Supabase Dashboard** 접속.
2.  **SQL Editor**로 이동.
3.  아래의 "실습 예제" 코드를 복사하여 붙여넣고 **Run** 버튼 클릭.
4.  또는 **Database** -> **Extensions** 메뉴에서 `pg_cron`을 검색하여 활성화할 수도 있습니다.
5.  등록된 스케줄은 `cron.job` 테이블을 조회하여 확인할 수 있습니다: `SELECT * FROM cron.job;`

## 실습 예제

```sql
-- src/08-cron/schedule.sql
-- 1. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. 스케줄 등록 (매일 자정에 실행)
-- 'daily-cleanup'이라는 이름으로 스케줄을 등록합니다.
-- 이미 동일한 이름의 스케줄이 있다면 업데이트됩니다.
SELECT cron.schedule(
  'daily-cleanup',   -- 스케줄 이름
  '0 0 * * *',       -- 크론 표현식 (매일 0시 0분)
  $$DELETE FROM old_logs WHERE created_at < NOW() - INTERVAL '30 days'$$ -- 실행할 SQL
);

-- 3. 매주 월요일 아침 9시에 실행되는 작업 예시
SELECT cron.schedule(
  'weekly-report',
  '0 9 * * 1',       -- 매주 월요일 09:00
  $$SELECT generate_weekly_report()$$ -- 사용자 정의 함수 호출 예시
);

-- 4. 스케줄 취소 (등록된 작업 제거)
-- 'daily-cleanup' 스케줄을 제거합니다.
SELECT cron.unschedule('daily-cleanup');

-- 5. 등록된 스케줄 목록 확인
SELECT * FROM cron.job;

-- 6. 작업 실행 로그 확인 (최근 10개)
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### 코드 설명
- **`cron.schedule`**: 새로운 크론 작업을 등록합니다. 첫 번째 인자는 작업의 고유 이름, 두 번째는 크론 표현식, 세 번째는 실행할 SQL 명령어입니다.
- **`cron.unschedule`**: 등록된 작업을 이름으로 찾아 삭제합니다.
- **`cron.job`**: 현재 예약된 모든 작업의 리스트를 보여줍니다.
- **`cron.job_run_details`**: 작업의 실행 이력(성공/실패 여부, 실행 시간 등)을 확인할 수 있어 디버깅에 유용합니다.

## 공식 문서
- [Cron 가이드](https://supabase.com/docs/guides/database/extensions/pg_cron)
