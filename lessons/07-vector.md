# 섹션 7: Vector - AI 검색

## 목표
벡터 검색 및 AI 기능을 구현합니다.

## 학습 내용
### 1. 벡터 임베딩 (Vector Embedding) 이해
텍스트, 이미지 등의 비정형 데이터를 AI 모델(OpenAI 등)을 통해 숫자의 나열(벡터)로 변환한 것입니다.
- **의미적 유사성**: 단어가 달라도 의미가 비슷하면 벡터 공간 상에서 가까운 거리에 위치하게 됩니다. 이를 통해 키워드 매칭이 아닌 '의미 기반 검색'이 가능해집니다.

### 2. pgvector 확장 설정
PostgreSQL에서 벡터 데이터를 저장하고 검색할 수 있게 해주는 오픈소스 확장 기능입니다.
- **vector 타입**: DB 컬럼에 `vector(1536)`과 같이 차원 수를 지정하여 벡터 데이터를 저장할 수 있습니다.
- **연산자**: `<=>` (코사인 거리), `<->` (유클리드 거리) 등의 연산자를 지원합니다.

### 3. 벡터 검색 쿼리 및 RPC 함수
클라이언트에서 직접 복잡한 SQL을 실행하는 대신, 데이터베이스에 검색 로직을 담은 함수(RPC)를 만들어두고 호출하는 방식이 권장됩니다.
- **RPC (Remote Procedure Call)**: 서버 측 로직을 캡슐화하여 보안과 성능을 높이고, 클라이언트 코드를 단순하게 유지할 수 있습니다.

### 4. 유사도 검색 (Similarity Search)
사용자의 질문을 벡터로 변환한 뒤, DB에 저장된 문서 벡터들과의 거리를 계산하여 가장 가까운(유사한) 문서를 찾아냅니다.
- **Threshold**: 유사도가 일정 수준 이상인 결과만 필터링하여 정확도를 높일 수 있습니다.

## Vector 설정 방법

벡터 검색을 사용하려면 `vector` 확장을 데이터베이스에 설치해야 합니다.

1.  **Supabase Dashboard** 접속.
2.  **SQL Editor**로 이동.
3.  아래의 "실습 예제" 코드를 복사하여 붙여넣고 **Run** 버튼 클릭.
4.  또는 **Database** -> **Extensions** 메뉴에서 `vector`를 검색하여 활성화할 수도 있습니다.

## 실습 예제

```sql
-- src/07-vector/schema.sql
-- 1. 벡터 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 문서 테이블 생성
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536) -- OpenAI Embedding 모델 차원 수 (1536)
);

-- 3. 유사도 검색 함수 (RPC) 생성
-- 클라이언트에서 supabase.rpc('match_documents', { ... }) 로 호출 가능
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. 인덱스 생성 (속도 최적화)
-- 데이터가 많을 경우 IVFFlat 인덱스를 사용하여 검색 속도를 높입니다.
-- CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);
```

## 공식 문서
- [Vector 가이드](https://supabase.com/docs/guides/ai)
- [pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
