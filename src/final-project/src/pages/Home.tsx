import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Database } from "../types/database";
import Dashboard from "../components/Dashboard";
import KanbanBoard from "../components/KanbanBoard";
import OnlineUsers from "../components/OnlineUsers";
import { LogOut } from "lucide-react";
import "./Home.css";

type Todo = Database["public"]["Tables"]["todos"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<
    Record<
      string,
      Array<{ user_id: string; online_at: string; email?: string }>
    >
  >({});
  const [editingTodos, setEditingTodos] = useState<Record<string, string>>({});
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});

  useEffect(() => {
    getUser();
    fetchTodos();
    fetchProfiles();

    // 실시간 업데이트 구독
    const todosChannel = supabase
      .channel("todos_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => {
          // TODO: 변경된 것만 수정하면 더 효율적이지 않을까?
          fetchTodos();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchProfiles();
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = todosChannel.presenceState();
        // 접속 상태 업데이트
        const onlineState: Record<
          string,
          Array<{ user_id: string; online_at: string; email?: string }>
        > = {};
        console.log("state", state);
        Object.entries(state).forEach((data) => {
          const presenceArray = data[1] as unknown as PresenceData[];
          if (presenceArray[0]?.user_id) {
            onlineState[presenceArray[0].user_id] = presenceArray.map(
              (p: PresenceData) => ({
                user_id: p.user_id as string,
                online_at: p.online_at || new Date().toISOString(),
                email: p.email as string | undefined,
              })
            );
          }
        });
        console.log("onlineState", onlineState);
        setOnlineUsers(onlineState);

        // 편집 상태 업데이트
        const editingState: Record<string, string> = {};
        Object.entries(state).forEach(([userId, presences]) => {
          const presenceArray = presences as unknown as PresenceData[];
          presenceArray.forEach((p: PresenceData) => {
            if (p.editing_todo_id) {
              editingState[p.editing_todo_id] = userId;
            }
          });
        });
        setEditingTodos(editingState);
      })
      .on("presence", { event: "join" }, () => {
        // 편집 상태 업데이트
        const state = todosChannel.presenceState();
        const editingState: Record<string, string> = {};
        Object.entries(state).forEach(([userId, presences]) => {
          const presenceArray = presences as unknown as PresenceData[];
          presenceArray.forEach((p: PresenceData) => {
            if (p.editing_todo_id) {
              editingState[p.editing_todo_id] = userId;
            }
          });
        });
        setEditingTodos(editingState);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        // 편집 상태에서 제거
        setEditingTodos((prev) => {
          const editingState = { ...prev };
          const presenceArray = leftPresences as unknown as PresenceData[];
          presenceArray.forEach((p: PresenceData) => {
            if (p.editing_todo_id) {
              delete editingState[p.editing_todo_id];
            }
          });
          return editingState;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && currentUserId) {
          // 내 접속 상태 전송 (이메일 포함)
          await todosChannel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
            email: userEmail || undefined,
          });
        }
      });

    interface PresenceData {
      user_id?: string;
      online_at?: string;
      editing_todo_id?: string | null;
      email?: string;
      [key: string]: unknown;
    }

    return () => {
      supabase.removeChannel(todosChannel);
    };
  }, [currentUserId, userEmail]);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || null);
      setCurrentUserId(user.id);
      // 이메일 매핑 저장
      setUserEmails((prev) => ({ ...prev, [user.id]: user.email || "" }));
    }
  };

  const fetchTodos = async () => {
    try {
      // 모든 사용자의 할일을 가져옴 (협업 기능)
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) throw error;
      if (data) {
        const profilesMap: Record<string, Profile> = {};
        data.forEach((profile) => {
          profilesMap[profile.user_id] = profile;
        });
        console.log("profilesMap", profilesMap);
        setProfiles(profilesMap);
      }

      // Presence를 통해 이메일 정보를 가져오므로 별도 조회 불필요
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleAdd = async (title: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("todos").insert({
      title,
      user_id: user.id,
      status: "todo",
      completed: false,
    });

    if (error) {
      console.error("Error adding todo:", error);
      throw error;
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("todos")
      .update({ status, completed: status === "done" })
      .eq("todo_id", id);

    if (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("todo_id", id);

    if (error) {
      console.error("Error deleting:", error);
      throw error;
    }
  };

  const handleUploadImage = async (id: string, file: File) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 파일명 생성
    const fileExt = file.name.split(".").pop();
    const fileName = `${id}-${Math.random()}.${fileExt}`;
    const filePath = `todos/${fileName}`;

    // Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from("todo-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw uploadError;
    }

    // Public URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from("todo-images").getPublicUrl(filePath);

    // 할일 업데이트
    const { error: updateError } = await supabase
      .from("todos")
      .update({ image_url: publicUrl })
      .eq("todo_id", id);

    if (updateError) {
      console.error("Error updating todo with image:", updateError);
      throw updateError;
    }
  };

  const handleGenerateAIDescription = async (id: string, title: string) => {
    try {
      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke(
        "generate-todo-description",
        {
          body: { title },
        }
      );

      if (error) {
        console.error("Error calling AI function:", error);
        throw error;
      }

      // 생성된 설명으로 할일 업데이트
      const { error: updateError } = await supabase
        .from("todos")
        .update({ description: data.description })
        .eq("todo_id", id);

      if (updateError) {
        console.error("Error updating todo with AI description:", updateError);
        throw updateError;
      }
    } catch (error) {
      console.error("Error generating AI description:", error);
      throw error;
    }
  };

  const handleStartEditing = (todoId: string) => {
    if (!currentUserId) return;

    const presenceChannel = supabase.channel("todos_channel");
    presenceChannel.track({
      user_id: currentUserId,
      online_at: new Date().toISOString(),
      editing_todo_id: todoId,
      email: userEmail || undefined,
    });
    // 편집 상태 즉시 업데이트
    setEditingTodos((prev) => ({ ...prev, [todoId]: currentUserId }));
  };

  const handleStopEditing = () => {
    if (!currentUserId) return;

    const presenceChannel = supabase.channel("todos_channel");
    presenceChannel.track({
      user_id: currentUserId,
      online_at: new Date().toISOString(),
      editing_todo_id: null,
      email: userEmail || undefined,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="app-title">협업 칸반보드</h1>
        <div className="user-info">
          {currentUserId && (
            <div className="user-avatar-wrapper">
              {profiles[currentUserId]?.avatar_url ? (
                <img
                  src={profiles[currentUserId].avatar_url}
                  alt={
                    profiles[currentUserId]?.full_name ||
                    profiles[currentUserId]?.username ||
                    userEmail ||
                    "User"
                  }
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {(
                    profiles[currentUserId]?.full_name ||
                    profiles[currentUserId]?.username ||
                    userEmail ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>
          )}
          <span className="user-email">{userEmail}</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            <LogOut className="icon-logout" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="home-main">
        <Dashboard todos={todos} />
        <OnlineUsers
          onlineUsers={onlineUsers}
          profiles={profiles}
          currentUserId={currentUserId}
          userEmails={userEmails}
        />
        <KanbanBoard
          todos={todos}
          profiles={profiles}
          loading={loading}
          currentUserId={currentUserId}
          onlineUsers={onlineUsers}
          editingTodos={editingTodos}
          userEmails={userEmails}
          onAdd={handleAdd}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          onUploadImage={handleUploadImage}
          onGenerateAIDescription={handleGenerateAIDescription}
          onStartEditing={handleStartEditing}
          onStopEditing={handleStopEditing}
        />
      </main>
    </div>
  );
}
