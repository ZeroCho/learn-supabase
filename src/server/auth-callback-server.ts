import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

// 환경 변수
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

// HTML 파일 읽기 함수
function getHtmlWithEnv(htmlPath: string): string {
  const htmlContent = fs.readFileSync(htmlPath, "utf-8");
  return htmlContent
    .replace("YOUR_SUPABASE_URL", supabaseUrl)
    .replace("YOUR_SUPABASE_ANON_KEY", supabaseAnonKey);
}

// 정적 파일 제공 (HTML 파일 등)
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// OAuth / Magic Link / 이메일 인증 콜백 처리
// 이메일 인증 링크를 클릭하면 이 엔드포인트로 리다이렉트됩니다
app.get("/auth/callback", (req, res) => {
  const htmlPath = path.join(__dirname, "public/auth-callback.html");
  const html = getHtmlWithEnv(htmlPath);
  res.send(html);
});

// 비밀번호 재설정 콜백 처리
app.get("/reset-password", (req, res) => {
  const htmlPath = path.join(__dirname, "public/reset-password.html");
  const html = getHtmlWithEnv(htmlPath);
  res.send(html);
});

// 루트 경로
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Supabase Auth Callback Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .endpoint {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
          }
          .endpoint code {
            color: #e83e8c;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Supabase Auth Callback Server</h1>
          <p>서버가 정상적으로 실행 중입니다.</p>
          <h2>사용 가능한 엔드포인트:</h2>
          <div class="endpoint">
            <strong>OAuth / Magic Link / 이메일 인증 콜백:</strong><br>
            <code>GET /auth/callback</code><br>
            <small>이메일 확인 링크를 클릭하면 이 URL로 리다이렉트됩니다</small>
          </div>
          <div class="endpoint">
            <strong>비밀번호 재설정 콜백:</strong><br>
            <code>GET /reset-password</code>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(
    `🚀 Auth Callback Server가 http://localhost:${PORT} 에서 실행 중입니다.`
  );
  console.log(`\n사용 가능한 엔드포인트:`);
  console.log(`  - GET /auth/callback (OAuth / Magic Link / 이메일 인증)`);
  console.log(`  - GET /reset-password (비밀번호 재설정)`);
  console.log(`\n환경 변수 확인:`);
  console.log(`  - SUPABASE_URL: ${supabaseUrl ? "✅ 설정됨" : "❌ 미설정"}`);
  console.log(
    `  - SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✅ 설정됨" : "❌ 미설정"}`
  );
});
