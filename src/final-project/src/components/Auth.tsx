import { useState } from "react";
import { supabase } from "../supabaseClient";
import { Mail, Lock, Loader2, User, Image as ImageIcon } from "lucide-react";
import "./Auth.css";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // 회원가입 시 유저 이름과 아바타 이미지 필수
        if (!username.trim()) {
          setMessage("유저 이름을 입력해주세요.");
          setLoading(false);
          return;
        }
        if (!avatarFile) {
          setMessage("아바타 이미지를 선택해주세요.");
          setLoading(false);
          return;
        }

        // 1. 회원가입
        const { data: authData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });
        if (signUpError) throw signUpError;
        if (!authData.user) {
          throw new Error("회원가입에 실패했습니다.");
        }

        const userId = authData.user.id;

        // 2. 아바타 이미지 업로드
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${userId}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            cacheControl: (3600 * 24).toString(),
            upsert: true,
          });

        if (uploadError) {
          console.error("아바타 업로드 오류:", uploadError);
          throw new Error("아바타 이미지 업로드에 실패했습니다.");
        }

        // 3. Public URL 가져오기
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        // 4. 프로필 생성
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: userId,
          username: username.trim(),
          avatar_url: publicUrl,
        });

        if (profileError) {
          console.error("프로필 생성 오류:", profileError);
          throw new Error("프로필 생성에 실패했습니다.");
        }

        setMessage("회원가입이 완료되었습니다! 이메일을 확인해주세요.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("An unknown error occurred: " + error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>유저 이름</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    required={!isLogin}
                    disabled={isLogin}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>아바타 이미지</label>
                <div className="avatar-upload-wrapper">
                  {avatarPreview ? (
                    <div className="avatar-preview-container">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="avatar-preview"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                        className="avatar-remove-btn"
                      >
                        <span>×</span>
                      </button>
                    </div>
                  ) : (
                    <label className="avatar-upload-label">
                      <ImageIcon className="avatar-upload-icon" />
                      <span>이미지 선택</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: "none" }}
                        disabled={isLogin}
                      />
                    </label>
                  )}
                </div>
              </div>
            </>
          )}

          {message && (
            <div
              className={`message ${
                message.includes("Check") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <Loader2 className="spinner" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setUsername("");
              setAvatarFile(null);
              setAvatarPreview(null);
              setMessage("");
            }}
            className="toggle-btn"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
