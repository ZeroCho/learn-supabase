# 섹션 1: Supabase 입문

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

**Firebase vs Supabase:**
| 기능 | Firebase | Supabase |
|------|----------|----------|
| 데이터베이스 | NoSQL (Firestore) | PostgreSQL (관계형) |
| 실시간 | 자동 | 자동 |
| 인증 | Google 인증 | 다양한 공급자 |
| 스토리지 | Cloud Storage | Object Storage |
| 가격 | 사용량 기반 | 사용량 기반 |
| 오픈소스 | 아니오 | 예 |

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
