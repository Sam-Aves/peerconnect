import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap, MapPin, BookOpen, Heart,
  ThumbsUp, ThumbsDown, Award, Edit2,
  X, Check, Users,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "https://peerconnect-api.onrender.com/api";

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
  successLight: "#f0fdf4",
  shadow: isDark ? "0 1px 2px 0 rgba(0,0,0,0.3)" : "0 1px 2px 0 rgba(0,0,0,0.03)",
  radius: "16px",
  radiusSm: "10px",
});

const getStoredToken = () => localStorage.getItem("token") || null;
const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
};

const initials = (n) => n?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const Avatar = ({ name, size = 40, theme }) => {
  const colors = ["#1b6336", "#134a27", "#10b981", "#065f46", "#0f766e"];
  const idx = name ? name.length % colors.length : 0;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: colors[idx], color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.36,
      border: `2px solid ${theme.border}`, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
};

// ─── TAG CHIP ────────────────────────────────────────────────────────────
const Tag = ({ label, color, bg, onRemove }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: "4px",
    padding: "4px 10px", borderRadius: "50px", fontSize: "12px",
    fontWeight: 500, background: bg, color: color,
    border: `1px solid ${color}22`,
  }}>
    {label}
    {onRemove && (
      <button onClick={onRemove} style={{ border: "none", background: "none", cursor: "pointer", color, padding: 0, display: "flex", alignItems: "center", lineHeight: 1 }}>
        <X size={11} />
      </button>
    )}
  </span>
);

// ─── TAG INPUT ───────────────────────────────────────────────────────────
const TagInput = ({ label, items, setItems, placeholder, color, bg, theme }) => {
  const [val, setVal] = useState("");
  const add = () => {
    const trimmed = val.trim();
    if (trimmed && !items.includes(trimmed)) setItems([...items, trimmed]);
    setVal("");
  };
  return (
    <div>
      <label style={{ fontSize: "12px", fontWeight: 600, color: theme.textSec, display: "block", marginBottom: "6px" }}>{label}</label>
      <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
        <input
          value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          style={{ flex: 1, padding: "8px 12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: "13px", outline: "none", background: theme.bg, color: theme.text }}
        />
        <button onClick={add} style={{ padding: "8px 14px", borderRadius: theme.radiusSm, border: "none", background: color, color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 500 }}>
          Add
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {items.map((item, i) => (
          <Tag key={i} label={item} color={color} bg={bg} onRemove={() => setItems(items.filter(x => x !== item))} />
        ))}
      </div>
    </div>
  );
};

// ─── PROFILE HEADER ──────────────────────────────────────────────────────
const ProfileHeader = ({ user, isOwnProfile, onEdit, theme }) => (
  <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, overflow: "hidden", boxShadow: theme.shadow }}>
    <div style={{ height: "160px", background: `linear-gradient(135deg, ${theme.primary} 0%, #10b981 100%)`, position: "relative" }} />
    <div style={{ padding: "0 24px 24px", marginTop: "-50px", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ border: `4px solid ${theme.card}`, borderRadius: "50%", boxShadow: theme.shadow }}>
          <Avatar name={user?.name} size={96} theme={theme} />
        </div>
        <div style={{ flex: 1, paddingTop: "24px", minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: theme.text }}>{user?.name || "Student"}</h2>
            {user?.verified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "50px", background: theme.successLight, color: theme.success, fontSize: "11px", fontWeight: 600 }}>
                <Check size={11} /> Verified
              </span>
            )}
            {user?.role && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "50px", background: theme.primaryLight, color: theme.primary, fontSize: "11px", fontWeight: 600 }}>
                {user.role}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
            {user?.university && (
              <span style={{ fontSize: "13px", color: theme.textSec, display: "flex", alignItems: "center", gap: "4px" }}>
                <GraduationCap size={14} /> {user.university}
              </span>
            )}
            {user?.district && (
              <span style={{ fontSize: "13px", color: theme.textSec, display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={14} /> {user.district}
              </span>
            )}
          </div>
        </div>
        {isOwnProfile && (
          <button
            onClick={onEdit}
            style={{
              padding: "8px 18px", borderRadius: theme.radiusSm, border: `1px solid ${theme.primary}`,
              background: theme.primary, color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600,
            }}
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: "28px", marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${theme.border}` }}>
        {[
          { label: "Posts", value: user?.postsCount || 0 },
          { label: "Followers", value: user?.followers || 0 },
          { label: "Following", value: user?.following || 0 },
          { label: "Helps Given", value: user?.contribution || 0 },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: theme.text }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: theme.textMut }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── BIO CARD ────────────────────────────────────────────────────────────
const BioCard = ({ user, isOwnProfile, onEdit, theme }) => (
  <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "20px", boxShadow: theme.shadow }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
        <BookOpen size={16} color={theme.primary} /> About
      </h3>
      {isOwnProfile && (
        <button onClick={onEdit} style={{ border: "none", background: "transparent", color: theme.primary, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Edit2 size={13} /> Edit
        </button>
      )}
    </div>
    <p style={{ fontSize: "14px", lineHeight: "1.7", color: user?.bio ? theme.textSec : theme.textMut, margin: 0, fontStyle: user?.bio ? "normal" : "italic" }}>
      {user?.bio || "No bio added yet."}
    </p>
  </div>
);

// ─── INTERESTS CARD ──────────────────────────────────────────────────────
const InterestsCard = ({ interests, isOwnProfile, onEdit, theme }) => (
  <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "20px", boxShadow: theme.shadow }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
        <Heart size={16} color={theme.primary} /> Interests
      </h3>
      {isOwnProfile && (
        <button onClick={onEdit} style={{ border: "none", background: "transparent", color: theme.primary, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Edit2 size={13} /> Edit
        </button>
      )}
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {interests?.length > 0 ? (
        interests.map((item, i) => <Tag key={i} label={item} color={theme.primary} bg={theme.primaryLight} />)
      ) : (
        <span style={{ color: theme.textMut, fontSize: "13px", fontStyle: "italic" }}>No interests added yet.</span>
      )}
    </div>
  </div>
);

// ─── PREFERENCES CARD ────────────────────────────────────────────────────
const PreferencesCard = ({ user, isOwnProfile, onEdit, theme }) => {
  const likes = user?.likes || [];
  const dislikes = user?.dislikes || [];
  return (
    <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "20px", boxShadow: theme.shadow }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
          <ThumbsUp size={16} color={theme.primary} /> Preferences
        </h3>
        {isOwnProfile && (
          <button onClick={onEdit} style={{ border: "none", background: "transparent", color: theme.primary, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Edit2 size={13} /> Edit
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ background: theme.bg, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <ThumbsUp size={14} color={theme.success} />
            <span style={{ fontWeight: 600, fontSize: "12px", color: theme.text }}>Likes</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {likes.length > 0 ? (
              likes.map((item, i) => <Tag key={i} label={item} color={theme.success} bg={theme.successLight} />)
            ) : <span style={{ color: theme.textMut, fontSize: "12px", fontStyle: "italic" }}>None added</span>}
          </div>
        </div>
        <div style={{ background: theme.bg, padding: "12px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <ThumbsDown size={14} color={theme.danger} />
            <span style={{ fontWeight: 600, fontSize: "12px", color: theme.text }}>Dislikes</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {dislikes.length > 0 ? (
              dislikes.map((item, i) => <Tag key={i} label={item} color={theme.danger} bg={theme.dangerLight} />)
            ) : <span style={{ color: theme.textMut, fontSize: "12px", fontStyle: "italic" }}>None added</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ACHIEVEMENTS CARD ───────────────────────────────────────────────────
const AchievementsCard = ({ user, theme }) => {
  const achievements = [];
  if ((user?.postsCount || 0) >= 1) achievements.push({ icon: "✍️", label: "First Post", desc: "Shared your first post" });
  if ((user?.contribution || 0) >= 5) achievements.push({ icon: "🤝", label: "Helping Hand", desc: "Helped 5 students" });
  if ((user?.followers || 0) >= 10) achievements.push({ icon: "⭐", label: "Rising Star", desc: "10 followers reached" });
  if (user?.verified) achievements.push({ icon: "✅", label: "Verified Member", desc: "Identity verified" });
  if ((user?.interests?.length || 0) >= 3) achievements.push({ icon: "🎯", label: "Well-Rounded", desc: "Added 3+ interests" });

  return (
    <div style={{ background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: "20px", boxShadow: theme.shadow }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 600, color: theme.text, display: "flex", alignItems: "center", gap: "8px" }}>
        <Award size={16} color={theme.primary} /> Achievements
      </h3>
      {achievements.length === 0 ? (
        <p style={{ color: theme.textMut, fontSize: "13px", fontStyle: "italic", margin: 0 }}>Complete actions to earn achievements.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
          {achievements.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: theme.bg, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: "22px" }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: theme.text }}>{a.label}</div>
                <div style={{ fontSize: "11px", color: theme.textMut }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── EDIT PROFILE MODAL ──────────────────────────────────────────────────
const EditProfileModal = ({ user, onClose, onSave, theme }) => {
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [interests, setInterests] = useState(user?.interests || []);
  const [likes, setLikes] = useState(user?.likes || []);
  const [dislikes, setDislikes] = useState(user?.dislikes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setLoading(true);
    setError("");
    try {
      const token = getStoredToken();
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        district: district.trim(),
        interests,
        likes,
        dislikes,
      };
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save");
      }
      const data = await res.json();
      const updated = { ...(data.user || user), ...payload };
      localStorage.setItem("user", JSON.stringify(updated));
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err.message || "Could not save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: theme.card, borderRadius: theme.radius, padding: "28px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: `1px solid ${theme.border}` }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: theme.text }}>Edit Profile</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: theme.textMut, display: "flex" }}><X size={22} /></button>
        </div>

        {error && (
          <div style={{ background: theme.dangerLight, border: `1px solid #fca5a5`, color: theme.danger, padding: "10px 14px", borderRadius: theme.radiusSm, fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: theme.textSec, display: "block", marginBottom: "6px" }}>Name *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              style={{ width: "100%", padding: "9px 13px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: "14px", outline: "none", background: theme.bg, color: theme.text, boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: theme.textSec, display: "block", marginBottom: "6px" }}>District</label>
            <input
              value={district} onChange={e => setDistrict(e.target.value)}
              style={{ width: "100%", padding: "9px 13px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: "14px", outline: "none", background: theme.bg, color: theme.text, boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: theme.textSec, display: "block", marginBottom: "6px" }}>Bio</label>
            <textarea
              value={bio} onChange={e => setBio(e.target.value)} rows={3}
              placeholder="Tell other students about yourself..."
              style={{ width: "100%", padding: "9px 13px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, fontSize: "14px", outline: "none", resize: "vertical", background: theme.bg, color: theme.text, boxSizing: "border-box" }}
            />
          </div>

          <TagInput
            label="Interests (press Enter or click Add)"
            items={interests} setItems={setInterests}
            placeholder="e.g. Machine Learning, Football..."
            color={theme.primary} bg={theme.primaryLight} theme={theme}
          />

          <TagInput
            label="Likes"
            items={likes} setItems={setLikes}
            placeholder="e.g. Collaborative study, Coffee..."
            color={theme.success} bg={theme.successLight} theme={theme}
          />

          <TagInput
            label="Dislikes"
            items={dislikes} setItems={setDislikes}
            placeholder="e.g. Last-minute changes..."
            color={theme.danger} bg={theme.dangerLight} theme={theme}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: theme.radiusSm, border: `1px solid ${theme.border}`, background: "transparent", cursor: "pointer", color: theme.textSec, fontSize: "14px" }}>
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={loading}
            style={{ flex: 2, padding: "10px", borderRadius: theme.radiusSm, border: "none", background: loading ? theme.textMut : theme.primary, color: "#fff", fontWeight: 600, cursor: loading ? "default" : "pointer", fontSize: "14px" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN PROFILE PAGE ───────────────────────────────────────────────────
export default function ProfilePage({ userId }) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const token = getStoredToken();

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const isMe = !userId || userId === "me";
      const url = isMe ? `${API_BASE}/users/me` : `${API_BASE}/users/${userId}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const userData = data.user || data;
      if (isMe) {
        const stored = getStoredUser() || {};
        const merged = { ...stored, ...userData };
        setUser(merged);
        setIsOwnProfile(true);
      } else {
        setUser(userData);
        setIsOwnProfile(getStoredUser()?.id === userData.id || getStoredUser()?._id === userData._id);
      }
    } catch {
      const stored = getStoredUser();
      if (stored) { setUser(stored); setIsOwnProfile(true); }
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  if (loading) {
    return <div style={{ padding: "48px", textAlign: "center", color: theme.textMut, background: theme.card, borderRadius: theme.radius, border: `1px solid ${theme.border}` }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} onEdit={() => setShowEdit(true)} theme={theme} />
        <BioCard user={user} isOwnProfile={isOwnProfile} onEdit={() => setShowEdit(true)} theme={theme} />
        <InterestsCard interests={user?.interests} isOwnProfile={isOwnProfile} onEdit={() => setShowEdit(true)} theme={theme} />
        <PreferencesCard user={user} isOwnProfile={isOwnProfile} onEdit={() => setShowEdit(true)} theme={theme} />
        <AchievementsCard user={user} theme={theme} />
      </div>

      {showEdit && (
        <EditProfileModal user={user} onClose={() => setShowEdit(false)} onSave={handleUpdate} theme={theme} />
      )}
    </div>
  );
}
