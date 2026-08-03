import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Home, LogOut, Search, Heart, MessageCircle,
  Share2, Bookmark, Award, Trash2,
  Send, Smile, Users, MapPin, GraduationCap, Clock, Settings, ShieldAlert,
  Plus, X, Edit2, User, Bell, Check, CheckCheck
} from "lucide-react";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo1.png";

const API_BASE = "http://localhost:5000/api";

// ─── THEME (dynamic) ──────────────────────────────────────────────────
const getTheme = (isDark) => ({
  bg: isDark ? "#12121a" : "#f8faf9",
  card: isDark ? "#1e1e2a" : "#ffffff",
  border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  borderHover: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
  text: isDark ? "#e8e8f0" : "#1e2922",
  textSec: isDark ? "#a0a0b0" : "#47554b",
  textMut: isDark ? "#6a6a7a" : "#8fa295",
  primary: isDark ? "#34d399" : "#1b6336",
  primaryLight: isDark ? "rgba(52,211,153,0.15)" : "rgba(27,99,54,0.06)",
  primaryHover: isDark ? "#6ee7b7" : "#134a27",
  accent: isDark ? "#34d399" : "#10b981",
  danger: "#ef4444",
  dangerLight: "rgba(239,68,68,0.08)",
  success: "#22c55e",
  warning: "#f59e0b",
  shadow: isDark ? "0 1px 2px 0 rgba(0,0,0,0.3)" : "0 1px 2px 0 rgba(0,0,0,0.03)",
  shadowLg: isDark ? "0 10px 15px -3px rgba(0,0,0,0.4)" : "0 10px 15px -3px rgba(0,0,0,0.06)",
  radius: "16px",
  radiusSm: "10px",
});

// ─── CONSTANTS ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "housing", label: "Housing", icon: Home },
  { value: "transport", label: "Transport", icon: MapPin },
  { value: "study", label: "Study", icon: GraduationCap },
  { value: "emergency", label: "Emergency", icon: ShieldAlert },
  { value: "campus", label: "Campus", icon: Award },
  { value: "food", label: "Food", icon: Smile },
  { value: "other", label: "Other", icon: Bookmark },
];

const POST_TYPES = [
  { value: "seeking", label: "Seeking Help" },
  { value: "helping", label: "Offering Help" },
  { value: "both", label: "Both" },
];

// ─── UTILITIES ──────────────────────────────────────────────────────────
const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
};
const getStoredToken = () => localStorage.getItem("token") || null;

const initials = (name) => {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join("");
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return new Date(dateStr).toLocaleDateString();
};

const getCategoryLabel = (value) => CATEGORIES.find(c => c.value === value)?.label || value;
const getTypeLabel = (value) => POST_TYPES.find(t => t.value === value)?.label || value;

// ─── AVATAR ──────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 40, theme }) => {
  const colors = ["#1b6336", "#134a27", "#10b981", "#065f46", "#0f766e"];
  const idx = name ? name.length % colors.length : 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: colors[idx], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 600, fontSize: size * 0.36, flexShrink: 0,
      border: `1px solid ${theme.border}`,
    }}>
      {initials(name)}
    </div>
  );
};

const Badge = ({ label, type = "neutral", theme }) => {
  const styles = {
    neutral: { bg: theme.bg, color: theme.textSec },
    primary: { bg: theme.primaryLight, color: theme.primary },
    success: { bg: "#f0fdf4", color: theme.success },
    danger: { bg: "#fef2f2", color: theme.danger },
  };
  const s = styles[type] || styles.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
      borderRadius: "12px", fontSize: "11px", fontWeight: 500,
      background: s.bg, color: s.color, border: `1px solid ${theme.border}`, whiteSpace: "nowrap",
    }}>{label}</span>
  );
};

// ─── NOTIFICATIONS DROPDOWN ───────────────────────────────────────────────
const NotificationDropdown = ({ token, theme }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = data.notifications || [];
      setNotifications(list);
      setUnread(list.filter(n => !n.read).length);
    } catch { /* silently fail */ }
  }, [token]);

  useEffect(() => {
    fetchNotifications();

    // FIX: pause polling when the browser tab is hidden to avoid unnecessary requests
    const interval = setInterval(() => {
      if (!document.hidden) fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch { /* ignore */ }
  };

  const markRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const typeIcon = (type) => {
    if (type === "like") return <Heart size={14} color={theme.danger} fill={theme.danger} />;
    if (type === "comment") return <MessageCircle size={14} color={theme.primary} />;
    return <Share2 size={14} color={theme.warning} />;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        style={{
          position: "relative", padding: "6px", borderRadius: theme.radiusSm,
          border: "none", background: open ? theme.primaryLight : "transparent",
          color: open ? theme.primary : theme.textMut, cursor: "pointer",
          display: "flex", alignItems: "center", transition: "all 0.15s",
        }}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "2px", right: "2px",
            width: "16px", height: "16px", borderRadius: "50%",
            background: theme.danger, color: "#fff", fontSize: "9px",
            fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${theme.card}`,
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: "360px", background: theme.card, borderRadius: theme.radius,
          border: `1px solid ${theme.border}`, boxShadow: theme.shadowLg, zIndex: 200,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px", borderBottom: `1px solid ${theme.border}`,
          }}>
            <span style={{ fontWeight: 600, fontSize: "14px", color: theme.text }}>
              Notifications {unread > 0 && <span style={{ color: theme.primary }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                border: "none", background: "transparent", color: theme.primary,
                fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
              }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: theme.textMut, fontSize: "13px" }}>
                <Bell size={28} style={{ marginBottom: "8px", opacity: 0.3 }} />
                <div>No notifications yet</div>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => !n.read && markRead(n._id)}
                  style={{
                    display: "flex", gap: "10px", padding: "12px 16px",
                    borderBottom: `1px solid ${theme.border}`,
                    background: n.read ? "transparent" : theme.primaryLight,
                    cursor: n.read ? "default" : "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: theme.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", border: `1px solid ${theme.border}`, flexShrink: 0,
                  }}>
                    {typeIcon(n.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", color: theme.text, lineHeight: 1.4 }}>
                      <strong>{n.sender?.name || "Someone"}</strong> {n.message}
                    </p>
                    <span style={{ fontSize: "11px", color: theme.textMut }}>{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.primary, flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── NAVBAR ──────────────────────────────────────────────────────────────
const FeedNavbar = ({ user, onLogout, setActiveTab, onHome, token, theme, logo }) => (
  <nav style={{
    position: "sticky", top: 0, zIndex: 100, background: theme.card,
    borderBottom: `1px solid ${theme.border}`, padding: "12px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.02)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={onHome}>
      <img
        src={logo}
        alt="PeerConnect logo"
        style={{ width: "32px", height: "32px", objectFit: "contain" }}
      />
      <span style={{ fontSize: "18px", fontWeight: 700, color: theme.primary, letterSpacing: "-0.3px" }}>PeerConnect</span>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <NotificationDropdown token={token} theme={theme} />

      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
        onClick={() => setActiveTab("profile")}
      >
        <Avatar name={user?.name} size={32} theme={theme} />
        <span style={{ fontSize: "13px", fontWeight: 500, color: theme.text }}>
          {user?.name?.split(" ")[0] || "Student"}
        </span>
      </div>

      <button onClick={onLogout} style={{
        padding: "6px", borderRadius: theme.radiusSm, border: "none",
        background: "transparent", color: theme.textMut, cursor: "pointer", display: "flex",
      }}>
        <LogOut size={16} />
      </button>
    </div>
  </nav>
);

// ─── LEFT SIDEBAR ──────────────────────────────────────────────────────────
const LeftSidebar = ({ user, activeTab, setActiveTab, theme }) => {
  const menuItems = [
    { id: "feed", label: "Home Feed", icon: Home },
    { id: "chat", label: "Messages", icon: MessageCircle },
    { id: "profile", label: "My Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "sticky", top: "80px" }}>
      <div
        onClick={() => setActiveTab("profile")}
        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: theme.radius, cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.02)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <Avatar name={user?.name} size={38} theme={theme} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 650, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.name || "Student"}
          </div>
          <div style={{ fontSize: "11px", color: theme.textMut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.university || "University"}
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: `1px solid ${theme.border}`, margin: "4px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {menuItems.map((item) => {
          const IconComp = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              style={{
                display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "10px 14px",
                borderRadius: theme.radiusSm, border: "none", background: isSelected ? theme.primaryLight : "transparent",
                color: isSelected ? theme.primary : theme.textSec, fontWeight: isSelected ? 600 : 500,
                fontSize: "13.5px", textAlign: "left", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <IconComp size={18} color={isSelected ? theme.primary : theme.textMut} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── CREATE POST ─────────────────────────────────────────────────────────
const CreatePost = ({ user, onCreate, posting, theme }) => {
  const [content, setContent] = useState("");
  const [type, setType] = useState("seeking");
  const [category, setCategory] = useState("other");
  const [isExpanded, setIsExpanded] = useState(false);

  const submit = () => {
    if (!content.trim()) return;
    onCreate({ content: content.trim(), type, category });
    setContent("");
    setIsExpanded(false);
  };

  return (
    <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "16px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: theme.shadow }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <Avatar name={user?.name} size={40} theme={theme} />
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "Student"}?`}
            rows={isExpanded ? 3 : 1}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: "20px", border: `1px solid ${theme.border}`,
              background: theme.bg, fontSize: "14px", color: theme.text, outline: "none", resize: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {isExpanded && (
        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "12px", color: theme.textMut, marginRight: "8px" }}>Type:</span>
            {POST_TYPES.map(opt => (
              <button key={opt.value} onClick={() => setType(opt.value)} style={{
                padding: "4px 12px", borderRadius: "50px",
                border: `1px solid ${type === opt.value ? theme.primary : "transparent"}`,
                background: type === opt.value ? theme.primaryLight : "transparent",
                color: type === opt.value ? theme.primary : theme.textSec,
                fontSize: "12px", cursor: "pointer", marginRight: "6px",
              }}>{opt.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            <span style={{ fontSize: "12px", color: theme.textMut, width: "100%" }}>Category:</span>
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
                padding: "3px 10px", borderRadius: "50px",
                border: `1px solid ${category === cat.value ? theme.primary : theme.border}`,
                background: category === cat.value ? theme.primaryLight : "transparent",
                color: category === cat.value ? theme.primary : theme.textMut,
                fontSize: "11px", cursor: "pointer",
              }}>{cat.label}</button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
            <button onClick={() => setIsExpanded(false)} style={{ padding: "6px 14px", borderRadius: theme.radiusSm, border: "none", background: "transparent", color: theme.textSec, cursor: "pointer", fontSize: "13px" }}>
              Cancel
            </button>
            <button onClick={submit} disabled={!content.trim() || posting} style={{ padding: "6px 20px", borderRadius: theme.radiusSm, border: "none", background: theme.primary, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── POST CARD ───────────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, onAddComment, onToggleLike, onToggleSave, onDeletePost, theme }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(post.savedByMe || false);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    if (onToggleLike) onToggleLike(post.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    if (onToggleSave) onToggleSave(post.id);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "16px", boxShadow: theme.shadow }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <Avatar name={post.authorName || "Anonymous"} size={38} theme={theme} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "14px", color: theme.text }}>{post.authorName || "Anonymous User"}</div>
          <div style={{ fontSize: "12px", color: theme.textMut, display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
            <Clock size={12} /> {timeAgo(post.createdAt)}
            <span style={{ color: theme.border }}>•</span>
            <Badge label={getTypeLabel(post.type)} type="primary" theme={theme} />
            {post.category && <Badge label={getCategoryLabel(post.category)} type="neutral" theme={theme} />}
          </div>
        </div>
        {currentUser?.id === post.authorId && onDeletePost && (
          <button onClick={() => onDeletePost(post.id)} style={{ border: "none", background: "transparent", color: theme.textMut, cursor: "pointer", padding: "4px" }}>
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <p style={{ fontSize: "14px", lineHeight: "1.6", color: theme.text, margin: "0 0 14px", whiteSpace: "pre-wrap" }}>{post.content}</p>

      <div style={{ display: "flex", gap: "4px", paddingTop: "4px", borderTop: `1px solid ${theme.border}` }}>
        <button onClick={handleLike} style={{ flex: 1, padding: "8px", border: "none", background: "transparent", cursor: "pointer", color: liked ? theme.primary : theme.textSec, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", fontWeight: 500 }}>
          <Heart size={16} fill={liked ? theme.primary : "none"} /> {likesCount}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{ flex: 1, padding: "8px", border: "none", background: "transparent", cursor: "pointer", color: theme.textSec, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", fontWeight: 500 }}>
          <MessageCircle size={16} /> {post.comments?.length || 0}
        </button>
        <button onClick={handleSave} style={{ padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", color: saved ? theme.primary : theme.textSec }}>
          <Bookmark size={16} fill={saved ? theme.primary : "none"} />
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
          {(post.comments || []).map((c) => (
            <div key={c.id || c._id} style={{ display: "flex", gap: "8px" }}>
              <Avatar name={c.authorName} size={26} theme={theme} />
              <div style={{ flex: 1, background: theme.bg, borderRadius: theme.radiusSm, padding: "6px 12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: theme.text }}>{c.authorName}</div>
                <p style={{ fontSize: "12.5px", color: theme.textSec, margin: "2px 0 0" }}>{c.content}</p>
              </div>
            </div>
          ))}

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            <input
              value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Write a community reply..."
              onKeyDown={e => { if (e.key === "Enter") handleComment(); }}
              style={{ flex: 1, padding: "6px 14px", borderRadius: "20px", border: `1px solid ${theme.border}`, outline: "none", fontSize: "13px", background: theme.bg, color: theme.text }}
            />
            <button onClick={handleComment} style={{ padding: "6px 12px", borderRadius: "20px", border: "none", background: theme.primary, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── USER SEARCH SIDEBAR ─────────────────────────────────────────────────
const UserSearchSidebar = ({ onUserSelect, theme }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const token = getStoredToken();

  const fetchUsers = useCallback(async (q) => {
    if (!token) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append("search", q);
      const res = await fetch(`${API_BASE}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(""); }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(query), 350);
    return () => clearTimeout(timer);
  }, [query, fetchUsers]);

  return (
    <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "16px", boxShadow: theme.shadow }}>
      <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: theme.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
        <Users size={14} color={theme.primary} /> Find Peers
      </h4>

      <input
        type="text"
        placeholder="Search verified students..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{
          width: "100%", padding: "8px 12px", borderRadius: theme.radiusSm,
          border: `1px solid ${theme.border}`, fontSize: "13px", outline: "none",
          marginBottom: "12px", boxSizing: "border-box", background: theme.bg, color: theme.text,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "12px", color: theme.textMut, fontSize: "13px" }}>
            Searching...
          </div>
        ) : users.length > 0 ? (
          users.slice(0, 6).map(u => (
            <div
              key={u._id}
              onClick={() => onUserSelect && onUserSelect(u)}
              style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "8px",
                borderRadius: theme.radiusSm, cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = theme.bg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Avatar name={u.name} size={30} theme={theme} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.name}
                </div>
                <div style={{ fontSize: "11px", color: theme.textMut, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.university} · {u.district}
                </div>
              </div>
            </div>
          ))
        ) : searched ? (
          <div style={{ fontSize: "12px", color: theme.textMut, textAlign: "center", padding: "8px 0" }}>
            No verified students found
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── USER PROFILE MODAL ──────────────────────────────────────────────────
const UserProfileModal = ({ user: selectedUser, onClose, theme }) => {
  if (!selectedUser) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: theme.card, borderRadius: theme.radius, padding: "28px", maxWidth: "380px", width: "100%", border: `1px solid ${theme.border}`, boxShadow: theme.shadowLg }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <Avatar name={selectedUser.name} size={56} theme={theme} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: theme.text }}>{selectedUser.name}</div>
              <div style={{ fontSize: "12px", color: theme.textMut, marginTop: "2px" }}>{selectedUser.role}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", color: theme.textMut, cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {selectedUser.university && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <GraduationCap size={15} color={theme.textMut} />
              <span style={{ fontSize: "13px", color: theme.textSec }}>{selectedUser.university}</span>
            </div>
          )}
          {selectedUser.district && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <MapPin size={15} color={theme.textMut} />
              <span style={{ fontSize: "13px", color: theme.textSec }}>{selectedUser.district}</span>
            </div>
          )}
          {selectedUser.bio && (
            <div style={{ marginTop: "4px", padding: "10px 12px", background: theme.bg, borderRadius: theme.radiusSm }}>
              <p style={{ margin: 0, fontSize: "13px", color: theme.textSec, lineHeight: 1.5 }}>{selectedUser.bio}</p>
            </div>
          )}
          {selectedUser.interests?.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", color: theme.textMut, marginBottom: "6px" }}>Interests</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {selectedUser.interests.map((int, i) => (
                  <span key={i} style={{ padding: "3px 10px", borderRadius: "50px", background: theme.primaryLight, color: theme.primary, fontSize: "11px" }}>{int}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── RIGHT SIDEBAR ───────────────────────────────────────────────────────
const DynamicRightSidebar = ({ selectedCategory, onFilterChange, theme }) => {
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const handleCatSelect = (value) => {
    setSelectedCat(value);
    if (onFilterChange) onFilterChange(value === selectedCat ? "all" : value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "80px" }}>
      <UserSearchSidebar onUserSelect={setSelectedUser} theme={theme} />

      <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "16px", boxShadow: theme.shadow }}>
        <h4 style={{ fontSize: "13.5px", fontWeight: 600, color: theme.text, margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Bookmark size={14} color={theme.primary} /> Filter by Category
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <button
            onClick={() => { setSelectedCat("all"); if (onFilterChange) onFilterChange("all"); }}
            style={{
              width: "100%", padding: "7px 8px", fontSize: "12.5px", border: "none",
              background: selectedCat === "all" ? theme.primaryLight : "transparent",
              textAlign: "left", cursor: "pointer", borderRadius: theme.radiusSm,
              color: selectedCat === "all" ? theme.primary : theme.textSec, fontWeight: selectedCat === "all" ? 600 : 400,
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <Home size={13} /> All Activity
          </button>
          {CATEGORIES.map(c => {
            const CatIcon = c.icon;
            const isSelected = selectedCat === c.value;
            return (
              <button
                key={c.value}
                onClick={() => handleCatSelect(c.value)}
                style={{
                  width: "100%", padding: "7px 8px", fontSize: "12.5px", border: "none",
                  background: isSelected ? theme.primaryLight : "transparent",
                  textAlign: "left", cursor: "pointer", borderRadius: theme.radiusSm,
                  color: isSelected ? theme.primary : theme.textSec, fontWeight: isSelected ? 600 : 400,
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <CatIcon size={13} /> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} theme={theme} />}
    </div>
  );
};

// ─── CHAT TAB ────────────────────────────────────────────────────────────
const ChatTab = ({ theme }) => {
  const dummyChats = [
    { id: 1, name: "Rakib Hasan", lastMessage: "Hey, are you free later?", time: "2m ago", unread: 2 },
    { id: 2, name: "Tia Raj", lastMessage: "Thanks for the notes!", time: "1h ago", unread: 0 },
    { id: 3, name: "Tasnim Sultana", lastMessage: "Can you send me the link?", time: "Yesterday", unread: 1 },
    { id: 4, name: "Fahmida Islam", lastMessage: "See you at the library!", time: "2d ago", unread: 0 },
  ];

  return (
    <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "16px", boxShadow: theme.shadow }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600, color: theme.text }}>
        <MessageCircle size={18} style={{ display: "inline", marginRight: "8px" }} />
        Messages
      </h3>
      {dummyChats.map(chat => (
        <div key={chat.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 0", borderBottom: `1px solid ${theme.border}`,
          cursor: "pointer", transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = theme.bg}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Avatar name={chat.name} size={40} theme={theme} />
            <div>
              <div style={{ fontWeight: 600, color: theme.text }}>{chat.name}</div>
              <div style={{ color: theme.textMut, fontSize: "13px" }}>{chat.lastMessage}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: theme.textMut, fontSize: "12px" }}>{chat.time}</div>
            {chat.unread > 0 && (
              <span style={{
                background: theme.primary, color: "#fff",
                padding: "2px 8px", borderRadius: "50%", fontSize: "12px",
                display: "inline-block", minWidth: "20px", textAlign: "center"
              }}>
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────
export default function DashboardPage({ onLogout, onHome }) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [activeTab, setActiveTab] = useState("feed");
  const [user, setUser] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [offline, setOffline] = useState(false);
  const token = getStoredToken();

  // ─── LOAD USER ──────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    } else if (token) {
      fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        })
        .catch(console.error);
    }
  }, [token]);

  // ─── FILTER POSTS ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredPosts(allPosts);
    } else {
      setFilteredPosts(allPosts.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, allPosts]);

  // ─── LOAD POSTS ──────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      const posts = Array.isArray(data.posts) ? data.posts : [];
      setAllPosts(posts);
      setOffline(false);
    } catch {
      setOffline(true);
      setAllPosts([{
        id: "mock1", authorName: "Demo User",
        content: "Welcome to PeerConnect! This is a demo post. Connect with students and share your experiences.",
        type: "both", category: "other", createdAt: new Date().toISOString(),
        likes: 0, likedByMe: false, savedByMe: false, comments: [],
      }]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) loadPosts(); }, [token, loadPosts]);

  // ─── CREATE POST ──────────────────────────────────────────────────────
  const handleCreatePost = async ({ content, type, category }) => {
    if (!token) return;
    setPosting(true);
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId, authorName: user?.name || "Student", authorId: user?.id,
      type, category, content, createdAt: new Date().toISOString(),
      likes: 0, likedByMe: false, savedByMe: false, comments: [],
    };
    setAllPosts(prev => [optimistic, ...prev]);
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: content.slice(0, 50), description: content, type, category }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAllPosts(prev => {
        const filtered = prev.filter(p => p.id !== tempId);
        return [data.post || { ...optimistic, id: `real-${Date.now()}` }, ...filtered];
      });
    } catch {
      setAllPosts(prev => prev.filter(p => p.id !== tempId));
    } finally {
      setPosting(false);
    }
  };

  // ─── DELETE POST ──────────────────────────────────────────────────────
  const handleDeletePost = async (postId) => {
    if (!token || !window.confirm("Delete this post?")) return;
    try {
      await fetch(`${API_BASE}/posts/${postId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setAllPosts(prev => prev.filter(p => p.id !== postId));
    } catch { console.error("Delete failed"); }
  };

  // ─── ADD COMMENT ──────────────────────────────────────────────────────
  const handleAddComment = async (postId, content) => {
    if (!token) return;
    const optimisticComment = { id: `local-${Date.now()}`, authorName: user?.name || "Student", content, createdAt: new Date().toISOString() };
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), optimisticComment] } : p));
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      loadPosts();
    }
  };

  // ─── TOGGLE LIKE ──────────────────────────────────────────────────────
  const handleToggleLike = async (postId) => {
    if (!token) return;
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) } : p));
    try {
      await fetch(`${API_BASE}/posts/${postId}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch { loadPosts(); }
  };

  // ─── TOGGLE SAVE ──────────────────────────────────────────────────────
  const handleToggleSave = async (postId) => {
    if (!token) return;
    setAllPosts(prev => prev.map(p => p.id === postId ? { ...p, savedByMe: !p.savedByMe } : p));
    try {
      await fetch(`${API_BASE}/posts/${postId}/save`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    } catch { loadPosts(); }
  };

  // ─── LOGOUT ───────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (onLogout) onLogout();
  };

  // ─── RENDER CONTENT ─────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "feed":
        return (
          <>
            <CreatePost user={user} onCreate={handleCreatePost} posting={posting} theme={theme} />

            {activeCategory !== "all" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: theme.primaryLight, borderRadius: theme.radiusSm, border: `1px solid rgba(27,99,54,0.12)` }}>
                <span style={{ fontSize: "13px", color: theme.primary, fontWeight: 500 }}>
                  Filtering by: <strong>{getCategoryLabel(activeCategory)}</strong>
                </span>
                <button onClick={() => setActiveCategory("all")} style={{ marginLeft: "auto", border: "none", background: "transparent", color: theme.primary, cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <X size={14} />
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {loading ? (
                <div style={{ background: theme.card, borderRadius: theme.radius, padding: "40px", textAlign: "center", color: theme.textMut, border: `1px solid ${theme.border}` }}>
                  Loading posts...
                </div>
              ) : filteredPosts.length === 0 ? (
                <div style={{ background: theme.card, borderRadius: theme.radius, padding: "40px", textAlign: "center", color: theme.textMut, border: `1px solid ${theme.border}` }}>
                  {activeCategory !== "all" ? `No posts in "${getCategoryLabel(activeCategory)}" yet.` : "No posts yet. Be the first to share something!"}
                </div>
              ) : (
                filteredPosts.map(post => (
                  <PostCard
                    key={post.id || post._id}
                    post={post}
                    currentUser={user}
                    onAddComment={handleAddComment}
                    onToggleLike={handleToggleLike}
                    onToggleSave={handleToggleSave}
                    onDeletePost={handleDeletePost}
                    theme={theme}
                  />
                ))
              )}
            </div>
          </>
        );

      case "chat":
        return <ChatTab theme={theme} />;

      case "profile":
        return <ProfilePage userId="me" onBack={() => setActiveTab("feed")} isDark={isDark} />;

      case "settings":
        return <SettingsPage onLogout={handleLogout} onBack={() => setActiveTab("feed")} isDark={isDark} />;

      default:
        return null;
    }
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <FeedNavbar
        user={user}
        onLogout={handleLogout}
        setActiveTab={setActiveTab}
        onHome={onHome}
        token={token}
        theme={theme}
        logo={logo}
      />

      {offline && (
        <div style={{ maxWidth: "1280px", margin: "12px auto 0", padding: "0 16px" }}>
          <div style={{ background: "#fffbeb", border: `1px solid #fde68a`, color: "#92400e", borderRadius: theme.radiusSm, padding: "10px 16px", fontSize: "13px" }}>
            ⚡ Cannot reach server. Make sure backend is running on port 5000.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 300px", gap: "28px", maxWidth: "1280px", margin: "0 auto", padding: "24px 16px" }}>
        <aside>
          <LeftSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </aside>

        <main style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {renderContent()}
        </main>

        <aside>
          {activeTab === "feed" && (
            <DynamicRightSidebar
              selectedCategory={activeCategory}
              onFilterChange={setActiveCategory}
              theme={theme}
            />
          )}
        </aside>
      </div>
    </div>
  );
}