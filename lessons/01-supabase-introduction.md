# 섹션 1: Supabase 입문

## 0. 들어가며: AI 시대, 왜 풀스택인가?

> "AI 시대, 프론트엔드 개발자의 생존 전략은 **풀스택**입니다."

우리는 지금 AI가 코드를 짜주는 시대에 살고 있습니다. 단순히 화면을 그리는 것만으로는 경쟁력을 갖기 어렵습니다. 
이제는 **"아이디어를 실제 서비스로 만들어내는 능력"**이 중요합니다. 이를 위해서는 프론트엔드뿐만 아니라 백엔드, 데이터베이스, 인프라까지 이해해야 합니다.

하지만 백엔드를 처음부터 깊게 파는 것은 시간이 오래 걸립니다. 여기서 **Supabase**가 등장합니다.
Supabase를 사용하면 복잡한 백엔드 구축 없이도, 프론트엔드 지식만으로 **엔터프라이즈급 서비스**를 만들 수 있습니다.

이 강의는 단순한 툴 사용법을 넘어, 여러분이 **"혼자서도 서비스를 런칭할 수 있는 풀스택 개발자"**로 거듭나도록 돕는 것이 목표입니다.

## 0.1. AI와 함께 개발하기: Supabase MCP

이제 개발은 혼자 하는 것이 아닙니다. **AI Agent**와 함께합니다.
Supabase는 **MCP (Model Context Protocol)** 서버를 제공하여, Cursor나 Windsurf 같은 AI 에디터가 여러분의 데이터베이스 구조를 이해하고 직접 조작할 수 있게 돕습니다.

**Supabase MCP가 할 수 있는 일:**
- "내 DB 스키마를 보고 사용자 테이블을 만들어줘"라고 말하면 SQL을 작성 및 실행
- "최근 가입한 유저 5명 보여줘"라고 하면 데이터를 조회해서 보여줌
- 복잡한 RLS 정책을 AI가 대신 작성하고 검증

## 목표

Supabase 기본 개념을 이해하고 TypeScript + Node.js 환경에서 Supabase 클라이언트를 설정합니다.

## 학습 내용

### 1. Supabase란?

Supabase는 Firebase의 오픈소스 대안으로, PostgreSQL 데이터베이스를 기반으로 하는 Backend as a Service (BaaS) 플랫폼입니다.

**주요 특징:**

- PostgreSQL 기반의 강력한 데이터베이스
- 실시간 구독 기능
- 인증 시스템
- 파일 스토리지
- 엣지 함수 (serverless)
- 오픈소스

### 2. Supabase vs AWS vs Firebase

**Supabase의 장단점:**

| 장점 (Pros) | 단점 (Cons) |
|---|---|
| **빠른 개발 속도**: 백엔드 구축 시간 단축 | **복잡한 쿼리 제약**: ORM만으로는 한계가 있을 수 있음 (SQL 필요) |
| **PostgreSQL**: 강력한 관계형 DB 사용 | **Cold Start**: 엣지 함수의 초기 실행 지연 가능성 |
| **실시간 기능**: 별도 설정 없이 Realtime 지원 | **플랫폼 종속성**: 특정 기능은 Supabase 의존적 |
| **오픈소스**: 벤더 락인(Vendor Lock-in) 최소화 | |

**AWS 직접 구축 vs Supabase:**

| 구분 | AWS (EC2, RDS, etc.) | Supabase |
|---|---|---|
| **난이도** | 높음 (네트워크, 보안, OS 관리 필요) | 낮음 (클릭 몇 번으로 설정 완료) |
| **유지보수** | 직접 관리 (패치, 백업 등) | 관리형 (알아서 관리해줌) |
| **비용** | 사용한 만큼 + 인스턴스 비용 | 무료 티어 넉넉함 + 사용량 기반 |
| **적합성** | 초대형 서비스, 세밀한 인프라 제어 필요 시 | 스타트업, 사이드 프로젝트, 빠른 MVP |

> **결론**: 프론트엔드 개발자가 백엔드 로직에 집중하기에는 Supabase가 압도적으로 효율적입니다. 인프라 관리는 Supabase에 맡기고, 우리는 **비즈니스 로직**에 집중합시다.

**Firebase vs Supabase: 프론트엔드 관점의 상세 비교**

프론트엔드 개발자가 체감하는 가장 큰 차이는 **"데이터를 다루는 방식"**입니다.

| 특징 | Firebase (NoSQL) | Supabase (Relational) | 프론트엔드 개발자에게 미치는 영향 |
|---|---|---|---|
| **데이터 구조** | JSON 트리 구조 (문서/컬렉션) | 엑셀 같은 테이블 구조 (행/열) | **Supabase 승**: 엑셀에 익숙하다면 Supabase가 훨씬 직관적입니다. |
| **관계 표현** | 어려움 (데이터 중복 저장 권장) | 쉬움 (Foreign Key, Join) | **Supabase 승**: "사용자가 쓴 글 조회" 같은 쿼리가 `select('*, posts(*)')` 한 줄로 끝납니다. |
| **쿼리 능력** | 제한적 (복잡한 필터링 어려움) | 강력함 (SQL의 모든 기능 사용) | **Supabase 승**: "가격순 정렬 후 5개만 뽑기" 같은 쿼리가 매우 쉽습니다. |
| **타입 안전성** | 수동 관리 필요 | **자동 생성 (Type Generation)** | **Supabase 승**: DB 스키마를 그대로 TypeScript 타입으로 만들어줘서, 오타 실수가 사라집니다. |
| **실시간** | 기본적으로 모든 것이 실시간 | 선택적으로 실시간 (구독 필요) | **무승부**: 채팅 같은 건 Firebase가 편하지만, 불필요한 리소스 낭비를 막는 건 Supabase가 좋습니다. |

> **핵심 요약**: 
> - **Firebase**: 채팅앱처럼 데이터 구조가 단순하고 실시간성이 매우 중요할 때 좋습니다.
> - **Supabase**: 게시판, 쇼핑몰, 사내 툴처럼 **데이터 간의 관계가 중요하고 복잡한 쿼리**가 필요할 때 압도적으로 좋습니다. (대부분의 웹 서비스는 여기에 해당합니다)

### 2. Supabase 프로젝트 생성

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `learn-supabase`
   - Database Password: 강력한 비밀번호 설정
   - Region: 선택 (가장 가까운 지역)
4. 프로젝트 생성 대기 (약 2분)

### 3. API Keys 이해하기

프로젝트 설정(Settings) → API에서 다음 정보를 확인:

- **URL**: `https://[your-project].supabase.co`
- **anon/public key**: 클라이언트에서 사용 (Row Level Security 적용)
- **service_role key**: 서버에서만 사용 (모든 권한)

⚠️ **보안 주의사항:**

- `service_role` 키는 절대 클라이언트에 노출하지 마세요
- `anon` 키만 클라이언트 코드에 포함

### 4. TypeScript 환경 설정

#### 4.1 프로젝트 초기화

```bash
mkdir learn-supabase
cd learn-supabase
npm init -y
```

#### 4.2 의존성 설치

```bash
npm install @supabase/supabase-js
npm install -D typescript ts-node @types/node
npm install -D dotenv
```

#### 4.3 TypeScript 설정

`tsconfig.json` 생성:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 4.4 package.json 스크립트 추가

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## 실습

### 실습 1: Node.js 프로젝트 생성

```bash
# 1. 프로젝트 디렉토리 생성
mkdir learn-supabase-course
cd learn-supabase-course

# 2. npm 초기화
npm init -y

# 3. 의존성 설치
npm install @supabase/supabase-js dotenv
npm install -D typescript ts-node @types/node

# 4. 디렉토리 구조 생성
mkdir src
mkdir src/examples
```

### 실습 2: Supabase 클라이언트 초기화

`src/lib/supabase.ts` 파일 생성:

```typescript
import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 값 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL과 Anon Key가 필요합니다.");
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 실습 3: 환경 변수 설정

`.env` 파일 생성 (루트 디렉토리):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

`.env.example` 파일 생성:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

`.gitignore`에 추가:

```
.env
node_modules
dist
```

환경 변수 로드 (`src/index.ts`):

```typescript
import dotenv from "dotenv";

// .env 파일 로드
dotenv.config();

import { supabase } from "./lib/supabase";

async function main() {
  console.log("Supabase 클라이언트가 성공적으로 초기화되었습니다!");
  console.log("URL:", process.env.SUPABASE_URL);

  // 간단한 연결 테스트
  const { data, error } = await supabase.from("test").select("*").limit(1);

  if (error) {
    console.log("연결 테스트 완료 (테이블이 없어도 괜찮습니다)");
  } else {
    console.log("데이터:", data);
  }
}

main().catch(console.error);
```

### 실습 4: 첫 번째 연결 테스트

`src/examples/01-connection-test.ts`:

```typescript
import dotenv from "dotenv";
dotenv.config();

import { supabase } from "../lib/supabase";

async function testConnection() {
  try {
    // 클라이언트 정보 출력
    console.log("=== Supabase 연결 테스트 ===\n");
    console.log("URL:", supabase.supabaseUrl);
    console.log(
      "Key 사용 중:",
      supabase.supabaseKey.substring(0, 20) + "...\n"
    );

    // 서버 정보 가져오기
    const { data, error } = await supabase
      .from("_realtime")
      .select("*")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      console.error("연결 오류:", error.message);
      return;
    }

    console.log("✅ Supabase에 성공적으로 연결되었습니다!");

    // 현재 사용자 정보 (로그인하지 않았으면 null)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("세션:", session ? "활성화됨" : "비활성화됨");
  } catch (error) {
    console.error("예상치 못한 오류:", error);
  }
}

testConnection();
```

실행:

```bash
npm run dev src/examples/01-connection-test.ts
```

## 예제 코드 구조

```
learn-supabase-course/
├── src/
│   ├── lib/
│   │   └── supabase.ts         # Supabase 클라이언트 설정
│   ├── examples/
│   │   ├── 01-connection-test.ts
│   │   ├── 02-basic-queries.ts
│   │   └── ...
│   └── index.ts                # 메인 진입점
├── .env                         # 환경 변수 (git에 포함하지 않음)
├── .env.example                # 환경 변수 템플릿
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

## 공식 문서

- [Supabase 시작하기](https://supabase.com/docs/guides/getting-started)
- [JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)
- [환경 변수 설정](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)

## 다음 섹션 미리보기

다음 섹션에서는 Supabase Database를 다루는 방법을 학습합니다:

- Row Level Security (RLS)
- CRUD 작업
- TypeScript 타입 생성
- PostgreSQL 함수

## 실습 과제

1. Supabase 프로젝트를 생성하고 URL과 키를 확인하세요
2. TypeScript 프로젝트를 설정하고 Supabase 클라이언트를 초기화하세요
3. `.env` 파일을 생성하고 환경 변수를 설정하세요
4. 연결 테스트 코드를 실행하여 정상 작동하는지 확인하세요
