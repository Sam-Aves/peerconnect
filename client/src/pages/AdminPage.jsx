import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:5000/api";
const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, ""); // e.g. http://localhost:5000 — used to resolve uploaded file paths

// ─── COLOUR & DESIGN TOKENS ───────────────────────────────────────────────────
const T = {
  s0: "#f5f4f1", s1: "#f0efe9", s2: "#ffffff",
  tPri: "#18181b", tSec: "#52525b", tMut: "#a1a1aa",
  bd: "rgba(0,0,0,0.08)", bdStr: "rgba(0,0,0,0.14)",
  sidebar: "#021a12", sidebarMid: "#042C1F", sidebarActive: "#063322",
  sidebarAccent: "#34d399", sidebarText: "#a7c9b4", sidebarTextDim: "#4a7a5e",
  accent: "#2563eb", accentBg: "#eff6ff", accentBd: "#bfdbfe",
  success: "#16a34a", successBg: "#f0fdf4", successBd: "#bbf7d0",
  warning: "#d97706", warningBg: "#fffbeb", warningBd: "#fde68a",
  danger: "#dc2626", dangerBg: "#fef2f2", dangerBd: "#fecaca",
  radius: "8px", radiusLg: "12px",
};

// ─── FALLBACK DATA (chats only — chat feature is not implemented server-side yet) ─
const MOCK_CHATS = [
  { _id: "c1", participants: ["Rakib Hasan", "Fahmida Islam"], flagged: true, reason: "Suspected grooming behaviour — escalating personal requests", lastMessage: "Just meet me privately, no one needs to know", lastAt: "2026-08-03T18:55:00Z", messageCount: 47 },
  { _id: "c2", participants: ["Tia Raj", "Jia Khan"], flagged: false, reason: null, lastMessage: "Thanks for the notes, really helped!", lastAt: "2026-08-03T16:10:00Z", messageCount: 12 },
  { _id: "c3", participants: ["Anonymous", "Tasnim Sultana"], flagged: true, reason: "Abusive language, threatening tone", lastMessage: "You'll regret posting that…", lastAt: "2026-08-02T22:04:00Z", messageCount: 23 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " · " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const initials = (name = "?") => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const avatarBg = (name = "?") => {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
  return ["#dbeafe","#d1fae5","#fef3c7","#fce7f3","#ede9fe","#e0f2fe"][h];
};
const avatarFg = (name = "?") => {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 6;
  return ["#1e40af","#065f46","#92400e","#9d174d","#5b21b6","#0c4a6e"][h];
};


const fileUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  const withFolder = clean.startsWith("uploads/") ? clean : `uploads/${clean}`;
  return `${SERVER_ORIGIN}/${withFolder}`;
};

const authHeaders = (json = true) => {
  const token = localStorage.getItem("token");
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const roleVariant = (r) => ({ seeker: "accent", helper: "success", both: "dark" }[(r || "").toLowerCase()] || "neutral");

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: avatarBg(name), color: avatarFg(name),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.36, fontWeight: 500, flexShrink: 0,
    border: `0.5px solid ${T.bd}`,
  }}>
    {initials(name)}
  </div>
);

const Badge = ({ label, variant = "neutral", dot = false }) => {
  const styles = {
    neutral:  { bg: T.s1,       color: T.tSec,    bd: T.bd },
    success:  { bg: T.successBg, color: T.success, bd: T.successBd },
    warning:  { bg: T.warningBg, color: T.warning, bd: T.warningBd },
    danger:   { bg: T.dangerBg,  color: T.danger,  bd: T.dangerBd },
    accent:   { bg: T.accentBg,  color: T.accent,  bd: T.accentBd },
    dark:     { bg: T.tPri,      color: "#fff",     bd: "transparent" },
  };
  const s = styles[variant] || styles.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color, border: `0.5px solid ${s.bd}`,
      borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 500,
      whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />}
      {label}
    </span>
  );
};

const Btn = ({ children, onClick, variant = "ghost", disabled = false, size = "md", danger: isDanger }) => {
  const [hov, setHov] = useState(false);
  const pad = { sm: "4px 10px", md: "7px 14px", lg: "9px 18px" }[size];
  const fs  = { sm: 12, md: 13, lg: 14 }[size];

  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: pad, fontSize: fs, fontWeight: 500, border: "none",
    borderRadius: T.radius, cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s", opacity: disabled ? 0.5 : 1, whiteSpace: "nowrap",
  };

  const variants = {
    ghost:    { bg: hov ? T.s1 : "transparent", color: T.tSec, bd: `0.5px solid ${hov ? T.bdStr : T.bd}` },
    solid:    { bg: hov ? "#1d4ed8" : T.accent,  color: "#fff",  bd: "none" },
    danger:   { bg: hov ? "#b91c1c" : T.danger,  color: "#fff",  bd: "none" },
    outline:  { bg: hov ? T.dangerBg : "transparent", color: T.danger, bd: `0.5px solid ${T.dangerBd}` },
    success:  { bg: hov ? "#15803d" : T.success, color: "#fff",  bd: "none" },
  };

  const v = isDanger ? variants.outline : (variants[variant] || variants.ghost);

  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, background: v.bg, color: v.color, border: v.bd, boxShadow: "none" }}>
      {children}
    </button>
  );
};

const Divider = () => <div style={{ height: "0.5px", background: T.bd, margin: "4px 0" }} />;

const StatCard = ({ label, value, sub, accent, loading }) => (
  <div style={{
    background: T.s2, border: `0.5px solid ${T.bd}`, borderRadius: T.radiusLg,
    padding: "16px 18px", display: "flex", flexDirection: "column", gap: 4,
  }}>
    <span style={{ fontSize: 12, color: T.tMut, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    <span style={{ fontSize: 28, fontWeight: 500, color: accent || T.tPri, lineHeight: 1.1 }}>{loading ? "—" : value}</span>
    {sub && <span style={{ fontSize: 12, color: T.tSec }}>{sub}</span>}
  </div>
);

const EmptyState = ({ icon, title, body }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "48px 24px", color: T.tMut }}>
    <span style={{ fontSize: 40 }}>{icon}</span>
    <span style={{ fontSize: 15, fontWeight: 500, color: T.tSec }}>{title}</span>
    {body && <span style={{ fontSize: 13, textAlign: "center" }}>{body}</span>}
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div style={{
    margin: 16, background: T.dangerBg, border: `0.5px solid ${T.dangerBd}`,
    borderRadius: T.radiusLg, padding: "12px 16px", display: "flex",
    alignItems: "center", justifyContent: "space-between", gap: 12,
  }}>
    <span style={{ fontSize: 13, color: T.danger }}>⚑ {message}</span>
    {onRetry && <Btn size="sm" variant="danger" onClick={onRetry}>Retry</Btn>}
  </div>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  const bg = type === "success" ? T.success : type === "danger" ? T.danger : T.tPri;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: bg, color: "#fff", padding: "10px 18px",
      borderRadius: T.radiusLg, fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 16px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "success" ? "✓" : type === "danger" ? "✕" : "ℹ"} {msg}
    </div>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ title, children, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.45)", display: "flex",
    alignItems: "center", justifyContent: "center", padding: 20,
  }} onClick={onClose}>
    <div style={{
      background: T.s2, borderRadius: T.radiusLg, border: `0.5px solid ${T.bd}`,
      maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto",
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: `0.5px solid ${T.bd}` }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: T.tPri }}>{title}</span>
        <Btn onClick={onClose} size="sm">✕</Btn>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  </div>
);

const Confirm = ({ title, body, confirmLabel, variant = "danger", onConfirm, onCancel, busy }) => (
  <Modal title={title} onClose={onCancel}>
    <p style={{ fontSize: 14, color: T.tSec, lineHeight: 1.7, marginBottom: 20 }}>{body}</p>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Btn onClick={onCancel} disabled={busy}>Cancel</Btn>
      <Btn onClick={onConfirm} variant={variant} disabled={busy}>{busy ? "Working…" : confirmLabel}</Btn>
    </div>
  </Modal>
);

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview",  icon: "⬡", label: "Overview" },
  { id: "verify",    icon: "◈", label: "Identity verification" },
  { id: "posts",     icon: "▦", label: "Content moderation" },
  { id: "chats",     icon: "◉", label: "Chat monitoring" },
  { id: "users",     icon: "◎", label: "User management" },
];

const Sidebar = ({ active, setActive, onLogout, pendingCount, flaggedPosts, flaggedChats }) => {
  const badges = { verify: pendingCount, posts: flaggedPosts, chats: flaggedChats };
  return (
    <aside style={{
      width: 220, flexShrink: 0, background: T.sidebar,
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
    }}>
      <div style={{ padding: "20px 18px 14px", borderBottom: `0.5px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: T.sidebarActive,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.sidebarAccent, fontSize: 16, border: `0.5px solid rgba(52,211,153,0.25)`,
          }}>Ω</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: T.sidebarAccent, letterSpacing: "-0.01em" }}>PeerConnect</div>
            <div style={{ fontSize: 10, color: T.sidebarTextDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin suite</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
        <div style={{ fontSize: 10, color: T.sidebarTextDim, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 8px 4px", marginBottom: 2 }}>Navigation</div>
        {NAV.map(({ id, icon, label }) => {
          const isActive = active === id;
          const badgeCount = badges[id] || 0;
          return (
            <button key={id} onClick={() => setActive(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: T.radius, border: "none",
              background: isActive ? T.sidebarActive : "transparent",
              color: isActive ? T.sidebarAccent : T.sidebarText,
              fontSize: 13, fontWeight: isActive ? 500 : 400,
              cursor: "pointer", textAlign: "left", marginBottom: 1,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 15, opacity: isActive ? 1 : 0.7 }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {badgeCount > 0 && (
                <span style={{
                  background: isActive ? T.sidebarAccent : "rgba(52,211,153,0.15)",
                  color: isActive ? T.sidebar : T.sidebarAccent,
                  fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 10,
                }}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{
        padding: "12px 14px", borderTop: `0.5px solid rgba(255,255,255,0.06)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", background: T.sidebarActive,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: T.sidebarAccent, fontWeight: 500,
          }}>AD</div>
          <div>
            <div style={{ fontSize: 12, color: T.sidebarText, fontWeight: 500 }}>Root admin</div>
            <div style={{ fontSize: 10, color: T.sidebarAccent }}>● System active</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          background: "transparent", border: "none", color: T.sidebarTextDim,
          cursor: "pointer", fontSize: 14, padding: 4, borderRadius: 6,
          transition: "color 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
          onMouseLeave={e => e.currentTarget.style.color = T.sidebarTextDim}
          title="Sign out"
        >⏻</button>
      </div>
    </aside>
  );
};

const TopBar = ({ title, subtitle, children }) => (
  <header style={{
    height: 60, background: T.s2, borderBottom: `0.5px solid ${T.bd}`,
    display: "flex", alignItems: "center", padding: "0 24px",
    flexShrink: 0, gap: 12,
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 15, fontWeight: 500, color: T.tPri }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: T.tMut }}>{subtitle}</div>}
    </div>
    {children}
  </header>
);

const SearchInput = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative" }}>
    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.tMut, fontSize: 14 }}>⌕</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "Search…"}
      style={{
        padding: "7px 12px 7px 30px", fontSize: 13, color: T.tPri,
        background: T.s1, border: `0.5px solid ${T.bd}`,
        borderRadius: T.radius, outline: "none", width: 240,
      }}
    />
  </div>
);

// ─── OVERVIEW PAGE ────────────────────────────────────────────────────────────
const Overview = ({ stats, statsLoading, setActive }) => (
  <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
      <StatCard label="Total users" value={stats.totalUsers} sub={`+${stats.newToday || 0} today`} loading={statsLoading} />
      <StatCard label="Pending verification" value={stats.pendingVerification} accent={stats.pendingVerification > 0 ? T.warning : T.success} sub="Awaiting review" loading={statsLoading} />
      <StatCard label="Verified today" value={stats.verifiedToday} sub="By admins" accent={T.success} loading={statsLoading} />
      <StatCard label="Active posts" value={stats.activePosts} sub="On the platform" loading={statsLoading} />
      <StatCard label="Flagged content" value={stats.flaggedPosts + stats.flaggedChats} accent={(stats.flaggedPosts + stats.flaggedChats) > 0 ? T.danger : T.success} sub="Posts & chats" loading={statsLoading} />
      <StatCard label="Resolved today" value={stats.resolvedToday} accent={T.success} sub="Cases closed" loading={statsLoading} />
    </div>

    <div style={{ fontSize: 12, color: T.tMut, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Quick actions</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {[
        { id: "verify",  icon: "◈", label: "Review pending verifications", count: stats.pendingVerification, variant: "warning" },
        { id: "posts",   icon: "▦", label: "Moderate flagged posts",        count: stats.flaggedPosts,        variant: "danger" },
        { id: "chats",   icon: "◉", label: "Review flagged chats",          count: stats.flaggedChats,        variant: "danger" },
        { id: "users",   icon: "◎", label: "Manage user accounts",          count: stats.totalUsers,          variant: "accent" },
      ].map(({ id, icon, label, count, variant }) => {
        const colors = {
          warning: { bg: T.warningBg, bd: T.warningBd, color: T.warning },
          danger:  { bg: T.dangerBg,  bd: T.dangerBd,  color: T.danger },
          accent:  { bg: T.accentBg,  bd: T.accentBd,  color: T.accent },
        }[variant];
        return (
          <button key={id} onClick={() => setActive(id)} style={{
            background: T.s2, border: `0.5px solid ${T.bd}`, borderRadius: T.radiusLg,
            padding: "16px 18px", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.bdStr}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.bd}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.bg, border: `0.5px solid ${colors.bd}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: colors.color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.tPri, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 12, color: colors.color, fontWeight: 500 }}>{count || 0} item{count !== 1 ? "s" : ""}</div>
            </div>
          </button>
        );
      })}
    </div>

    <div style={{ marginTop: 24, background: T.s2, border: `0.5px solid ${T.bd}`, borderRadius: T.radiusLg, padding: "14px 18px" }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: T.tPri, marginBottom: 8 }}>Platform health</div>
      {[
        { label: "Identity queue",    val: stats.pendingVerification, max: 20, color: T.warning },
        { label: "Flagged content",   val: stats.flaggedPosts + stats.flaggedChats, max: 10, color: T.danger },
        { label: "Resolved cases",    val: stats.resolvedToday, max: 20, color: T.success },
      ].map(({ label, val, max, color }) => (
        <div key={label} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: T.tSec }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color }}>{val || 0}</span>
          </div>
          <div style={{ height: 4, background: T.s1, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(((val || 0) / max) * 100, 100)}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── IDENTITY VERIFICATION ────────────────────────────────────────────────────
const VerifyPage = ({ users, loading, error, onRetry, onVerify, onReject, busyId }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (!selectedId && users.length) setSelectedId(users[0]._id);
    if (selectedId && !users.find(u => u._id === selectedId)) setSelectedId(users[0]?._id || null);
  }, [users]);

  const selected = users.find(u => u._id === selectedId) || null;

  const filtered = users.filter(u =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ flex: 1, display: "flex" }}><EmptyState icon="◈" title="Loading queue…" /></div>;
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "100%" }}>
      <div style={{ width: 280, flexShrink: 0, borderRight: `0.5px solid ${T.bd}`, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: `0.5px solid ${T.bd}`, flexShrink: 0 }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search queue…" />
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0
            ? <EmptyState icon="◎" title="Queue empty" body="No pending verifications" />
            : filtered.map(u => (
              <button key={u._id} onClick={() => setSelectedId(u._id)} style={{
                width: "100%", textAlign: "left", padding: "12px 14px",
                background: selectedId === u._id ? T.accentBg : "transparent",
                borderLeft: `3px solid ${selectedId === u._id ? T.accent : "transparent"}`,
                border: "none", borderTop: `0.5px solid ${T.bd}`, cursor: "pointer",
                transition: "background 0.12s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={u.name} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.tPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: T.tMut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                  </div>
                  <Badge label={(u.role || "?").toUpperCase()} variant={roleVariant(u.role)} />
                </div>
              </button>
            ))}
        </div>
      </div>

      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `0.5px solid ${T.bd}`, flexShrink: 0, background: T.s2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={selected.name} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16, fontWeight: 500, color: T.tPri }}>{selected.name}</span>
                  <Badge label={(selected.role || "?").toUpperCase()} variant={roleVariant(selected.role)} />
                  <Badge label="Pending verification" variant="warning" dot />
                </div>
                <div style={{ fontSize: 13, color: T.tSec, marginTop: 3 }}>{selected.email}</div>
              </div>
              <div style={{ fontSize: 11, color: T.tMut, textAlign: "right" }}>
                <div>{selected.university}</div>
                <div>{selected.district}</div>
                <div style={{ marginTop: 4 }}>Applied {fmtDate(selected.createdAt)}</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ fontSize: 12, color: T.tMut, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Uploaded identity document</div>
            <div style={{ background: T.s1, border: `0.5px solid ${T.bd}`, borderRadius: T.radiusLg, overflow: "hidden", maxWidth: 640 }}>
              {fileUrl(selected.id_card_photo) ? (
                <img src={fileUrl(selected.id_card_photo)} alt="Student ID document"
                  style={{ width: "100%", display: "block", objectFit: "contain" }} />
              ) : (
                <div style={{ padding: "40px 20px", textAlign: "center", color: T.tMut }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⚠</div>
                  <div style={{ fontSize: 13 }}>No ID document on file for this user</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, maxWidth: 640 }}>
              {[
                ["Full name", selected.name],
                ["Email", selected.email],
                ["University", selected.university],
                ["District", selected.district],
                ["Role", selected.role],
              ].map(([k, v]) => (
                <div key={k} style={{ background: T.s2, border: `0.5px solid ${T.bd}`, borderRadius: T.radius, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: T.tMut, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.tPri, wordBreak: "break-all" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: "14px 24px", borderTop: `0.5px solid ${T.bd}`,
            background: T.s2, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flexShrink: 0,
          }}>
            <Btn onClick={() => setConfirm({ type: "reject", user: selected })} variant="outline" danger disabled={busyId === selected._id}>✕ Deny & remove</Btn>
            <Btn onClick={() => setConfirm({ type: "verify", user: selected })} variant="success" disabled={busyId === selected._id}>✓ Verify credentials</Btn>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex" }}>
          <EmptyState icon="◈" title="Select a user" body="Choose from the queue to inspect their credentials" />
        </div>
      )}

      {confirm && (
        <Confirm
          title={confirm.type === "verify" ? "Verify this user?" : "Deny and remove user?"}
          body={confirm.type === "verify"
            ? `${confirm.user.name} will be granted full platform access. Make sure the uploaded ID matches their stated details.`
            : `${confirm.user.name}'s account and all their data will be permanently removed. This cannot be undone.`}
          confirmLabel={confirm.type === "verify" ? "Verify" : "Deny & remove"}
          variant={confirm.type === "verify" ? "success" : "danger"}
          busy={busyId === confirm.user._id}
          onConfirm={() => { confirm.type === "verify" ? onVerify(confirm.user._id) : onReject(confirm.user._id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

// ─── CONTENT MODERATION ───────────────────────────────────────────────────────
const PostsPage = ({ posts, loading, error, onRetry, onDelete, onFlag, onClear }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirm, setConfirm] = useState(null);
  const [detail, setDetail] = useState(null);

  const isFlagged = (p) => p.status === "reported";

  const visible = posts.filter(p => {
    if (filter === "flagged" && !isFlagged(p)) return false;
    if (filter === "clean" && isFlagged(p)) return false;
    return !search || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.authorName || "").toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div style={{ flex: 1, display: "flex" }}><EmptyState icon="▦" title="Loading posts…" /></div>;
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "12px 24px", borderBottom: `0.5px solid ${T.bd}`, background: T.s2, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search posts…" />
        <div style={{ display: "flex", gap: 1, background: T.s1, border: `0.5px solid ${T.bd}`, borderRadius: T.radius, overflow: "hidden" }}>
          {[["all","All"],["flagged","Flagged"],["clean","Clean"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: "6px 14px", fontSize: 12, border: "none", cursor: "pointer",
              background: filter === val ? T.s2 : "transparent",
              color: filter === val ? T.tPri : T.tSec,
              fontWeight: filter === val ? 500 : 400, transition: "all 0.12s",
            }}>{lbl}</button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: T.tMut, marginLeft: "auto" }}>{visible.length} posts</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {visible.length === 0
          ? <EmptyState icon="▦" title="No posts" body="No posts match your filter" />
          : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${T.bd}`, background: T.s1 }}>
                {["Status","Post","Author & time","Category","Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: T.tMut, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(post => (
                <tr key={post._id} style={{ borderBottom: `0.5px solid ${T.bd}` }}
                  onMouseEnter={e => e.currentTarget.style.background = T.s1}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                    {isFlagged(post)
                      ? <Badge label="Flagged" variant="danger" dot />
                      : <Badge label="Clean" variant="success" dot />}
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "top", maxWidth: 320 }}>
                    <div style={{ fontWeight: 500, color: T.tPri, marginBottom: 3, wordBreak: "break-word" }}>{post.title}</div>
                    <div style={{ fontSize: 12, color: T.tSec, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.description}</div>
                    {post.reportReason && (
                      <div style={{ fontSize: 11, color: T.danger, marginTop: 4, background: T.dangerBg, padding: "3px 8px", borderRadius: 4, border: `0.5px solid ${T.dangerBd}` }}>
                        ⚑ {post.reportReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 500, color: T.tPri }}>{post.is_anonymous ? "Anonymous" : post.authorName}</div>
                    <div style={{ fontSize: 11, color: T.tMut, marginTop: 2 }}>{fmtDate(post.createdAt)}</div>
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    <Badge label={(post.category || "").toUpperCase()} variant="neutral" />
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <Btn onClick={() => setDetail(post)} size="sm">View</Btn>
                      {isFlagged(post)
                        ? <Btn onClick={() => onClear(post._id)} size="sm" variant="ghost">Clear flag</Btn>
                        : <Btn onClick={() => onFlag(post._id)} size="sm" variant="ghost">Flag</Btn>}
                      <Btn onClick={() => setConfirm(post)} size="sm" danger>Purge</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirm && (
        <Confirm
          title="Purge this post?"
          body={`"${confirm.title}" by ${confirm.authorName} will be permanently removed. This cannot be undone.`}
          confirmLabel="Purge post"
          variant="danger"
          onConfirm={() => { onDelete(confirm._id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
      {detail && (
        <Modal title="Post detail" onClose={() => setDetail(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge label={isFlagged(detail) ? "Flagged" : "Clean"} variant={isFlagged(detail) ? "danger" : "success"} dot />
              <Badge label={detail.category} />
              <Badge label={detail.type} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: T.tPri }}>{detail.title}</div>
            <div style={{ fontSize: 13, color: T.tSec, lineHeight: 1.7 }}>{detail.description}</div>
            {detail.reportReason && (
              <div style={{ background: T.dangerBg, border: `0.5px solid ${T.dangerBd}`, borderRadius: T.radius, padding: "10px 14px", fontSize: 13, color: T.danger }}>
                ⚑ Flag reason: {detail.reportReason}
              </div>
            )}
            <Divider />
            <div style={{ fontSize: 12, color: T.tSec }}>
              <strong style={{ color: T.tPri }}>Author:</strong> {detail.is_anonymous ? "Anonymous" : detail.authorName} &nbsp;·&nbsp; {fmtDate(detail.createdAt)}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── CHAT MONITORING (placeholder data — chat feature not implemented yet) ────
const ChatsPage = ({ chats, onDismiss, onBan }) => {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const visible = chats.filter(c => {
    if (filter === "flagged" && !c.flagged) return false;
    if (filter === "clean" && c.flagged) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ width: 300, flexShrink: 0, borderRight: `0.5px solid ${T.bd}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "10px 14px 0", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: T.tMut, background: T.warningBg, border: `0.5px solid ${T.warningBd}`, borderRadius: T.radius, padding: "6px 8px", marginBottom: 8 }}>
            ⚑ Showing sample data — live chat monitoring isn't wired up yet
          </div>
        </div>
        <div style={{ padding: "0 14px 12px", display: "flex", gap: 6, flexShrink: 0 }}>
          {[["all","All"],["flagged","Flagged"],["clean","Clean"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              flex: 1, padding: "5px 8px", fontSize: 11, border: "none", cursor: "pointer",
              background: filter === val ? T.tPri : T.s1,
              color: filter === val ? "#fff" : T.tSec,
              borderRadius: T.radius, fontWeight: filter === val ? 500 : 400, transition: "all 0.12s",
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {visible.map(chat => (
            <button key={chat._id} onClick={() => setSelected(chat)} style={{
              width: "100%", textAlign: "left", padding: "13px 14px",
              background: selected?._id === chat._id ? T.accentBg : "transparent",
              borderLeft: `3px solid ${selected?._id === chat._id ? T.accent : "transparent"}`,
              border: "none", borderTop: `0.5px solid ${T.bd}`,
              cursor: "pointer", transition: "background 0.12s",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 13, color: T.tPri }}>{chat.participants.join(" · ")}</div>
                {chat.flagged && <Badge label="Flagged" variant="danger" dot />}
              </div>
              <div style={{ fontSize: 12, color: T.tSec, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{chat.lastMessage}</div>
              <div style={{ fontSize: 11, color: T.tMut, marginTop: 4 }}>{fmtDate(chat.lastAt)} · {chat.messageCount} messages</div>
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: `0.5px solid ${T.bd}`, background: T.s2, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 500, color: T.tPri }}>{selected.participants.join(" ↔ ")}</span>
              {selected.flagged && <Badge label="Flagged" variant="danger" dot />}
            </div>
            <div style={{ fontSize: 12, color: T.tMut }}>{selected.messageCount} messages total · last activity {fmtDate(selected.lastAt)}</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            {selected.reason && (
              <div style={{ background: T.dangerBg, border: `0.5px solid ${T.dangerBd}`, borderRadius: T.radius, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.danger, marginBottom: 4 }}>⚑ Flag reason</div>
                <div style={{ fontSize: 13, color: T.tSec }}>{selected.reason}</div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: T.tMut, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Last message preview</div>
              {[
                { from: selected.participants[0], msg: "Hey, are you still looking for study help?", mine: false },
                { from: selected.participants[1], msg: "Yes, thanks for reaching out!", mine: true },
                { from: selected.participants[0], msg: selected.lastMessage, mine: false, flag: selected.flagged },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: m.mine ? "row-reverse" : "row", gap: 8 }}>
                  <Avatar name={m.from} size={28} />
                  <div style={{
                    maxWidth: "65%", background: m.flag ? T.dangerBg : (m.mine ? T.accentBg : T.s2),
                    border: `0.5px solid ${m.flag ? T.dangerBd : (m.mine ? T.accentBd : T.bd)}`,
                    borderRadius: 10, padding: "8px 12px",
                  }}>
                    <div style={{ fontSize: 10, color: T.tMut, marginBottom: 4 }}>{m.from}</div>
                    <div style={{ fontSize: 13, color: m.flag ? T.danger : T.tPri }}>{m.msg}</div>
                    {m.flag && <div style={{ fontSize: 11, color: T.danger, marginTop: 4 }}>⚑ Flagged message</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "14px 24px", borderTop: `0.5px solid ${T.bd}`, background: T.s2, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
            {selected.flagged && <Btn onClick={() => onDismiss(selected._id)} variant="ghost">Dismiss flag</Btn>}
            <Btn onClick={() => setConfirm(selected)} variant="danger">Ban participants</Btn>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex" }}>
          <EmptyState icon="◉" title="Select a conversation" body="Choose a chat thread to review its content" />
        </div>
      )}

      {confirm && (
        <Confirm
          title="Ban chat participants?"
          body={`${confirm.participants.join(" and ")} will be suspended from the platform. This is a significant action — confirm only if the conversation contains genuine abuse.`}
          confirmLabel="Ban participants"
          variant="danger"
          onConfirm={() => { onBan(confirm._id); setConfirm(null); setSelected(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
const UsersPage = ({ users, loading, error, onRetry, onToast }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const visible = users.filter(u => {
    if (filter === "verified" && !u.verified) return false;
    if (filter === "pending" && u.verified) return false;
    return !search || (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div style={{ flex: 1, display: "flex" }}><EmptyState icon="◎" title="Loading users…" /></div>;
  if (error) return <ErrorBanner message={error} onRetry={onRetry} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "12px 24px", borderBottom: `0.5px solid ${T.bd}`, background: T.s2, display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search users…" />
        <div style={{ display: "flex", gap: 1, background: T.s1, border: `0.5px solid ${T.bd}`, borderRadius: T.radius, overflow: "hidden" }}>
          {[["all","All"],["verified","Verified"],["pending","Pending"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: "6px 14px", fontSize: 12, border: "none", cursor: "pointer",
              background: filter === val ? T.s2 : "transparent",
              color: filter === val ? T.tPri : T.tSec,
              fontWeight: filter === val ? 500 : 400, transition: "all 0.12s",
            }}>{lbl}</button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: T.tMut, marginLeft: "auto" }}>{visible.length} users</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${T.bd}`, background: T.s1 }}>
              {["User","Email","University","District","Role","Status","Contributions","Joined","Actions"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 500, color: T.tMut, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(u => (
              <tr key={u._id} style={{ borderBottom: `0.5px solid ${T.bd}` }}
                onMouseEnter={e => e.currentTarget.style.background = T.s1}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={u.name} size={30} />
                    <span style={{ fontWeight: 500, color: T.tPri, whiteSpace: "nowrap" }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: "10px 14px", color: T.tSec, verticalAlign: "middle", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
                <td style={{ padding: "10px 14px", color: T.tSec, verticalAlign: "middle", whiteSpace: "nowrap" }}>{u.university}</td>
                <td style={{ padding: "10px 14px", color: T.tSec, verticalAlign: "middle", whiteSpace: "nowrap" }}>{u.district}</td>
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <Badge label={(u.role || "?").toUpperCase()} variant={roleVariant(u.role)} />
                </td>
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <Badge label={u.verified ? "Verified" : "Pending"} variant={u.verified ? "success" : "warning"} dot />
                </td>
                <td style={{ padding: "10px 14px", verticalAlign: "middle", color: T.tSec, textAlign: "center" }}>{u.contribution ?? 0}</td>
                <td style={{ padding: "10px 14px", color: T.tMut, verticalAlign: "middle", whiteSpace: "nowrap" }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                  <Btn size="sm" onClick={() => onToast(`Viewing ${u.name}`, "neutral")}>Profile</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <EmptyState icon="◎" title="No users found" body="Try adjusting your search or filter" />}
      </div>
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");

  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  const [chats, setChats] = useState(MOCK_CHATS); // placeholder until chat backend exists

  const [stats, setStats] = useState({
    totalUsers: 0, pendingVerification: 0, verifiedToday: 0,
    activePosts: 0, flaggedPosts: 0, resolvedToday: 0, newToday: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "success") => setToast({ msg, type, key: Date.now() }), []);

  // ── Data fetching ──────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      // stats are non-critical; fail quietly and keep zeros
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchPendingUsers = useCallback(async () => {
    setPendingLoading(true); setPendingError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users?status=pending`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Could not reach the server for pending verifications");
      const data = await res.json();
      setPendingUsers(data);
    } catch (e) {
      setPendingError(e.message);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setUsersLoading(true); setUsersError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users?status=all`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Could not reach the server for user list");
      const data = await res.json();
      setAllUsers(data);
    } catch (e) {
      setUsersError(e.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true); setPostsError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/posts`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Could not reach the server for posts");
      const data = await res.json();
      setPosts(data);
    } catch (e) {
      setPostsError(e.message);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPendingUsers();
    fetchAllUsers();
    fetchPosts();
  }, [fetchStats, fetchPendingUsers, fetchAllUsers, fetchPosts]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleVerify = async (id) => {
    setBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}/verify`, { method: "PATCH", headers: authHeaders() });
      if (!res.ok) throw new Error();
      setPendingUsers(p => p.filter(u => u._id !== id));
      setAllUsers(u => u.map(x => x._id === id ? { ...x, verified: true } : x));
      showToast("User verified and granted platform access", "success");
      fetchStats();
    } catch {
      showToast("Couldn't verify user — check the server connection", "danger");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      setPendingUsers(p => p.filter(u => u._id !== id));
      setAllUsers(u => u.filter(x => x._id !== id));
      showToast("User denied and removed", "danger");
      fetchStats();
    } catch {
      showToast("Couldn't remove user — check the server connection", "danger");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/posts/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error();
      setPosts(p => p.filter(x => x._id !== id));
      showToast("Post permanently removed", "danger");
      fetchStats();
    } catch {
      showToast("Couldn't delete post — check the server connection", "danger");
    }
  };

  const handleFlagPost = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/posts/${id}/flag`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ reason: "Flagged by admin" }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPosts(p => p.map(x => x._id === id ? updated : x));
      showToast("Post flagged for review", "success");
      fetchStats();
    } catch {
      showToast("Couldn't flag post — check the server connection", "danger");
    }
  };

  const handleClearFlag = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/admin/posts/${id}/clear-flag`, { method: "PATCH", headers: authHeaders() });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPosts(p => p.map(x => x._id === id ? updated : x));
      showToast("Flag cleared", "success");
      fetchStats();
    } catch {
      showToast("Couldn't clear flag — check the server connection", "danger");
    }
  };

  // Chat actions stay local — no backend yet
  const handleDismissChat = (id) => {
    setChats(c => c.map(x => x._id === id ? { ...x, flagged: false, reason: null } : x));
    showToast("Flag dismissed", "success");
  };
  const handleBan = (id) => {
    setChats(c => c.filter(x => x._id !== id));
    showToast("Participants banned and conversation removed", "danger");
  };

  const flaggedPostsCount = posts.filter(p => p.status === "reported").length;
  const flaggedChatsCount = chats.filter(c => c.flagged).length;

  const PAGE_TITLES = {
    overview: { title: "Overview", subtitle: "Platform health at a glance" },
    verify:   { title: "Identity verification", subtitle: "Review pending student accounts" },
    posts:    { title: "Content moderation", subtitle: "Review and moderate posts" },
    chats:    { title: "Chat monitoring", subtitle: "Monitor conversations for abuse" },
    users:    { title: "User management", subtitle: "View and manage all users" },
  };
  const pt = PAGE_TITLES[tab] || PAGE_TITLES.overview;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif", background: T.s0 }}>
      <Sidebar
        active={tab} setActive={setTab}
        onLogout={onLogout || (() => showToast("Signed out", "success"))}
        pendingCount={pendingUsers.length}
        flaggedPosts={flaggedPostsCount}
        flaggedChats={flaggedChatsCount}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar title={pt.title} subtitle={pt.subtitle}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 12, color: T.tMut }}>Live</span>
          </div>
        </TopBar>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === "overview" && (
            <Overview
              stats={{ ...stats, flaggedPosts: flaggedPostsCount, flaggedChats: flaggedChatsCount }}
              statsLoading={statsLoading}
              setActive={setTab}
            />
          )}
          {tab === "verify" && (
            <VerifyPage
              users={pendingUsers} loading={pendingLoading} error={pendingError}
              onRetry={fetchPendingUsers} onVerify={handleVerify} onReject={handleReject} busyId={busyId}
            />
          )}
          {tab === "posts" && (
            <PostsPage
              posts={posts} loading={postsLoading} error={postsError} onRetry={fetchPosts}
              onDelete={handleDeletePost} onFlag={handleFlagPost} onClear={handleClearFlag}
            />
          )}
          {tab === "chats" && <ChatsPage chats={chats} onDismiss={handleDismissChat} onBan={handleBan} />}
          {tab === "users" && (
            <UsersPage users={allUsers} loading={usersLoading} error={usersError} onRetry={fetchAllUsers} onToast={showToast} />
          )}
        </div>
      </div>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}