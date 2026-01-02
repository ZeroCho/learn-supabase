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
