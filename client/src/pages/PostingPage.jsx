import { useEffect, useState, useCallback, useRef } from "react";
import {
  Home,
  LogOut,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Edit2,
  X,
  Bookmark,
  Bell,
  Award,
  Trash2,
  Users,
} from "lucide-react";
import logo from "../assets/logo1.png";
const API_BASE = "http://localhost:5000/api";

// ─── COLOR PALETTE ───
const C = {
  board: "#0a1a1a",
  boardDark: "#061010",
  boardMid: "#0f2424",
  accent: "#34d399",
  accentDark: "#2aad7f",
  accentGlow: "rgba(52,211,153,0.28)",
  accentLight: "rgba(52,211,153,0.08)",
  accentBorder: "rgba(52,211,153,0.2)",
  onBoard: "#BBE0EF",
  onBoardMid: "#8ab3c9",
  onBoardFaint: "#5a7a8f",
  cardBg: "#ffffff",
  cardText: "#1e293b",
  cardTextMuted: "#64748b",
  cardBorder: "#f1f5f9",
  cardShadow: "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
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
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
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
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

function getTypeLabel(value) {
  return POST_TYPES.find((t) => t.value === value)?.label || value;
}

// ─── COMPONENTS ───

function Avatar({ name, size = 42 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        border: `2px solid rgba(255,255,255,0.15)`,
      }}
    >
      {initials(name)}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.cardBg,
        borderRadius: "16px",
        padding: "20px",
        boxShadow: C.cardShadow,
        border: `1px solid ${C.cardBorder}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Badge({ type }) {
  const isHelping = type === "helping" || type === "both";
  const colors = isHelping
    ? { bg: C.accentLight, color: C.accent, border: C.accentBorder }
    : { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 700,
        color: colors.color,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
      }}
    >
      {getTypeLabel(type)}
    </span>
  );
}

// ─── NOTIFICATION BELL ───
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
      setUnreadCount(data.notifications.filter((n) => !n.read).length);
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
          color: "rgba(255,255,255,0.6)",
          position: "relative",
          padding: "6px",
          borderRadius: "50%",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.08)")}
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
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: "12px",
            padding: "12px 0",
            boxShadow: C.cardShadow,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 16px 8px",
              borderBottom: `1px solid ${C.cardBorder}`,
            }}
          >
            <span style={{ color: C.cardText, fontWeight: 700 }}>Notifications</span>
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
                color: C.cardTextMuted,
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
                  borderBottom: `1px solid ${C.cardBorder}`,
                  background: n.read ? "transparent" : C.accentLight,
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f8fafc")}
                onMouseLeave={(e) => {
                  if (!n.read) e.target.style.background = C.accentLight;
                  else e.target.style.background = "transparent";
                }}
              >
                <div style={{ color: C.cardText, fontSize: "13px" }}>{n.message}</div>
                <div style={{ color: C.cardTextMuted, fontSize: "10px", marginTop: "2px" }}>
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

// ─── NAVBAR SEARCH ───
function NavbarUserSearch({ onUserSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const token = getStoredToken();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("search", query);

      const res = await fetch(`${API_BASE}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResults(data.users || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [token, query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchUsers();
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, fetchUsers]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user) => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    if (onUserSelect) onUserSelect(user);
  };

  return (
    <div ref={searchRef} style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "999px",
          padding: "6px 14px",
          border: "1px solid rgba(255,255,255,0.1)",
          transition: "all 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
      >
        <Users size={14} color="rgba(255,255,255,0.5)" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Find students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setShowDropdown(true)}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            color: "#ffffff",
            padding: "4px 0",
            minWidth: "120px",
          }}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              padding: "2px",
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "42px",
            left: "0",
            right: "0",
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: "12px",
            padding: "8px 0",
            boxShadow: C.cardShadow,
            zIndex: 1000,
            maxHeight: "340px",
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div style={{ padding: "16px", textAlign: "center", color: C.cardTextMuted, fontSize: "12px" }}>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div
                style={{
                  padding: "4px 14px 8px",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: C.cardTextMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  borderBottom: `1px solid ${C.cardBorder}`,
                }}
              >
                {results.length} student{results.length > 1 ? "s" : ""} found
              </div>
              {results.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelect(user)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 14px",
                    cursor: "pointer",
                    transition: "0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Avatar name={user.name} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.cardText, fontSize: "13px", fontWeight: 600 }}>
                      {user.name}
                    </div>
                    <div style={{ color: C.cardTextMuted, fontSize: "10px" }}>
                      {user.university} • {user.district}
                    </div>
                  </div>
                  <Badge type={user.role} />
                </div>
              ))}
            </>
          ) : query.trim() ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.cardTextMuted, fontSize: "13px" }}>
              No students found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── NAVBAR ───
function FeedNavbar({ user, onLogout, onHome, onUserSelect }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "12px 32px",
        background: "rgba(10,26,26,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={logo}
            alt="PeerConnect Logo"
            style={{
              height: "34px",
              width: "auto",
              filter: "drop-shadow(0 0 12px rgba(52,211,153,0.3))",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.filter =
                "drop-shadow(0 0 20px rgba(52,211,153,0.5)) drop-shadow(0 0 40px rgba(52,211,153,0.2))";
              e.target.style.transform = "scale(1.05) rotate(-2deg)";
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = "drop-shadow(0 0 12px rgba(52,211,153,0.3))";
              e.target.style.transform = "scale(1) rotate(0deg)";
            }}
          />
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "1.4rem",
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.5px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            Peer
            <span
              style={{
                color: C.accent,
                textShadow: `
                  0 0 20px ${C.accentGlow},
                  0 0 40px rgba(52,211,153,0.15),
                  0 0 80px rgba(52,211,153,0.08)
                `,
                transition: "text-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.textShadow = `
                  0 0 30px ${C.accentGlow},
                  0 0 60px rgba(52,211,153,0.25),
                  0 0 100px rgba(52,211,153,0.12)
                `;
              }}
              onMouseLeave={(e) => {
                e.target.style.textShadow = `
                  0 0 20px ${C.accentGlow},
                  0 0 40px rgba(52,211,153,0.15),
                  0 0 80px rgba(52,211,153,0.08)
                `;
              }}
            >
              Connect
            </span>
          </h2>
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.06)",
              padding: "2px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.06)",
              letterSpacing: "0.3px",
              textTransform: "uppercase",
            }}
          >
            Feed
          </span>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: "380px", minWidth: "180px" }}>
        <NavbarUserSearch onUserSelect={onUserSelect} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
        <NotificationBell user={user} />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Avatar name={user?.name} size={32} />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {user?.name?.split(" ")[0] || "Student"}
          </span>
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: "6px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(220,38,38,0.12)";
            e.target.style.borderColor = "rgba(220,38,38,0.25)";
            e.target.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.borderColor = "rgba(255,255,255,0.15)";
            e.target.style.color = "rgba(255,255,255,0.6)";
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
    <Card style={{ position: "sticky", top: "90px", padding: "24px 20px" }}>
      {/* Avatar - Centered */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
        <Avatar name={user?.name} size={80} />
      </div>

      {/* Name - Centered */}
      <h3
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "1.2rem",
          color: C.cardText,
          margin: "0 0 4px 0",
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {user?.name || "Student"}
      </h3>

      {/* University - Centered */}
      <p
        style={{
          fontSize: "13px",
          color: C.cardTextMuted,
          fontFamily: "'DM Sans', sans-serif",
          margin: "0 0 2px 0",
          textAlign: "center",
        }}
      >
        {user?.university || "University"}
      </p>

      {/* District - Centered */}
      <p
        style={{
          fontSize: "13px",
          color: C.cardTextMuted,
          fontFamily: "'DM Sans', sans-serif",
          margin: "0 0 8px 0",
          textAlign: "center",
        }}
      >
        📍 {user?.district || "District"}
      </p>

      {/* Role Badge - Centered */}
      {user?.role && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
          <Badge type={user.role} />
        </div>
      )}

      {/* Bio - Centered */}
      <div
        style={{
          margin: "12px 0",
          padding: "12px 0",
          borderTop: `1px solid ${C.cardBorder}`,
          borderBottom: `1px solid ${C.cardBorder}`,
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: C.cardTextMuted,
            lineHeight: 1.7,
            margin: 0,
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
          }}
        >
          {user?.bio || "No bio yet — tell the community a bit about yourself."}
        </p>
      </div>

      {/* Stats - Centered grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "12px 8px",
            background: "#f8fafc",
            borderRadius: "10px",
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: C.accent,
              fontFamily: "'Fraunces', serif",
              fontSize: "1.5rem",
            }}
          >
            42
          </div>
          <div
            style={{
              fontSize: "11px",
              color: C.cardTextMuted,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Posts
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: "12px 8px",
            background: "#f8fafc",
            borderRadius: "10px",
            border: `1px solid ${C.cardBorder}`,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: C.accent,
              fontFamily: "'Fraunces', serif",
              fontSize: "1.5rem",
            }}
          >
            18
          </div>
          <div
            style={{
              fontSize: "11px",
              color: C.cardTextMuted,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            Helps
          </div>
        </div>
      </div>

      {/* Buttons - Full width */}
      <button
        onClick={onEditProfile}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: `1.5px solid ${C.accent}`,
          background: "transparent",
          color: C.accent,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "10px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = C.accentLight;
          e.target.style.boxShadow = `0 0 24px ${C.accentGlow}`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.boxShadow = "none";
        }}
      >
        <Edit2 size={16} /> Edit Profile
      </button>

      <button
        onClick={onHome}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          border: `1px solid ${C.cardBorder}`,
          background: "transparent",
          color: C.cardTextMuted,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.target.style.background = "#f8fafc";
          e.target.style.color = C.cardText;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "transparent";
          e.target.style.color = C.cardTextMuted;
        }}
      >
        <Home size={16} /> Homepage
      </button>
    </Card>
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
    <Card style={{ padding: "20px 24px" }}>
      <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <Avatar name={user?.name} size={44} />
        <div style={{ flex: 1 }}>
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "999px",
              border: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
              textAlign: "left",
              color: C.cardTextMuted,
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = C.accent;
              e.target.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = C.cardBorder;
              e.target.style.background = "#f8fafc";
            }}
          >
            {isExpanded
              ? "Write something..."
              : `What's on your mind, ${user?.name?.split(" ")[0] || "Student"}?`}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: "16px" }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, ask for help, or offer support..."
            rows={4}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
              color: C.cardText,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = C.accent;
              e.target.style.boxShadow = `0 0 24px ${C.accentGlow}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = C.cardBorder;
              e.target.style.boxShadow = "none";
            }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            {POST_TYPES.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: `1.5px solid ${type === opt.value ? C.accent : C.cardBorder}`,
                  background: type === opt.value ? C.accentLight : "transparent",
                  color: type === opt.value ? C.accent : C.cardTextMuted,
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: `1px solid ${category === cat.value ? C.accent : "transparent"}`,
                  background: category === cat.value ? C.accentLight : "transparent",
                  color: category === cat.value ? C.accent : C.cardTextMuted,
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
            <button
              onClick={() => {
                setIsExpanded(false);
                setContent("");
              }}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: `1px solid ${C.cardBorder}`,
                background: "transparent",
                cursor: "pointer",
                fontWeight: 600,
                color: C.cardTextMuted,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.color = C.cardText;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = C.cardTextMuted;
              }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!content.trim() || posting}
              style={{
                padding: "10px 28px",
                borderRadius: "8px",
                border: "none",
                background: C.accent,
                color: "white",
                fontWeight: 700,
                cursor: !content.trim() || posting ? "default" : "pointer",
                opacity: !content.trim() || posting ? 0.5 : 1,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                transition: "all 0.2s",
                boxShadow: !content.trim() || posting ? "none" : `0 4px 24px ${C.accentGlow}`,
              }}
              onMouseEnter={(e) => {
                if (!content.trim() || posting) return;
                e.target.style.background = C.accentDark;
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (!content.trim() || posting) return;
                e.target.style.background = C.accent;
                e.target.style.transform = "translateY(0)";
              }}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </Card>
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
    if (window.confirm("Are you sure you want to delete this post?")) {
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

  const isOwnPost = currentUser && post.authorId === currentUser.id;

  return (
    <Card style={{ padding: "24px 24px" }}>
      <div style={{ display: "flex", gap: "14px", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: "14px", flex: 1, minWidth: 0 }}>
          <Avatar name={post.authorName} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h4
                style={{
                  color: C.cardText,
                  margin: 0,
                  fontSize: "15px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                }}
              >
                {post.authorName}
              </h4>
              <span
                style={{
                  color: C.cardTextMuted,
                  fontSize: "12px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                • {timeAgo(post.createdAt)}
              </span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
              <Badge type={post.type} />
              {post.category && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: C.cardTextMuted,
                    background: "#f8fafc",
                    border: `1px solid ${C.cardBorder}`,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {getCategoryLabel(post.category)}
                </span>
              )}
            </div>
          </div>
        </div>

        {isOwnPost && (
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
              flexShrink: 0,
              marginTop: "2px",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(220,38,38,0.05)")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      <p
        style={{
          color: C.cardText,
          lineHeight: 1.8,
          margin: "14px 0 0",
          whiteSpace: "pre-wrap",
          fontSize: "15px",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {post.content}
      </p>

      <div
        style={{
          display: "flex",
          gap: "6px",
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: `1px solid ${C.cardBorder}`,
        }}
      >
        <button
          onClick={handleLike}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: liked ? C.accent : C.cardTextMuted,
            fontWeight: 600,
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!liked) e.target.style.color = C.cardText;
            e.target.style.background = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            if (!liked) e.target.style.color = C.cardTextMuted;
            e.target.style.background = "transparent";
          }}
        >
          {liked ? <Heart size={16} fill={C.accent} color={C.accent} /> : <Heart size={16} />}
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
            color: C.cardTextMuted,
            fontWeight: 600,
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = C.cardText;
            e.target.style.background = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = C.cardTextMuted;
            e.target.style.background = "transparent";
          }}
        >
          <MessageCircle size={16} />
          {post.comments?.length || 0}
        </button>

        <button
          onClick={handleSave}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: saved ? C.accent : C.cardTextMuted,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#f8fafc";
            e.target.style.color = saved ? C.accent : C.cardText;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = saved ? C.accent : C.cardTextMuted;
          }}
        >
          <Bookmark size={16} fill={saved ? C.accent : "none"} />
        </button>

        <button
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: C.cardTextMuted,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#f8fafc";
            e.target.style.color = C.cardText;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = C.cardTextMuted;
          }}
        >
          <Share2 size={16} />
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${C.cardBorder}` }}>
          {(post.comments || []).map((c) => (
            <div key={c.id} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <Avatar name={c.authorName} size={28} />
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "8px 14px",
                  flex: 1,
                  border: `1px solid ${C.cardBorder}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong
                      style={{ fontSize: "12px", color: C.cardText, fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {c.authorName}
                    </strong>
                    <span
                      style={{
                        fontSize: "10px",
                        color: C.cardTextMuted,
                        marginLeft: "8px",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm("Delete this comment?")) {
                        onDeleteComment(post.id, c.id);
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: C.cardTextMuted,
                      cursor: "pointer",
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = C.error;
                      e.target.style.background = "rgba(220,38,38,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = C.cardTextMuted;
                      e.target.style.background = "transparent";
                    }}
                  >
                    ✕
                  </button>
                </div>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "13px",
                    color: C.cardText,
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "pre-wrap",
                  }}
                >
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
                border: `1px solid ${C.cardBorder}`,
                background: "#f8fafc",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                color: C.cardText,
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = C.accent;
                e.target.style.boxShadow = `0 0 16px ${C.accentGlow}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = C.cardBorder;
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
    </Card>
  );
}

// ─── RIGHT SIDEBAR ───
function SuggestionsSidebar({ onFilter, activeFilter, onSearch, currentUserId }) {
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    author: "me",
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
    <Card style={{ position: "sticky", top: "90px" }}>
      <h4
        style={{
          color: C.cardText,
          margin: "0 0 16px",
          fontFamily: "'Fraunces', serif",
          fontSize: "1.1rem",
        }}
      >
        🔍 Filter Feed
      </h4>

      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "8px 12px",
            border: `1px solid ${C.cardBorder}`,
            transition: "all 0.2s",
          }}
        >
          <Search size={16} color={C.cardTextMuted} />
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
              color: C.cardText,
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
                color: C.cardTextMuted,
                padding: "2px",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: C.cardTextMuted,
            fontFamily: "'DM Sans', sans-serif",
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Author
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          <button
            onClick={() => handleFilter("author", "all")}
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              border: `1.5px solid ${filters.author === "all" ? C.accent : C.cardBorder}`,
              background: filters.author === "all" ? C.accentLight : "transparent",
              color: filters.author === "all" ? C.accent : C.cardTextMuted,
              fontSize: "11px",
              fontWeight: filters.author === "all" ? 700 : 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
          >
            All
          </button>
          <button
            onClick={() => handleFilter("author", "me")}
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              border: `1.5px solid ${filters.author === "me" ? C.accent : C.cardBorder}`,
              background: filters.author === "me" ? C.accentLight : "transparent",
              color: filters.author === "me" ? C.accent : C.cardTextMuted,
              fontSize: "11px",
              fontWeight: filters.author === "me" ? 700 : 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
            }}
          >
            My Posts
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "14px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: C.cardTextMuted,
            fontFamily: "'DM Sans', sans-serif",
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Post Type
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {["all", ...POST_TYPES.map((t) => t.value)].map((type) => (
            <button
              key={type}
              onClick={() => handleFilter("type", type)}
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                border: `1.5px solid ${filters.type === type ? C.accent : C.cardBorder}`,
                background: filters.type === type ? C.accentLight : "transparent",
                color: filters.type === type ? C.accent : C.cardTextMuted,
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
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: C.cardTextMuted,
            fontFamily: "'DM Sans', sans-serif",
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Category
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {["all", ...CATEGORIES.map((c) => c.value)].map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter("category", cat)}
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                border: `1.5px solid ${filters.category === cat ? C.accent : C.cardBorder}`,
                background: filters.category === cat ? C.accentLight : "transparent",
                color: filters.category === cat ? C.accent : C.cardTextMuted,
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

      <div
        style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: `1px solid ${C.cardBorder}`,
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: C.cardTextMuted,
            fontFamily: "'DM Sans', sans-serif",
            margin: "0 0 8px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Quick Stats
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div
            style={{
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "center",
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: C.accent,
                fontFamily: "'Fraunces', serif",
                fontSize: "1.2rem",
              }}
            >
              24
            </div>
            <div style={{ fontSize: "10px", color: C.cardTextMuted, fontFamily: "'DM Sans', sans-serif" }}>
              Helpers
            </div>
          </div>
          <div
            style={{
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "center",
              border: `1px solid ${C.cardBorder}`,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#f59e0b",
                fontFamily: "'Fraunces', serif",
                fontSize: "1.2rem",
              }}
            >
              18
            </div>
            <div style={{ fontSize: "10px", color: C.cardTextMuted, fontFamily: "'DM Sans', sans-serif" }}>
              Seekers
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "12px",
          padding: "12px",
          background: "#f8fafc",
          borderRadius: "10px",
          border: `1px solid ${C.cardBorder}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Award size={14} color={C.accent} />
          <span
            style={{
              fontWeight: 700,
              fontSize: "12px",
              color: C.accent,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Top Helper
          </span>
        </div>
        <p
          style={{
            fontSize: "11px",
            color: C.cardTextMuted,
            margin: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          🏆{" "}
          {localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user"))?.name || "Someone"
            : "Someone"}{" "}
          • 34 helps
        </p>
      </div>
    </Card>
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
      const updated = data.user || {
        ...user,
        name: name.trim(),
        bio: bio.trim(),
        district: district.trim(),
      };
      localStorage.setItem("user", JSON.stringify(updated));
      onUpdate(updated);
      onClose();
    } catch {
      const updated = {
        ...user,
        name: name.trim(),
        bio: bio.trim(),
        district: district.trim(),
      };
      localStorage.setItem("user", JSON.stringify(updated));
      onUpdate(updated);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.cardBg,
          borderRadius: "20px",
          padding: "32px",
          maxWidth: "440px",
          width: "100%",
          border: `1px solid ${C.cardBorder}`,
          boxShadow: C.cardShadow,
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: C.cardText,
              fontFamily: "'Fraunces', serif",
              fontSize: "1.5rem",
            }}
          >
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: "4px",
              color: C.cardTextMuted,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = C.cardText)}
            onMouseLeave={(e) => (e.target.style.color = C.cardTextMuted)}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <Avatar name={name} size={72} />
        </div>

        <label
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: C.cardTextMuted,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: `1px solid ${C.cardBorder}`,
            background: "#f8fafc",
            marginBottom: "14px",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: C.cardText,
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.boxShadow = `0 0 20px ${C.accentGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.cardBorder;
            e.target.style.boxShadow = "none";
          }}
        />

        <label
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: C.cardTextMuted,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
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
            border: `1px solid ${C.cardBorder}`,
            background: "#f8fafc",
            marginBottom: "14px",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: C.cardText,
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.boxShadow = `0 0 20px ${C.accentGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.cardBorder;
            e.target.style.boxShadow = "none";
          }}
        />

        <label
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: C.cardTextMuted,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
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
            border: `1px solid ${C.cardBorder}`,
            background: "#f8fafc",
            resize: "vertical",
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: C.cardText,
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = C.accent;
            e.target.style.boxShadow = `0 0 20px ${C.accentGlow}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = C.cardBorder;
            e.target.style.boxShadow = "none";
          }}
        />

        {error && (
          <p
            style={{
              color: C.error,
              fontSize: "12px",
              margin: "8px 0",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: `1px solid ${C.cardBorder}`,
              background: "transparent",
              fontWeight: 600,
              cursor: "pointer",
              color: C.cardTextMuted,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f8fafc";
              e.target.style.color = C.cardText;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = C.cardTextMuted;
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
              background: C.accent,
              color: "white",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              transition: "all 0.2s",
              boxShadow: loading ? "none" : `0 4px 20px ${C.accentGlow}`,
            }}
            onMouseEnter={(e) => {
              if (loading) return;
              e.target.style.background = C.accentDark;
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              if (loading) return;
              e.target.style.background = C.accent;
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
  const [filters, setFilters] = useState({ type: "all", category: "all", author: "me" });
  const [searchQuery, setSearchQuery] = useState("");

  const authorized = Boolean(token && user);

  const handleDeletePost = async (postId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete post");
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.message || "Failed to delete post");
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!token) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete comment");
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p
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
          "Content-Type": "application/json",
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
      const transformed = (data.posts || []).map((post) => ({
        ...post,
        authorId: post.author?._id || post.authorId || null,
      }));
      setPosts(transformed);
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
    setPosts((prev) => [optimistic, ...prev]);
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
          description: content,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create post");
      }
      const data = await res.json();
      setPosts((prev) => {
        const filtered = prev.filter((p) => p.id !== tempId);
        const newPost = data.post || {
          id: `real-${Date.now()}`,
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
        return [newPost, ...filtered];
      });
    } catch (error) {
      console.error("Error creating post:", error);
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
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
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), optimisticComment] } : p
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
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            const comments = p.comments.map((c) =>
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
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likes: p.likes + (p.likedByMe ? -1 : 1),
            }
          : p
      )
    );
    try {
      await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      loadPosts();
    }
  };

  const handleToggleSave = async (postId) => {
    if (!token) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, savedByMe: !p.savedByMe } : p))
    );
    try {
      await fetch(`${API_BASE}/posts/${postId}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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

  const filteredPosts = posts.filter((post) => {
    if (filters.author === "me") {
      if (!user || post.authorId !== user.id) return false;
    }
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

  const handleUserSelect = (selectedUser) => {
    alert(`📌 ${selectedUser.name}\n🏛️ ${selectedUser.university}\n📍 ${selectedUser.district}\n👤 Role: ${selectedUser.role}`);
  };

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.board,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Card style={{ maxWidth: "420px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2
            style={{
              color: C.cardText,
              fontFamily: "'Fraunces', serif",
              marginBottom: "8px",
            }}
          >
            Sign in required
          </h2>
          <p
            style={{
              color: C.cardTextMuted,
              marginBottom: "20px",
              lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Only verified PeerConnect members can access the feed.
          </p>
          <button
            onClick={onLogout}
            style={{
              padding: "12px 32px",
              borderRadius: "10px",
              border: "none",
              background: C.accent,
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
              boxShadow: `0 4px 20px ${C.accentGlow}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = C.accentDark;
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = C.accent;
              e.target.style.transform = "translateY(0)";
            }}
          >
            Go to Login
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1a1a",
        backgroundImage: `
          radial-gradient(ellipse at 20% 30%, rgba(52,211,153,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(52,211,153,0.04) 0%, transparent 40%),
          radial-gradient(ellipse at 50% 50%, rgba(10,30,30,1) 0%, #061010 100%)
        `,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <FeedNavbar
        user={user}
        onLogout={onLogout}
        onHome={onHome}
        onUserSelect={handleUserSelect}
      />

      {offline && (
        <div
          style={{
            maxWidth: "1400px",
            margin: "16px auto 0",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              background: "rgba(245,158,11,0.12)",
              border: `1px solid rgba(245,158,11,0.3)`,
              color: "#f59e0b",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ⚡ Cannot reach API server. Please make sure backend is running on port 5000.
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: "1400px",
          margin: "20px auto",
          padding: "0 24px 40px",
          display: "grid",
          gridTemplateColumns: "240px 1fr 240px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div>
          <ProfileSidebar
            user={user}
            onEditProfile={() => setShowEditModal(true)}
            onLogout={onLogout}
            onHome={onHome}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
          <CreatePost user={user} onCreate={handleCreatePost} posting={posting} />

          {loading ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: C.cardTextMuted, fontFamily: "'DM Sans', sans-serif" }}>
                Loading posts...
              </p>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>
                {searchQuery ? "🔍" : "📭"}
              </div>
              <p style={{ color: C.cardTextMuted, fontFamily: "'DM Sans', sans-serif" }}>
                {searchQuery
                  ? `No posts found for "${searchQuery}"`
                  : filters.author === "me"
                  ? "You haven't created any posts yet. Share something!"
                  : "No posts yet. Be the first to share something!"}
              </p>
            </Card>
          ) : (
            filteredPosts.map((post) => (
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

        <div>
          <SuggestionsSidebar
            onFilter={handleFilter}
            activeFilter={filters}
            onSearch={handleSearch}
            currentUserId={user?.id}
          />
        </div>
      </div>

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
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a1a1a; }
        ::-webkit-scrollbar-thumb { background: ${C.accent}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.accentDark}; }
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