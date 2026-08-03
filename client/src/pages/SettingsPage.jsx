import React, { useState } from "react";
import {
  User, Mail, MapPin, GraduationCap, Lock,
  LogOut, Trash2, Moon, Sun, ChevronRight,
  Edit2, Shield, Bell, AlertCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "http://localhost:5000/api";

const getTheme = (isDark) => ({
  bg: isDark ? "#12121a" : "#f8faf9",
  card: isDark ? "#1e1e2a" : "#ffffff",
  border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  text: isDark ? "#e8e8f0" : "#1e2922",
  textSec: isDark ? "#a0a0b0" : "#47554b",
  textMut: isDark ? "#6a6a7a" : "#8fa295",
  primary: isDark ? "#34d399" : "#1b6336",
  primaryLight: isDark ? "rgba(52,211,153,0.15)" : "rgba(27,99,54,0.06)",
  danger: "#ef4444",
  dangerLight: "rgba(239,68,68,0.08)",
  success: "#22c55e",
  shadow: isDark ? "0 1px 2px 0 rgba(0,0,0,0.3)" : "0 1px 2px 0 rgba(0,0,0,0.03)",
  radius: "16px",
  radiusSm: "10px",
});

const getStoredToken = () => localStorage.getItem("token") || null;
const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
};

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    onClick={onChange}
    style={{
      width: "44px", height: "24px", borderRadius: "12px", border: "none",
      background: value ? "#1b6336" : "rgba(0,0,0,0.12)",
      cursor: "pointer", transition: "background 0.2s", position: "relative", flexShrink: 0,
    }}
  >
    <div style={{
      width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
      position: "absolute", top: "3px", left: value ? "23px" : "3px",
      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }} />
  </button>
);

// ─── SECTION CARD ─────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children, theme }) => (
  <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: theme.shadow }}>
    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: theme.radiusSm, background: theme.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: theme.primary }}>
        <Icon size={16} />
      </div>
      <span style={{ fontSize: "15px", fontWeight: 600, color: theme.text }}>{title}</span>
    </div>
    <div style={{ padding: "4px 0" }}>{children}</div>
  </div>
);

// ─── SETTINGS ROW ─────────────────────────────────────────────────────────
const Row = ({ label, description, right, onClick, toggle, value, icon: Icon, danger, theme }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", cursor: onClick ? "pointer" : "default",
      borderBottom: `1px solid ${theme.border}`, transition: "background 0.15s",
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = theme.bg; }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.background = "transparent"; }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {Icon && <Icon size={16} color={danger ? theme.danger : theme.textMut} />}
      <div>
        <div style={{ fontSize: "14px", fontWeight: 500, color: danger ? theme.danger : theme.text }}>{label}</div>
        {description && <div style={{ fontSize: "12px", color: theme.textMut, marginTop: "2px" }}>{description}</div>}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {toggle ? (
        <Toggle value={value} onChange={e => { e.stopPropagation(); toggle(); }} />
      ) : right ? (
        <span style={{ fontSize: "13px", color: theme.textMut }}>{right}</span>
      ) : null}
      {onClick && !toggle && <ChevronRight size={15} color={theme.textMut} />}
    </div>
  </div>
);

// ─── PROFILE SETTINGS ─────────────────────────────────────────────────────
const ProfileSettings = ({ user, onUpdate, theme }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), district: district.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const updated = data.user || { ...user, name: name.trim(), bio: bio.trim(), district: district.trim() };
      localStorage.setItem("user", JSON.stringify(updated));
      if (onUpdate) onUpdate(updated);
      setEditing(false);
      setMsg("Profile updated!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Profile Information" icon={User} theme={theme}>
      {msg && (
        <div style={{ padding: "10px 20px", background: msg.includes("Failed") ? theme.dangerLight : "#f0fdf4", color: msg.includes("Failed") ? theme.danger : theme.success, fontSize: "13px" }}>
          {msg}
        </div>
      )}
      {editing ? (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "Name", value: name, setter: setName },
            { label: "District", value: district, setter: setDistrict },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: theme.textSec, display: "block", marginBottom: "5px" }}>{f.label}</label>
              <input
                value={f.value} onChange={e => f.setter(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: "14px", outline: "none", background: theme.bg, color: theme.text, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: theme.textSec, display: "block", marginBottom: "5px" }}>Bio</label>
            <textarea
              value={bio} onChange={e => setBio(e.target.value)} rows={3}
              style={{ width: "100%", padding: "8px 12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: "14px", outline: "none", resize: "vertical", background: theme.bg, color: theme.text, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setEditing(false)} style={{ padding: "8px 16px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, background: "transparent", cursor: "pointer", fontSize: "13px", color: theme.textSec }}>Cancel</button>
            <button onClick={handleSave} disabled={loading} style={{ padding: "8px 20px", borderRadius: theme.radiusSm, border: "none", background: loading ? theme.textMut : theme.primary, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <Row icon={User} label="Name" right={user?.name || "—"} theme={theme} />
          <Row icon={Mail} label="Email" right={user?.email || "—"} theme={theme} />
          <Row icon={GraduationCap} label="University" right={user?.university || "—"} theme={theme} />
          <Row icon={MapPin} label="District" right={user?.district || "—"} theme={theme} />
          <div style={{ padding: "12px 20px" }}>
            <button
              onClick={() => setEditing(true)}
              style={{ padding: "7px 16px", borderRadius: theme.radiusSm, border: `1px solid ${theme.primary}`, background: "transparent", color: theme.primary, cursor: "pointer", fontSize: "13px", fontWeight: 500, display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Edit2 size={13} /> Edit Profile
            </button>
          </div>
        </>
      )}
    </SectionCard>
  );
};

// ─── APPEARANCE ───────────────────────────────────────────────────────────
const AppearanceSettings = ({ isDark, toggleTheme, theme }) => (
  <SectionCard title="Appearance" icon={Moon} theme={theme}>
    <Row
      icon={isDark ? Moon : Sun}
      label="Dark Mode"
      description="Switch between light and dark theme"
      toggle={toggleTheme}
      value={isDark}
      theme={theme}
    />
  </SectionCard>
);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
const NotificationSettings = ({ theme }) => {
  const [notifs, setNotifs] = useState({ comments: true, likes: true, messages: true });
  return (
    <SectionCard title="Notifications" icon={Bell} theme={theme}>
      <Row label="Comments on your posts" toggle={() => setNotifs(p => ({ ...p, comments: !p.comments }))} value={notifs.comments} description="Get notified of new comments" theme={theme} />
      <Row label="Likes" toggle={() => setNotifs(p => ({ ...p, likes: !p.likes }))} value={notifs.likes} description="Get notified when someone likes your post" theme={theme} />
      <Row label="Messages" toggle={() => setNotifs(p => ({ ...p, messages: !p.messages }))} value={notifs.messages} description="Get notified of new messages" theme={theme} />
    </SectionCard>
  );
};

// ─── ACCOUNT ──────────────────────────────────────────────────────────────
const AccountSettings = ({ onLogout, theme }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Log out of PeerConnect?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (onLogout) onLogout();
    }
  };

  return (
    <SectionCard title="Account" icon={Shield} theme={theme}>
      <Row icon={LogOut} label="Log Out" description="Sign out from your account" onClick={handleLogout} theme={theme} />
      <Row icon={Trash2} label="Delete Account" description="Permanently remove your account and data" onClick={() => setShowDeleteConfirm(true)} danger theme={theme} />

      {showDeleteConfirm && (
        <div style={{ margin: "0 20px 16px", padding: "16px", background: theme.dangerLight, borderRadius: theme.radiusSm, border: `1px solid #fca5a5` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <AlertCircle size={16} color={theme.danger} />
            <span style={{ fontWeight: 600, color: theme.danger, fontSize: "14px" }}>Delete your account?</span>
          </div>
          <p style={{ fontSize: "13px", color: theme.textSec, margin: "0 0 12px", lineHeight: 1.5 }}>
            This cannot be undone. All your posts, comments, and profile data will be permanently removed.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: "7px 16px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, background: "transparent", cursor: "pointer", fontSize: "13px", color: theme.textSec }}>
              Cancel
            </button>
            <button
              onClick={() => alert("Account deletion coming soon. Please contact support.")}
              style={{ padding: "7px 16px", borderRadius: theme.radiusSm, border: "none", background: theme.danger, color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

// ─── MAIN SETTINGS PAGE ───────────────────────────────────────────────────
export default function SettingsPage({ onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const [user, setUser] = useState(getStoredUser());

  const handleUpdate = (updated) => {
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: theme.text }}>Settings</h1>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: theme.textMut }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <ProfileSettings user={user} onUpdate={handleUpdate} theme={theme} />
        <AppearanceSettings isDark={isDark} toggleTheme={toggleTheme} theme={theme} />
        <NotificationSettings theme={theme} />
        <AccountSettings onLogout={onLogout} theme={theme} />
      </div>
    </div>
  );
}