# Supabase 실전 강의 PRD (TypeScript & Node.js)

## 1. 강의 개요

### 1.1 목표

- TypeScript와 Node.js를 사용하여 Supabase를 실무에 바로 적용할 수 있는 능력 배양
- Supabase의 핵심 기능과 최신 모듈을 실습 기반으로 습득
- 프로덕션 레벨의 애플리케이션 개발 방법 학습

### 1.2 대상 수강생

- Node.js와 TypeScript 기본 지식이 있는 개발자
- Backend/Full-stack 개발자
- 실무에 Supabase를 도입하려는 개발팀

### 1.3 강의 구성

- 총 10개 섹션
- 각 섹션당 30-60분 강의
- 실전 프로젝트 1개 (Todo 앱 + 실시간 대시보드)
- 공식 문서 링크와 함께 학습

---

## 2. 강의 커리큘럼

### 섹션 1: Supabase 입문

**목표**: Supabase 기본 개념과 프로젝트 설정  
**소요 시간**: 40분

#### 학습 내용

1. Supabase란? (PostgreSQL + Open Source Firebase)
2. Supabase 프로젝트 생성
3. Database URL과 API Keys 이해
4. TypeScript 환경 설정
5. @supabase/supabase-js 설치 및 초기화

#### 실습

- Node.js 프로젝트 생성
- Supabase 클라이언트 초기화
- 환경 변수 설정 (.env)

#### 공식 문서

- [Supabase 시작하기](https://supabase.com/docs/guides/getting-started)
- [JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)

---

### 섹션 2: Database - SQL & ORM

**목표**: Supabase Database를 TypeScript로 다루기  
**소요 시간**: 60분

#### 학습 내용

1. Row Level Security (RLS) 개념
2. PostgreSQL 함수 이해
3. TypeScript 타입 생성 자동화
4. Supabase CLI 사용
5. Query Builder 패턴

#### 실습

- 테이블 생성 및 스키마 설계
- CRUD 작업 (Create, Read, Update, Delete)
- 조인 쿼리 작성
- 트랜잭션 처리
- 타입 안전성 확보

#### 공식 문서

- [Database 가이드](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL 함수](https://supabase.com/docs/guides/database/functions)

---

### 섹션 3: Authentication - 인증 시스템

**목표**: 다양한 인증 방식 구현  
**소요 시간**: 60분

#### 학습 내용

1. Email/Password 인증
2. OAuth 공급자 연동 (Google, GitHub)
3. Magic Link 인증
4. JWT 토큰 관리
5. 사용자 메타데이터 활용
6. 세션 관리

#### 실습

- 회원가입/로그인 구현
- 소셜 로그인 구현
- 사용자 프로필 관리
- 비밀번호 재설정
- 토큰 새로고침

#### 공식 문서

- [인증 가이드](https://supabase.com/docs/guides/auth)
- [JavaScript Auth](https://supabase.com/docs/reference/javascript/auth-api)
- [OAuth 공급자](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

### 섹션 4: Storage - 파일 관리

**목표**: 파일 업로드/다운로드 및 이미지 최적화  
**소요 시간**: 50분

#### 학습 내용

1. Storage 버킷 생성 및 정책 설정
2. 파일 업로드/다운로드
3. 공개/비공개 파일 관리
4. 이미지 리사이징 및 최적화
5. 대용량 파일 처리

#### 실습

- 프로필 이미지 업로드
- 파일 목록 조회
- 권한별 접근 제어
- 이미지 변환 활용

#### 공식 문서

- [Storage 가이드](https://supabase.com/docs/guides/storage)
- [Storage API](https://supabase.com/docs/reference/javascript/storage-api)

---

### 섹션 5: Edge Functions - 서버리스 함수

**목표**: Supabase Edge Functions로 API 엔드포인트 구현  
**소요 시간**: 70분

#### 학습 내용

1. Edge Functions 아키텍처
2. Deno 런타임 이해
3. TypeScript로 함수 작성
4. 환경 변수 관리
5. 외부 API 연동
6. 에러 핸들링 및 로깅

#### 실습

- CRON 작업 구현
- 결제 API 연동
- 이메일 발송 함수
- 파일 처리 워크플로우

#### 공식 문서

- [Edge Functions 가이드](https://supabase.com/docs/guides/functions)
- [Edge Functions 예제](https://supabase.com/docs/guides/functions/examples)

---

### 섹션 6: Realtime - 실시간 통신

**목표**: 실시간 데이터 동기화 구현  
**소요 시간**: 50분

#### 학습 내용

1. Realtime 구독/구독 해제
2. 채널 및 필터 활용
3. Broadcast vs Presence
4. 실시간 이벤트 처리
5. 성능 최적화

#### 실습

- 실시간 채팅 구현
- 협업 기능 (실시간 편집)
- 상태 동기화
- 온라인 사용자 표시

#### 공식 문서

- [Realtime 가이드](https://supabase.com/docs/guides/realtime)
- [Realtime API](https://supabase.com/docs/reference/javascript/realtime-api)
- [Broadcasts](https://supabase.com/docs/guides/realtime/broadcast)

---

### 섹션 7: Vector - AI 검색

**목표**: 벡터 검색 및 AI 기능 구현  
**소요 시간**: 60분

#### 학습 내용

1. 벡터 임베딩 이해
2. pgvector 확장 설정
3. 벡터 검색 쿼리
4. 유사도 검색
5. RAG (Retrieval-Augmented Generation) 구현

#### 실습

- 문서 검색 시스템
- 자연어 검색
- AI 챗봇 연동
- 추천 시스템

#### 공식 문서

- [Vector 가이드](https://supabase.com/docs/guides/ai)
- [pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
- [AI 검색 예제](https://supabase.com/docs/guides/ai/vector-columns)

---

### 섹션 8: Cron - 스케줄링

**목표**: 정기적 작업 자동화  
**소요 시간**: 40분

#### 학습 내용

1. pg_cron 확장 이해
2. 크론 표현식 작성
3. 스케줄 관리
4. 로그 및 모니터링
5. 에러 처리 전략

#### 실습

- 데이터 정리 작업
- 주기적 리포트 생성
- 알림 발송 스케줄
- 백업 자동화

#### 공식 문서

- [Cron 가이드](https://supabase.com/docs/guides/database/extensions/pg_cron)

---

### 섹션 9: Queue - 작업 큐

**목표**: 비동기 작업 처리 시스템 구현  
**소요 시간**: 50분

#### 학습 내용

1. pg_net 확장 이해
2. 큐 생성 및 관리
3. 작업 추가 및 처리
4. 재시도 전략
5. 우선순위 큐

#### 실습

- 이미지 처리 워크플로우
- 이메일 발송 큐
- 데이터 처리 파이프라인
- 작업 모니터링

#### 공식 문서

- [Queue 예제](https://github.com/supabase/pg_net)

---

### 섹션 10: 실전 프로젝트 - Todo 앱 with 실시간 대시보드

**목표**: 전체 기능 통합 애플리케이션 개발  
**소요 시간**: 90분

#### 프로젝트 요구사항

1. **인증**: Email/Password + OAuth
2. **Database**: CRUD + RLS
3. **Storage**: 파일 첨부
4. **Realtime**: 실시간 업데이트
5. **Vector**: 자연어 검색
6. **Edge Functions**: 백그라운드 작업
7. **Queue**: 알림 발송
8. **Cron**: 데이터 분석 리포트

#### 구현 기능

- 사용자 인증 및 권한 관리
- Todo 생성/수정/삭제
- 실시간 협업
- 파일 업로드
- AI 기반 검색
- 대시보드 통계
- 자동 리포트 생성

#### 배포

- Supabase 프로덕션 환경 설정
- 환경 변수 관리
- 성능 최적화
- 모니터링 설정

#### 공식 문서

- [배포 가이드](https://supabase.com/docs/guides/platform/deployment)
- [모니터링](https://supabase.com/docs/guides/platform/logs)

---

## 3. 학습 자료

### 3.1 제공 자료

- 강의 동영상 (각 섹션당 1개)
- 소스 코드 (GitHub 저장소)
- 실습 문제 및 해설
- 공식 문서 링크 모음
- 최종 프로젝트 완성 코드

### 3.2 사전 지식

- Node.js 기본
- TypeScript 기본
- REST API 개념
- SQL 기본

### 3.3 추천 학습 순서

1. 섹션 1-2: 기초
2. 섹션 3-4: 핵심 기능
3. 섹션 5-6: 고급 기능
4. 섹션 7-9: 모듈 활용
5. 섹션 10: 종합 실습

---

## 4. 평가 기준

### 4.1 과제

- 각 섹션별 실습 과제 (8개)
- 최종 프로젝트 (1개)

### 4.2 평가 항목

- 코드 품질 (40%)
- 기능 완성도 (30%)
- Best Practices 적용 (20%)
- 문서화 (10%)

---

## 5. 추가 리소스

### 5.1 공식 커뮤니티

- [GitHub](https://github.com/supabase/supabase)
- [Discord](https://discord.supabase.com)
- [공식 블로그](https://supabase.com/blog)

### 5.2 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [JavaScript 참조](https://supabase.com/docs/reference/javascript/introduction)
- [Database 예제](https://supabase.com/examples)

---

## 6. 강의 특징

### 6.1 실전 중심

- 이론보다 실습 위주
- 실제 프로젝트 기반 학습
- Production-ready 코드 제공

### 6.2 최신 기술 반영

- TypeScript 최신 기능 활용
- Supabase 최신 모듈 포함
- Best Practices 적용

### 6.3 단계별 학습

- 기초부터 고급까지
- 점진적 난이도 증가
- 복습 강화

---

## 7. 예상 수강 시간

- 강의 영상: 약 11시간
- 실습 및 과제: 약 8시간
- 최종 프로젝트: 약 3시간
- **총 학습 시간: 약 22시간**

---

## 8. 강의 개선 계획

### 8.1 피드백 수집

- 수강생 설문조사
- 코드 리뷰 요청
- 커뮤니티 토론

### 8.2 지속적 업데이트

- Supabase 신규 기능 반영
- 최신 문서 링크 업데이트
- 보안 이슈 대응
