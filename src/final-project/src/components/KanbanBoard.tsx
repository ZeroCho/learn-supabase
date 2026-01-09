import { useState } from "react";
import type { Database } from "../types/database";
import {
  Plus,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  X,
  User,
} from "lucide-react";
import "./KanbanBoard.css";

type Todo = Database["public"]["Tables"]["todos"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface KanbanBoardProps {
  todos: Todo[];
  profiles: Record<string, Profile>;
  loading: boolean;
  currentUserId: string;
  onlineUsers: Record<
    string,
    Array<{ user_id: string; online_at: string; email?: string }>
  >;
  editingTodos: Record<string, string>; // todo_id -> user_id
  userEmails: Record<string, string>;
  onAdd: (title: string) => Promise<void>;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUploadImage: (id: string, file: File) => Promise<void>;
  onGenerateAIDescription: (id: string, title: string) => Promise<void>;
  onStartEditing: (todoId: string) => void;
  onStopEditing: (todoId: string) => void;
}

const STATUSES = [
  { id: "todo", label: "할 일", color: "#3b82f6" },
  { id: "in_progress", label: "진행 중", color: "#f59e0b" },
  { id: "done", label: "완료", color: "#10b981" },
];

export default function KanbanBoard({
  todos,
  profiles,
  loading,
  currentUserId,
  editingTodos,
  onlineUsers,
  userEmails,
  onAdd,
  onUpdateStatus,
  onDelete,
  onUploadImage,
  onGenerateAIDescription,
  onStartEditing,
  onStopEditing,
}: KanbanBoardProps) {
  const [newTodo, setNewTodo] = useState("");
  const [adding, setAdding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setAdding(true);
    try {
      await onAdd(newTodo);
      setNewTodo("");
    } finally {
      setAdding(false);
    }
  };

  const handleImageUpload = async (
    todoId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(todoId);
    try {
      await onUploadImage(todoId, file);
    } finally {
      setUploadingImage(null);
      e.target.value = "";
    }
  };

  const handleGenerateAI = async (todoId: string, title: string) => {
    setGeneratingAI(todoId);
    try {
      await onGenerateAIDescription(todoId, title);
    } finally {
      setGeneratingAI(null);
    }
  };

  const getTodosByStatus = (status: string) => {
    return todos.filter((todo) => (todo.status || "todo") === status);
  };

  const getAvatarUrl = (userId: string) => {
    const profile = profiles[userId];
    return profile?.avatar_url || null;
  };

  const getUserName = (userId: string) => {
    const profile = profiles[userId];
    if (profile?.full_name) return profile.full_name;
    if (profile?.username) return profile.username;

    // onlineUsers에서 이메일 찾기
    const userPresences = onlineUsers[userId];
    if (userPresences && userPresences.length > 0 && userPresences[0].email) {
      return userPresences[0].email;
    }

    // userEmails에서 찾기
    if (userEmails[userId]) return userEmails[userId];

    return "Unknown";
  };

  if (loading) {
    return (
      <div className="kanban-loading">
        <Loader2 className="spinner" />
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <h2 className="kanban-title">협업 칸반보드</h2>
        <form onSubmit={handleAdd} className="kanban-add-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새 할일 추가..."
            className="kanban-add-input"
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding || !newTodo.trim()}
            className="kanban-add-btn"
          >
            {adding ? <Loader2 className="spinner" /> : <Plus />}
          </button>
        </form>
      </div>

      <div className="kanban-columns">
        {STATUSES.map((status) => (
          <div key={status.id} className="kanban-column">
            <div
              className="kanban-column-header"
              style={{ borderTopColor: status.color }}
            >
              <h3 className="kanban-column-title">{status.label}</h3>
              <span className="kanban-column-count">
                {getTodosByStatus(status.id).length}
              </span>
            </div>
            <div className="kanban-column-content">
              {getTodosByStatus(status.id).map((todo) => {
                const editingUserId = editingTodos[todo.todo_id];
                const isBeingEdited =
                  editingUserId && editingUserId !== currentUserId;
                const editingUserName = editingUserId
                  ? getUserName(editingUserId)
                  : "";

                return (
                  <div
                    key={todo.todo_id}
                    className={`kanban-card ${isBeingEdited ? "editing" : ""}`}
                    onMouseEnter={() => onStartEditing(todo.todo_id)}
                    onMouseLeave={() => onStopEditing(todo.todo_id)}
                  >
                    <div className="kanban-card-header">
                      <div className="kanban-card-user">
                        <User className="kanban-user-icon" />
                        <span className="kanban-user-name">
                          {getUserName(todo.user_id)}
                          {todo.user_id === currentUserId && " (나)"}
                        </span>
                      </div>
                      <button
                        onClick={() => onDelete(todo.todo_id)}
                        className="kanban-card-delete"
                      >
                        <X className="kanban-icon-small" />
                      </button>
                    </div>

                    {isBeingEdited && (
                      <div className="kanban-card-editing">
                        {getAvatarUrl(editingUserId) ? (
                          <img
                            src={getAvatarUrl(editingUserId)!}
                            alt={editingUserName}
                            className="kanban-editing-avatar"
                          />
                        ) : (
                          <div className="kanban-editing-avatar-placeholder">
                            {editingUserName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="kanban-editing-text">
                          {editingUserName}님이 편집 중...
                        </span>
                      </div>
                    )}

                    <h4 className="kanban-card-title">{todo.title}</h4>

                    {todo.image_url && (
                      <div className="kanban-card-image">
                        <img src={todo.image_url} alt={todo.title} />
                      </div>
                    )}

                    {todo.description && (
                      <div className="kanban-card-ai">
                        <Sparkles className="kanban-icon-small" />
                        <p className="kanban-card-ai-text">
                          {todo.description}
                        </p>
                      </div>
                    )}

                    {todo.description && !todo.description && (
                      <p className="kanban-card-description">
                        {todo.description}
                      </p>
                    )}

                    <div className="kanban-card-actions">
                      <label className="kanban-action-btn">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(todo.todo_id, e)}
                          style={{ display: "none" }}
                          disabled={uploadingImage === todo.todo_id}
                        />
                        {uploadingImage === todo.todo_id ? (
                          <Loader2 className="spinner" />
                        ) : (
                          <ImageIcon className="kanban-icon-small" />
                        )}
                      </label>

                      {!todo.description && (
                        <button
                          onClick={() =>
                            handleGenerateAI(todo.todo_id, todo.title)
                          }
                          className="kanban-action-btn"
                          disabled={generatingAI === todo.todo_id}
                        >
                          {generatingAI === todo.todo_id ? (
                            <Loader2 className="spinner" />
                          ) : (
                            <Sparkles className="kanban-icon-small" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="kanban-card-status">
                      {STATUSES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onUpdateStatus(todo.todo_id, s.id)}
                          className={`kanban-status-btn ${
                            (todo.status || "todo") === s.id ? "active" : ""
                          }`}
                          style={{
                            backgroundColor:
                              (todo.status || "todo") === s.id
                                ? s.color
                                : "transparent",
                            color:
                              (todo.status || "todo") === s.id
                                ? "white"
                                : s.color,
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {getTodosByStatus(status.id).length === 0 && (
                <div className="kanban-empty">할일이 없습니다</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
