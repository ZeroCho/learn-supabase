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
