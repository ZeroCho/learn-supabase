import { Users } from "lucide-react";
import type { Database } from "../types/database";
import "./OnlineUsers.css";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface OnlineUser {
  user_id: string;
  online_at: string;
  email?: string;
}

interface OnlineUsersProps {
  onlineUsers: Record<string, OnlineUser[]>;
  profiles: Record<string, Profile>;
  currentUserId: string;
  userEmails: Record<string, string>;
}

export default function OnlineUsers({
  onlineUsers,
  profiles,
  currentUserId,
  userEmails,
}: OnlineUsersProps) {
  const getAvatarUrl = (userId: string) => {
    const profile = profiles[userId];
    return profile?.avatar_url || null;
  };

  const getUserName = (userId: string, email?: string) => {
    const profile = profiles[userId];
    if (profile?.full_name) return profile.full_name;
    if (profile?.username) return profile.username;
    if (email) return email;
    if (userEmails[userId]) return userEmails[userId];
    return "Unknown";
  };

  // 모든 접속 중인 사용자 추출
  const allOnlineUsers: Array<{
    userId: string;
    onlineAt: string;
    email?: string;
  }> = [];
  Object.entries(onlineUsers).forEach(([userId, presences]) => {
    presences.forEach((presence) => {
      if (!allOnlineUsers.find((u) => u.userId === userId)) {
        allOnlineUsers.push({
          userId,
          onlineAt: presence.online_at,
          email: presence.email,
        });
      }
    });
  });

  return (
    <div className="online-users-container">
      <div className="online-users-header">
        <Users className="online-users-icon" />
        <span className="online-users-title">
          접속 중 ({allOnlineUsers.length})
        </span>
      </div>
      <div className="online-users-list">
        {allOnlineUsers.map(({ userId, email }) => {
          const avatarUrl = getAvatarUrl(userId);
          return (
            <div
              key={userId}
              className={`online-user-item ${
                userId === currentUserId ? "current-user" : ""
              }`}
              title={getUserName(userId, email)}
            >
              {avatarUrl ? (
                <div className="online-user-avatar-wrapper">
                  <img
                    src={avatarUrl}
                    alt={getUserName(userId, email)}
                    className="online-user-avatar"
                  />
                  <div className="online-user-indicator-avatar" />
                </div>
              ) : (
                <div className="online-user-avatar-placeholder">
                  {getUserName(userId, email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
        {allOnlineUsers.length === 0 && (
          <div className="online-users-empty">접속 중인 사용자가 없습니다</div>
        )}
      </div>
    </div>
  );
}
