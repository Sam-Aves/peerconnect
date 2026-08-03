import { useEffect, useState, useCallback } from "react";
import {
  Home, LogOut, Search, Heart, MessageCircle,
  Share2, Edit2, X, Bookmark, Bell, Award, Trash2
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// ─── HOMEPAGE COLOR THEME ───
const C = {
  board: "#021a12",
  boardFelt: "#042C1F",
  boardMid: "#063322",
  green: "#2a7a4b",
  greenDark: "#1d5c37",
  greenLight: "rgba(42,122,75,0.13)",
  greenGlow: "rgba(42,122,75,0.28)",
  accent: "#34d399",
  accentDim: "rgba(52,211,153,0.14)",
  glass: "rgba(4,44,31,0.55)",
  glassBorder: "rgba(52,211,153,0.18)",
  glassStrong: "rgba(2,26,18,0.75)",
  ink: "#1a2e1e",
  inkMid: "#3a5842",
  inkLight: "#6a8e73",
  inkFaint: "#a6c2ab",
  onBoard: "#c4e4cd",
  onBoardMid: "#78a888",
  onBoardFaint: "#3a6647",
  error: "#dc2626",
  success: "#16a34a",
};

const CATEGORIES = [
  { value: "housing", label: "🏠 Housing" },
  { value: "transport", label: "🚌 Transport" },
  { value: "study", label: "📚 Study" },
  { value: "emergency", label: "🚨 Emergency" },
  { value: "campus", label: "🏛️ Campus" },
  { value: "food", label: "🍽️ Food" },
  { value: "other", label: "📌 Other" },
];

const POST_TYPES = [
  { value: "seeking", label: "🙋 Seeking Help" },
  { value: "helping", label: "🤝 Offering Help" },
  { value: "both", label: "🔄 Both" },
];

// ─── UTILITY FUNCTIONS ───

function getStoredUser() {
  try {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem("token") || null;
}

function initials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getCategoryLabel(value) {
  return CATEGORIES.find(c => c.value === value)?.label || value;
}

function getTypeLabel(value) {
  return POST_TYPES.find(t => t.value === value)?.label || value;
}

// ─── COMPONENTS ───

function Avatar({ name, size = 42 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.green}, ${C.accent})`,
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: size * 0.38,
      flexShrink: 0,
      border: `2px solid ${C.glassBorder}`,
    }}>
      {initials(name)}
    </div>
  );
}

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: C.glass,
      backdropFilter: "blur(12px)",
      border: `1px solid ${C.glassBorder}`,
      borderRadius: "16px",
      padding: "20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      ...style
    }}>
      {children}
    </div>
  );
}

function Badge({ type }) {
  const isHelping = type === "helping" || type === "both";
  const colors = isHelping 
    ? { bg: "rgba(52,211,153,0.15)", color: C.accent, border: "rgba(52,211,153,0.25)" }
    : { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.25)" };
  
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 700,
      color: colors.color,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
    }}>
      {getTypeLabel(type)}
    </span>
  );
}
// ─── NOTIFICATION BELL COMPONENT ───
function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = getStoredToken();

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) fetchNotifications();
        }}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          color: C.onBoardFaint,
          position: "relative",
          padding: "6px",
          borderRadius: "50%",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.background = C.glass)}
        onMouseLeave={(e) => (e.target.style.background = "transparent")}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              width: "16px",
              height: "16px",
              background: C.error,
              color: "white",
              fontSize: "9px",
              fontWeight: 700,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "36px",
            right: "0",
            width: "320px",
            maxHeight: "400px",
            overflowY: "auto",
            background: C.boardFelt,
            border: `1px solid ${C.glassBorder}`,
            borderRadius: "12px",
            padding: "12px 0",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 16px 8px",
              borderBottom: `1px solid ${C.glassBorder}`,
            }}
          >
            <span style={{ color: C.onBoard, fontWeight: 700 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  color: C.accent,
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: C.onBoardFaint,
                fontSize: "13px",
              }}
            >
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => markAsRead(n._id)}
                style={{
                  padding: "10px 16px",
                  borderBottom: `1px solid ${C.glassBorder}`,
                  background: n.read ? "transparent" : "rgba(52,211,153,0.08)",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = C.glass)}
                onMouseLeave={(e) => {
                  if (!n.read) e.target.style.background = "rgba(52,211,153,0.08)";
                  else e.target.style.background = "transparent";
                }}
              >
                <div style={{ color: C.onBoard, fontSize: "13px" }}>
                  {n.message}
                </div>
                <div style={{ color: C.onBoardFaint, fontSize: "10px", marginTop: "2px" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </div>
                {!n.read && (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      background: C.accent,
                      borderRadius: "50%",
                      display: "inline-block",
                      marginLeft: "8px",
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── NAVBAR ───

function FeedNavbar({ user, onLogout, onHome }) {
  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "16px 40px",
      background: "rgba(2,26,18,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${C.glassBorder}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "1.4rem",
          color: C.onBoard,
          margin: 0,
          letterSpacing: "-0.5px"
        }}>
          Peer<span style={{ color: C.accent }}>Connect</span>
        </h2>
        <span style={{
          fontSize: "10px",
          fontWeight: 700,
          color: C.onBoardFaint,
          background: C.glass,
          padding: "2px 12px",
          borderRadius: "999px",
          border: `1px solid ${C.glassBorder}`,
        }}>
          Feed
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <NotificationBell user={user} />
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar name={user?.name} size={34} />
          <span style={{
            fontSize: "13px",
            fontWeight: 600,
            color: C.onBoard,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {user?.name?.split(" ")[0] || "Student"}
          </span>
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: "8px 18px",
            borderRadius: "999px",
            border: `1px solid ${C.glassBorder}`,
            background: "transparent",
            color: C.onBoardFaint,
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(220,38,38,0.15)";
            e.target.style.borderColor = "rgba(220,38,38,0.3)";
            e.target.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.borderColor = C.glassBorder;
            e.target.style.color = C.onBoardFaint;
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// ─── PROFILE SIDEBAR ───

function ProfileSidebar({ user, onEditProfile, onLogout, onHome }) {
  return (
    <GlassCard style={{ position: "sticky", top: "90px" }}>
      <div style={{ textAlign: "center" }}>
        <Avatar name={user?.name} size={72} />
        <h3 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "1.1rem",
          color: C.onBoard,
          margin: "12px 0 4px",
        }}>
          {user?.name || "Student"}
        </h3>
        <p style={{
          fontSize: "12px",
          color: C.onBoardMid,
          fontFamily: "'DM Sans', sans-serif",
          margin: 0,
        }}>
          {user?.university || "University"}
        </p>
        <p style={{
          fontSize: "12px",
          color: C.onBoardFaint,
          fontFamily: "'DM Sans', sans-serif",
          margin: "2px 0 0",
        }}>
          📍 {user?.district || "District"}
        </p>
        {user?.role && (
          <div style={{ marginTop: 8 }}>
            <Badge type={user.role} />
          </div>
        )}
      </div>

      <div style={{
        margin: "14px 0",
        padding: "12px 0",
        borderTop: `1px solid ${C.glassBorder}`,
        borderBottom: `1px solid ${C.glassBorder}`,
      }}>
        <p style={{
          fontSize: "12px",
          color: C.onBoardMid,
          lineHeight: 1.6,
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {user?.bio || "No bio yet — tell the community a bit about yourself."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
        <div style={{
          textAlign: "center",
          padding: "8px",
          background: C.glass,
          borderRadius: "8px",
          border: `1px solid ${C.glassBorder}`,
        }}>
          <div style={{ fontWeight: 700, color: C.accent, fontFamily: "'Fraunces', serif" }}>42</div>
          <div style={{ fontSize: "10px", color: C.onBoardFaint, fontFamily: "'DM Sans', sans-serif" }}>Posts</div>
        </div>
        <div style={{
          textAlign: "center",
          padding: "8px",
          background: C.glass,
          borderRadius: "8px",
          border: `1px solid ${C.glassBorder}`,
        }}>
          <div style={{ fontWeight: 700, color: C.accent, fontFamily: "'Fraunces', serif" }}>18</div>
          <div style={{ fontSize: "10px", color: C.onBoardFaint, fontFamily: "'DM Sans', sans-serif" }}>Helps</div>
        </div>
      </div>

      <button
        onClick={onEditProfile}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: `1px solid ${C.accent}`,
          background: "transparent",
          color: C.accent,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "8px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = C.glass;
          e.target.style.boxShadow = `0 0 20px ${C.greenGlow}`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.boxShadow = "none";
        }}
      >
        <Edit2 size={14} /> Edit Profile
      </button>

      <button
        onClick={onHome}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: `1px solid ${C.glassBorder}`,
          background: "transparent",
          color: C.onBoardMid,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "4px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = C.glass;
          e.target.style.color = C.onBoard;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = C.onBoardMid;
        }}
      >
        <Home size={14} /> Homepage
      </button>
    </GlassCard>
  );
}

// ─── CREATE POST ───

function CreatePost({ user, onCreate, posting }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("seeking");
  const [category, setCategory] = useState("other");
  const [isExpanded, setIsExpanded] = useState(false);

  const submit = () => {
    if (!content.trim()) return;
    onCreate({ content: content.trim(), type, category });
    setContent("");
    setType("seeking");
    setCategory("other");
    setIsExpanded(false);
  };

  return (
    <GlassCard>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <Avatar name={user?.name} size={40} />
        <div style={{ flex: 1 }}>
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "999px",
              border: `1px solid ${C.glassBorder}`,
              background: C.glass,
              textAlign: "left",
              color: C.onBoardMid,
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = C.accent;
              e.target.style.background = C.glassStrong;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = C.glassBorder;
              e.target.style.background = C.glass;
            }}
          >
            {isExpanded ? "Write something..." : `What's on your mind, ${user?.name?.split(" ")[0] || "Student"}?`}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: "14px" }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, ask for help, or offer support..."
            rows={4}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: `1px solid ${C.glassBorder}`,
              background: C.glass,
              color: C.onBoard,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = C.accent;
              e.target.style.boxShadow = `0 0 20px ${C.greenGlow}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = C.glassBorder;
              e.target.style.boxShadow = "none";
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {POST_TYPES.map(opt => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "999px",
                  border: `1.5px solid ${type === opt.value ? C.accent : C.glassBorder}`,
                  background: type === opt.value ? C.glass : "transparent",
                  color: type === opt.value ? C.accent : C.onBoardMid,
                  fontWeight: type === opt.value ? 700 : 500,
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "999px",
                  border: `1px solid ${category === cat.value ? C.accent : "transparent"}`,
                  background: category === cat.value ? C.glass : "transparent",
                  color: category === cat.value ? C.accent : C.onBoardFaint,
                  fontSize: "11px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
            <button
              onClick={() => {
                setIsExpanded(false);
                setContent("");
              }}
              style={{
                padding: "8px 20px",
                borderRadius: "8px",
                border: `1px solid ${C.glassBorder}`,
                background: "transparent",
                cursor: "pointer",
                fontWeight: 600,
                color: C.onBoardMid,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.glass;
                e.target.style.color = C.onBoard;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = C.onBoardMid;
              }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!content.trim() || posting}
              style={{
                padding: "8px 24px",
                borderRadius: "8px",
                border: "none",
                background: C.green,
                color: "white",
                fontWeight: 700,
                cursor: !content.trim() || posting ? "default" : "pointer",
                opacity: !content.trim() || posting ? 0.5 : 1,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                transition: "all 0.2s",
                boxShadow: !content.trim() || posting ? "none" : `0 4px 20px ${C.greenGlow}`,
              }}
              onMouseEnter={(e) => {
                if (!content.trim() || posting) return;
                e.target.style.background = C.greenDark;
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (!content.trim() || posting) return;
                e.target.style.background = C.green;
                e.target.style.transform = "translateY(0)";
              }}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ─── POST CARD ───

function PostCard({ post, currentUser, onAddComment, onToggleLike, onToggleSave, onDeletePost, onDeleteComment }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(post.savedByMe || false);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onAddComment(post.id, commentText.trim());
    setCommentText("");
    setSubmitting(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDeletePost(post.id);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    onToggleLike(post.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    onToggleSave(post.id);
  };

  return (
    <GlassCard>
      {/* Header */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "12px" }}>
          <Avatar name={post.authorName} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h4 style={{
                color: C.onBoard,
                margin: 0,
                fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
              }}>
                {post.authorName}
              </h4>
              <span style={{
                color: C.onBoardFaint,
                fontSize: "11px",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                • {timeAgo(post.createdAt)}
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              <Badge type={post.type} />
              {post.category && (
                <span style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: C.onBoardFaint,
                  background: C.glass,
                  border: `1px solid ${C.glassBorder}`,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {getCategoryLabel(post.category)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          style={{
            background: "transparent",
            border: "none",
            color: C.error,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "6px",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.background = "rgba(220,38,38,0.15)"}
          onMouseLeave={(e) => e.target.style.background = "transparent"}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>

      {/* Content */}
      <p style={{
        color: C.onBoard,
        lineHeight: 1.7,
        margin: "12px 0 0",
        whiteSpace: "pre-wrap",
        fontSize: "14px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {post.content}
      </p>

      {/* Actions */}
      <div style={{
        display: "flex",
        gap: "4px",
        marginTop: "14px",
        paddingTop: "12px",
        borderTop: `1px solid ${C.glassBorder}`,
      }}>
        <button
          onClick={handleLike}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: liked ? C.accent : C.onBoardFaint,
            fontWeight: 600,
            fontSize: "12px",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!liked) e.target.style.color = C.onBoardMid;
            e.target.style.background = C.glass;
          }}
          onMouseLeave={(e) => {
            if (!liked) e.target.style.color = C.onBoardFaint;
            e.target.style.background = "transparent";
          }}
        >
          {liked ? <Heart size={14} fill={C.accent} color={C.accent} /> : <Heart size={14} />}
          {likesCount}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: C.onBoardFaint,
            fontWeight: 600,
            fontSize: "12px",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = C.onBoardMid;
            e.target.style.background = C.glass;
          }}
          onMouseLeave={(e) => {
            e.target.style.color = C.onBoardFaint;
            e.target.style.background = "transparent";
          }}
        >
          <MessageCircle size={14} />
          {post.comments?.length || 0}
        </button>

        <button
          onClick={handleSave}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: saved ? C.accent : C.onBoardFaint,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = C.glass;
            e.target.style.color = saved ? C.accent : C.onBoardMid;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = saved ? C.accent : C.onBoardFaint;
          }}
        >
          <Bookmark size={14} fill={saved ? C.accent : "none"} />
        </button>

        <button
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: C.onBoardFaint,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = C.glass;
            e.target.style.color = C.onBoardMid;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = C.onBoardFaint;
          }}
        >
          <Share2 size={14} />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: `1px solid ${C.glassBorder}` }}>
          {(post.comments || []).map(c => (
            <div key={c.id} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <Avatar name={c.authorName} size={28} />
              <div style={{
                background: C.glass,
                borderRadius: "12px",
                padding: "8px 14px",
                flex: 1,
                border: `1px solid ${C.glassBorder}`,
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "12px", color: C.onBoard, fontFamily: "'DM Sans', sans-serif" }}>{c.authorName}</strong>
                    <span style={{ fontSize: "10px", color: C.onBoardFaint, marginLeft: "8px", fontFamily: "'DM Sans', sans-serif" }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this comment?')) {
                        onDeleteComment(post.id, c.id);
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: C.onBoardFaint,
                      cursor: "pointer",
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = C.error;
                      e.target.style.background = "rgba(220,38,38,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = C.onBoardFaint;
                      e.target.style.background = "transparent";
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: C.onBoardMid, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap" }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
            <Avatar name={currentUser?.name} size={28} />
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Write a comment..."
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: "999px",
                border: `1px solid ${C.glassBorder}`,
                background: C.glass,
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                color: C.onBoard,
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = C.accent;
                e.target.style.boxShadow = `0 0 16px ${C.greenGlow}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.glassBorder;
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim() || submitting}
              style={{
                border: "none",
                background: "none",
                color: C.accent,
                fontWeight: 700,
                fontSize: "13px",
                cursor: !commentText.trim() || submitting ? "default" : "pointer",
                opacity: !commentText.trim() || submitting ? 0.4 : 1,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
// ─── USER SEARCH SIDEBAR (NEW) ───

// ─── USER SEARCH SIDEBAR ───

function UserSearchSidebar({ onUserSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    district: "all",
    university: "all",
    role: "all"
  });
  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    universities: []
  });
  const [showSearch, setShowSearch] = useState(true); // ← ডিফল্ট true (খোলা থাকবে)
  const token = getStoredToken();

  // ─── GET ALL USERS (ডিফল্ট) ───
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.district !== "all") params.append("district", filters.district);
      if (filters.university !== "all") params.append("university", filters.university);
      if (filters.role !== "all") params.append("role", filters.role);
      
      const res = await fetch(`${API_BASE}/users?${params}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) throw new Error("Failed to fetch users");
      
      const data = await res.json();
      setUsers(data.users || []);
      
      if (data.filters) {
        setFilterOptions({
          districts: data.filters.districts || [],
          universities: data.filters.universities || []
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, filters]);

  // ─── INITIAL LOAD (পেজ লোড হলে সব user দেখাবে) ───
  useEffect(() => {
    fetchUsers();
  }, []);

  // ─── FILTER বা SEARCH CHANGE হলে আবার fetch ───
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // 300ms delay (search এর জন্য)
    
    return () => clearTimeout(timer);
  }, [searchQuery, filters.district, filters.university, filters.role]);

  return (
    <GlassCard style={{ position: "sticky", top: "90px", marginBottom: "16px" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "12px"
      }}>
        <h4 style={{
          color: C.onBoard,
          margin: 0,
          fontFamily: "'Fraunces', serif",
          fontSize: "1rem",
        }}>
          👥 Find Students
          <span style={{
            fontSize: "10px",
            color: C.onBoardFaint,
            fontWeight: 400,
            marginLeft: "6px",
          }}>
            ({users.length})
          </span>
        </h4>
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            padding: "4px 12px",
            borderRadius: "999px",
            border: `1px solid ${C.glassBorder}`,
            background: C.glass,
            color: C.onBoardMid,
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = C.glassStrong;
            e.target.style.color = C.onBoard;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = C.glass;
            e.target.style.color = C.onBoardMid;
          }}
        >
          {showSearch ? "✕ Close" : "🔍 Open"}
        </button>
      </div>

      {showSearch && (
        <>
          {/* ─── SEARCH BY NAME/EMAIL ─── */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: C.glass,
              borderRadius: "10px",
              padding: "6px 12px",
              border: `1px solid ${C.glassBorder}`,
              transition: "all 0.2s",
            }}>
              <Search size={14} color={C.onBoardFaint} />
              <input
                type="text"
                placeholder="Search by name, email, university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "12px",
                  fontFamily: "'DM Sans', sans-serif",
                  color: C.onBoard,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: C.onBoardFaint,
                    padding: "2px",
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* ─── DISTRICT FILTER ─── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
            <div>
              <label style={{
                fontSize: "10px",
                fontWeight: 700,
                color: C.onBoardFaint,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "2px",
              }}>
                District
              </label>
              <select
                value={filters.district}
                onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: `1px solid ${C.glassBorder}`,
                  background: C.glass,
                  color: C.onBoard,
                  fontSize: "11px",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              >
                <option value="all">All Districts</option>
                {filterOptions.districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* ─── UNIVERSITY FILTER ─── */}
            <div>
              <label style={{
                fontSize: "10px",
                fontWeight: 700,
                color: C.onBoardFaint,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "block",
                marginBottom: "2px",
              }}>
                University
              </label>
              <select
                value={filters.university}
                onChange={(e) => setFilters(prev => ({ ...prev, university: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: `1px solid ${C.glassBorder}`,
                  background: C.glass,
                  color: C.onBoard,
                  fontSize: "11px",
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                }}
              >
                <option value="all">All Universities</option>
                {filterOptions.universities.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── ROLE FILTER ─── */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{
              fontSize: "10px",
              fontWeight: 700,
              color: C.onBoardFaint,
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "block",
              marginBottom: "2px",
            }}>
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              style={{
                width: "100%",
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${C.glassBorder}`,
                background: C.glass,
                color: C.onBoard,
                fontSize: "11px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            >
              <option value="all">All Roles</option>
              <option value="seeker">🙋 Seeker</option>
              <option value="helper">🤝 Helper</option>
              <option value="both">🔄 Both</option>
            </select>
          </div>

          {/* ─── USERS LIST ─── */}
          {loading ? (
            <div style={{
              textAlign: "center",
              padding: "20px",
              color: C.onBoardFaint,
              fontSize: "12px",
            }}>
              Loading users...
            </div>
          ) : users.length > 0 ? (
            <div style={{
              marginTop: "10px",
              maxHeight: "350px",
              overflowY: "auto",
              borderTop: `1px solid ${C.glassBorder}`,
              paddingTop: "10px",
            }}>
              {users.map(user => (
                <div
                  key={user._id}
                  onClick={() => onUserSelect && onUserSelect(user)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderBottom: `1px solid ${C.glassBorder}`,
                  }}
                  onMouseEnter={(e) => e.target.style.background = C.glass}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                >
                  <Avatar name={user.name} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: C.onBoard,
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      color: C.onBoardFaint,
                      fontSize: "10px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {user.university} • {user.district}
                    </div>
                  </div>
                  <Badge type={user.role} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "20px",
              color: C.onBoardFaint,
              fontSize: "12px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              No users found
            </div>
          )}

          {/* ─── TOTAL COUNT ─── */}
          {users.length > 0 && (
            <div style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: `1px solid ${C.glassBorder}`,
              textAlign: "center",
              color: C.onBoardFaint,
              fontSize: "10px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Showing {users.length} student{users.length > 1 ? 's' : ''}
            </div>
          )}
        </>
      )}
    </GlassCard>
  );
}

// ─── RIGHT SIDEBAR ───

function SuggestionsSidebar({ onFilter, activeFilter, onSearch }) {
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <GlassCard style={{ position: "sticky", top: "90px" }}>
      <h4 style={{
        color: C.onBoard,
        margin: "0 0 16px",
        fontFamily: "'Fraunces', serif",
        fontSize: "1.1rem",
      }}>
        🔍 Filter Feed
      </h4>

      <div style={{ marginBottom: "16px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: C.glass,
          borderRadius: "10px",
          padding: "8px 12px",
          border: `1px solid ${C.glassBorder}`,
          transition: "all 0.2s",
        }}>
          <Search size={16} color={C.onBoardFaint} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "12px",
              fontFamily: "'DM Sans', sans-serif",
              color: C.onBoard,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                onSearch("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.onBoardFaint,
                padding: "2px",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 700,
          color: C.onBoardFaint,
          fontFamily: "'DM Sans', sans-serif",
          margin: "0 0 6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Post Type
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {["all", ...POST_TYPES.map(t => t.value)].map(type => (
            <button
              key={type}
              onClick={() => handleFilter("type", type)}
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                border: `1.5px solid ${filters.type === type ? C.accent : C.glassBorder}`,
                background: filters.type === type ? C.glass : "transparent",
                color: filters.type === type ? C.accent : C.onBoardFaint,
                fontSize: "11px",
                fontWeight: filters.type === type ? 700 : 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {type === "all" ? "All" : getTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{
          fontSize: "11px",
          fontWeight: 700,
          color: C.onBoardFaint,
          fontFamily: "'DM Sans', sans-serif",
          margin: "0 0 6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Category
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {["all", ...CATEGORIES.map(c => c.value)].map(cat => (
            <button
              key={cat}
              onClick={() => handleFilter("category", cat)}
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                border: `1.5px solid ${filters.category === cat ? C.accent : C.glassBorder}`,
                background: filters.category === cat ? C.glass : "transparent",
                color: filters.category === cat ? C.accent : C.onBoardFaint,
                fontSize: "11px",
                fontWeight: filters.category === cat ? 700 : 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {cat === "all" ? "All" : getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${C.glassBorder}` }}>
        <p style={{
          fontSize: "11px",
          fontWeight: 700,
          color: C.onBoardFaint,
          fontFamily: "'DM Sans', sans-serif",
          margin: "0 0 8px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          Quick Stats
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div style={{
            background: C.glass,
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            border: `1px solid ${C.glassBorder}`,
          }}>
            <div style={{ fontWeight: 700, color: C.accent, fontFamily: "'Fraunces', serif", fontSize: "1.2rem" }}>24</div>
            <div style={{ fontSize: "10px", color: C.onBoardFaint, fontFamily: "'DM Sans', sans-serif" }}>Helpers</div>
          </div>
          <div style={{
            background: C.glass,
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            border: `1px solid ${C.glassBorder}`,
          }}>
            <div style={{ fontWeight: 700, color: "#f59e0b", fontFamily: "'Fraunces', serif", fontSize: "1.2rem" }}>18</div>
            <div style={{ fontSize: "10px", color: C.onBoardFaint, fontFamily: "'DM Sans', sans-serif" }}>Seekers</div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: "12px",
        padding: "12px",
        background: C.glass,
        borderRadius: "10px",
        border: `1px solid ${C.glassBorder}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Award size={14} color={C.accent} />
          <span style={{
            fontWeight: 700,
            fontSize: "12px",
            color: C.accent,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Top Helper
          </span>
        </div>
        <p style={{
          fontSize: "11px",
          color: C.onBoardMid,
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          🏆 {localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user"))?.name || "Someone" : "Someone"} • 34 helps
        </p>
      </div>
    </GlassCard>
  );
}

// ─── EDIT PROFILE MODAL ───

function EditProfileModal({ user, onClose, onUpdate }) {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name can't be empty");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), district: district.trim() }),
      });
      
      if (!res.ok) throw new Error("Failed to update");
      
      const data = await res.json();
      const updated = data.user || { ...user, name: name.trim(), bio: bio.trim(), district: district.trim() };
      localStorage.setItem("user", JSON.stringify(updated));
      onUpdate(updated);
      onClose();
    } catch {
      const updated = { ...user, name: name.trim(), bio: bio.trim(), district: district.trim() };
      localStorage.setItem("user", JSON.stringify(updated));
      onUpdate(updated);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
    }} onClick={onClose}>
      <div style={{
        background: C.boardFelt,
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "440px",
        width: "100%",
        border: `1px solid ${C.glassBorder}`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        maxHeight: "90vh",
        overflow: "auto",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{
            margin: 0,
            color: C.onBoard,
            fontFamily: "'Fraunces', serif",
            fontSize: "1.5rem",
          }}>
            Edit Profile
          </h2>
          <button onClick={onClose} style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: "4px",
            color: C.onBoardFaint,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.color = C.onBoard}
          onMouseLeave={(e) => e.target.style.color = C.onBoardFaint}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <Avatar name={name} size={72} />
        </div>

        <label style={{
          fontSize: "12px",
          fontWeight: 700,
          color: C.onBoardMid,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: `1px solid ${C.glassBorder}`,
            background: C.glass,
            marginBottom: "14px",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: C.onBoard,
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.boxShadow = `0 0 20px ${C.greenGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.glassBorder;
            e.target.style.boxShadow = "none";
          }}
        />

        <label style={{
          fontSize: "12px",
          fontWeight: 700,
          color: C.onBoardMid,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          District
        </label>
        <input
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="Your home district"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: `1px solid ${C.glassBorder}`,
            background: C.glass,
            marginBottom: "14px",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: C.onBoard,
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.boxShadow = `0 0 20px ${C.greenGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.glassBorder;
            e.target.style.boxShadow = "none";
          }}
        />

        <label style={{
          fontSize: "12px",
          fontWeight: 700,
          color: C.onBoardMid,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell the community about yourself..."
          rows={3}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: `1px solid ${C.glassBorder}`,
            background: C.glass,
            resize: "vertical",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: C.onBoard,
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.boxShadow = `0 0 20px ${C.greenGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.glassBorder;
            e.target.style.boxShadow = "none";
          }}
        />

        {error && (
          <p style={{ color: C.error, fontSize: "12px", margin: "8px 0", fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${C.glassBorder}`,
              background: "transparent",
              fontWeight: 600,
              cursor: "pointer",
              color: C.onBoardMid,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = C.glass;
              e.target.style.color = C.onBoard;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = C.onBoardMid;
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: C.green,
              color: "white",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              transition: "all 0.2s",
              boxShadow: loading ? "none" : `0 4px 20px ${C.greenGlow}`,
            }}
            onMouseEnter={(e) => {
              if (loading) return;
              e.target.style.background = C.greenDark;
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              if (loading) return;
              e.target.style.background = C.green;
              e.target.style.transform = "translateY(0)";
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───

export default function PostingPage({ onLogout, onHome }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [offline, setOffline] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({ type: "all", category: "all" });
  const [searchQuery, setSearchQuery] = useState("");

  const authorized = Boolean(token && user);

  const handleDeletePost = async (postId) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete post");
      }
      
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.message || "Failed to delete post");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!token) return;
    
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete comment");
      }
      
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, comments: p.comments.filter(c => c.id !== commentId) }
            : p
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.message || "Failed to delete comment");
    }
  };

  const loadPosts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          onLogout();
          return;
        }
        throw new Error("Request failed");
      }
      
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      setOffline(false);
    } catch (error) {
      console.error("Error loading posts:", error);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    if (authorized) {
      loadPosts();
    } else {
      setLoading(false);
    }
  }, [authorized, loadPosts]);

  const handleUserUpdate = (updated) => {
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const handleCreatePost = async ({ content, type, category }) => {
    if (!token) return;
    
    setPosting(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      authorName: user?.name || "Student",
      authorId: user?.id,
      type,
      category,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
      savedByMe: false,
      comments: [],
    };
    
    setPosts(prev => [optimistic, ...prev]);
    
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content, 
          type, 
          category,
          title: content.slice(0, 50),
          description: content 
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create post");
      }
      
      const data = await res.json();
      
      setPosts(prev => {
        const filtered = prev.filter(p => p.id !== tempId);
        const newPost = data.post || {
          id: `real-${Date.now()}`,
          authorName: user?.name || "Student",
          type,
          category,
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
          likedByMe: false,
          savedByMe: false,
          comments: []
        };
        return [newPost, ...filtered];
      });
      
    } catch (error) {
      console.error("Error creating post:", error);
      setPosts(prev => prev.filter(p => p.id !== tempId));
      alert(error.message || "Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleAddComment = async (postId, content) => {
    if (!token) return;
    
    const optimisticComment = {
      id: `local-c-${Date.now()}`,
      authorName: user?.name || "Student",
      content,
      createdAt: new Date().toISOString(),
    };
    
    setPosts(prev =>
      prev.map(p =>
        p.id === postId 
          ? { ...p, comments: [...(p.comments || []), optimisticComment] }
          : p
      )
    );
    
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      
      if (!res.ok) throw new Error("Failed to add comment");
      
      const data = await res.json();
      
      setPosts(prev =>
        prev.map(p => {
          if (p.id === postId) {
            const comments = p.comments.map(c => 
              c.id === optimisticComment.id ? data.comment || c : c
            );
            return { ...p, comments };
          }
          return p;
        })
      );
      
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!token) return;
    
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { 
              ...p, 
              likedByMe: !p.likedByMe, 
              likes: p.likes + (p.likedByMe ? -1 : 1) 
            }
          : p
      )
    );
    
    try {
      await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      loadPosts();
    }
  };

  const handleToggleSave = async (postId) => {
    if (!token) return;
    
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, savedByMe: !p.savedByMe }
          : p
      )
    );
    
    try {
      await fetch(`${API_BASE}/posts/${postId}/save`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      console.error("Error toggling save:", error);
      loadPosts();
    }
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredPosts = posts.filter(post => {
    if (filters.type !== "all" && post.type !== filters.type) return false;
    if (filters.category !== "all" && post.category !== filters.category) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const contentMatch = post.content?.toLowerCase().includes(query);
      const authorMatch = post.authorName?.toLowerCase().includes(query);
      const categoryMatch = getCategoryLabel(post.category)?.toLowerCase().includes(query);
      const typeMatch = getTypeLabel(post.type)?.toLowerCase().includes(query);
      return contentMatch || authorMatch || categoryMatch || typeMatch;
    }
    return true;
  });

  if (!authorized) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.board,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}>
        <GlassCard style={{ maxWidth: "420px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ color: C.onBoard, fontFamily: "'Fraunces', serif", marginBottom: "8px" }}>Sign in required</h2>
          <p style={{ color: C.onBoardMid, marginBottom: "20px", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
            Only verified PeerConnect members can access the feed.
          </p>
          <button
            onClick={onLogout}
            style={{
              padding: "12px 32px",
              borderRadius: "10px",
              border: "none",
              background: C.green,
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
              boxShadow: `0 4px 20px ${C.greenGlow}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = C.greenDark;
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = C.green;
              e.target.style.transform = "translateY(0)";
            }}
          >
            Go to Login
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.board,
      backgroundImage: `
        radial-gradient(ellipse at 18% 28%, rgba(42,122,75,0.1) 0%, transparent 48%),
        radial-gradient(ellipse at 82% 72%, rgba(52,211,153,0.05) 0%, transparent 42%),
        repeating-linear-gradient(0deg, transparent, transparent 38px, rgba(42,122,75,0.03) 38px, rgba(42,122,75,0.03) 39px),
        repeating-linear-gradient(90deg, transparent, transparent 38px, rgba(42,122,75,0.02) 38px, rgba(42,122,75,0.02) 39px),
        linear-gradient(155deg, #0a1c12 0%, #071510 55%, #0d2318 100%)
      `,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Navbar */}
      <FeedNavbar user={user} onLogout={onLogout} onHome={onHome} />

      {/* Offline warning */}
      {offline && (
        <div style={{
          maxWidth: "1200px",
          margin: "16px auto 0",
          padding: "0 20px",
        }}>
          <div style={{
            background: "rgba(245,158,11,0.12)",
            border: `1px solid rgba(245,158,11,0.3)`,
            color: "#f59e0b",
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ⚡ Cannot reach API server. Please make sure backend is running on port 5000.
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{
        maxWidth: "1200px",
        margin: "24px auto",
        padding: "0 20px 40px",
        display: "grid",
        gridTemplateColumns: "260px 1fr 240px",
        gap: "24px",
        alignItems: "start",
      }}>
        {/* Left: Profile */}
        <div>
          <ProfileSidebar
            user={user}
            onEditProfile={() => setShowEditModal(true)}
            onLogout={onLogout}
            onHome={onHome}
          />
        </div>

        {/* Middle: Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <CreatePost user={user} onCreate={handleCreatePost} posting={posting} />

          {loading ? (
            <GlassCard style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: C.onBoardMid, fontFamily: "'DM Sans', sans-serif" }}>Loading posts...</p>
            </GlassCard>
          ) : filteredPosts.length === 0 ? (
            <GlassCard style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                {searchQuery ? "🔍" : "📭"}
              </div>
              <p style={{ color: C.onBoardMid, fontFamily: "'DM Sans', sans-serif" }}>
                {searchQuery 
                  ? `No posts found for "${searchQuery}"` 
                  : "No posts yet. Be the first to share something!"}
              </p>
            </GlassCard>
          ) : (
            filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={user}
                onAddComment={handleAddComment}
                onToggleLike={handleToggleLike}
                onToggleSave={handleToggleSave}
                onDeletePost={handleDeletePost}
                onDeleteComment={handleDeleteComment}
              />
            ))
          )}
        </div>

        {/* Right: Suggestions */}
{/* Right: Suggestions */}
<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
  <UserSearchSidebar 
    onUserSelect={(user) => {
      console.log("Selected user:", user);
      alert(`📌 ${user.name}\n🏛️ ${user.university}\n📍 ${user.district}\n👤 Role: ${user.role}`);
    }}
  />
  
  <SuggestionsSidebar 
    onFilter={handleFilter} 
    activeFilter={filters}
    onSearch={handleSearch}
  />
</div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUserUpdate}
        />
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${C.board}; }
        ::-webkit-scrollbar-thumb { background: ${C.green}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.greenDark}; }
        
        @media (max-width: 992px) {
          .posting-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .posting-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .posting-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}