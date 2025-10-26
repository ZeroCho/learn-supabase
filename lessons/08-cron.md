# 섹션 8: Cron - 스케줄링

## 목표
정기적 작업을 자동화합니다.

## 학습 내용
- pg_cron 확장 이해
- 크론 표현식 작성
- 스케줄 관리
- 로그 및 모니터링

## 실습 예제

```sql
-- pg_cron 확장 활성화
CREATE EXTENSION pg_cron;

-- 매일 자정에 실행
SELECT cron.schedule(
  'daily-cleanup',
  '0 0 * * *',
  $$DELETE FROM old_logs WHERE created_at < NOW() - INTERVAL '30 days'$$
);
```

## 공식 문서
- [Cron 가이드](https://supabase.com/docs/guides/database/extensions/pg_cron)
