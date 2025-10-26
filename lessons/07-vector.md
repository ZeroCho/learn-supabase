# 섹션 7: Vector - AI 검색

## 목표
벡터 검색 및 AI 기능을 구현합니다.

## 학습 내용
- 벡터 임베딩 이해
- pgvector 확장 설정
- 벡터 검색 쿼리
- 유사도 검색

## 실습 예제

```sql
-- 벡터 확장 설치
CREATE EXTENSION vector;

-- 벡터 컬럼 추가
ALTER TABLE documents ADD COLUMN embedding vector(1536);

-- 유사도 검색
SELECT * FROM documents
ORDER BY embedding <-> '[0.1, 0.2, ...]'
LIMIT 5;
```

## 공식 문서
- [Vector 가이드](https://supabase.com/docs/guides/ai)
- [pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
