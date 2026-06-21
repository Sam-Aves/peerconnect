import { useEffect, useState } from "react";
import {
  Clock, LogOut, Search, CheckCircle, UserCheck, ShieldCheck,
} from "lucide-react";

const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap");

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .admin-root {
    min-height: 100vh;
    background: #f6f9f7;
    font-family: "DM Sans", sans-serif;
    color: #1a2e1e;
  }

  .admin-layout {
    display: flex;
    min-height: 100vh;
  }

  /* SIDEBAR */
  .admin-sidebar {
    width: 240px;
    background: #042C1F;
    display: flex;
    flex-direction: column;
    padding: 32px 0 24px;
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    z-index: 100;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 24px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 24px;
  }

  .sidebar-logo-text {
    font-family: "Fraunces", serif;
    font-size: 1.3rem;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .sidebar-logo-text span { color: #35c7a2; }

  .sidebar-badge {
    font-size: 0.62rem;
    font-weight: 700;
    background: rgba(53,199,162,0.18);
    color: #35c7a2;
    border: 1px solid rgba(53,199,162,0.28);
    border-radius: 999px;
    padding: 2px 8px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 12px;
  }

  .nav-section-label {
    font-size: 0.67rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.22);
    padding: 0 14px;
    margin-bottom: 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: "DM Sans", sans-serif;
  }

  .nav-item:hover {
    background: rgba(255,255,255,0.07);
    color: #fff;
  }

  .nav-item.active {
    background: rgba(53,199,162,0.16);
    color: #35c7a2;
    font-weight: 700;
  }

  .nav-count {
    margin-left: auto;
    background: #35c7a2;
    color: #021a12;
    font-size: 0.68rem;
    font-weight: 700;
    border-radius: 999px;
    padding: 1px 7px;
    min-width: 20px;
    text-align: center;
  }

  .sidebar-footer {
    padding: 16px 12px 0;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 500;
    color: rgba(255,255,255,0.4);
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: "DM Sans", sans-serif;
  }

  .logout-btn:hover {
    background: rgba(220,60,60,0.12);
    color: #ff7b7b;
  }

  /* MAIN */
  .admin-main {
    margin-left: 240px;
    flex: 1;
    padding: 40px 44px;
    min-height: 100vh;
    background: #f6f9f7;
  }

  /* TOPBAR */
  .admin-topbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(4,44,31,0.08);
  }

  .topbar-title {
    font-family: "Fraunces", serif;
    font-size: 2rem;
    color: #042C1F;
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 6px;
  }

  .topbar-sub {
    font-size: 0.9rem;
    color: #6a8e73;
  }

  .topbar-time {
    font-size: 0.8rem;
    color: #a6c2ab;
    text-align: right;
  }

  /* STATS */
  .stats-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 32px;
  }

  .stat-pill {
    background: #fff;
    border: 1px solid rgba(4,44,31,0.08);
    border-radius: 14px;
    padding: 20px 22px;
    transition: all 0.25s ease;
  }

  .stat-pill:hover {
    border-color: rgba(53,199,162,0.35);
    box-shadow: 0 4px 16px rgba(53,199,162,0.1);
    transform: translateY(-2px);
  }

  .stat-pill-num {
    font-family: "Fraunces", serif;
    font-size: 2.2rem;
    font-weight: 900;
    color: #2a7a4b;
    line-height: 1;
    letter-spacing: -1px;
    margin-bottom: 5px;
  }

  .stat-pill-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #6a8e73;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* SECTION */
  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .section-title {
    font-family: "Fraunces", serif;
    font-size: 1.15rem;
    color: #042C1F;
    letter-spacing: -0.3px;
  }

  .section-sub {
    font-size: 0.8rem;
    color: #a6c2ab;
    margin-top: 3px;
  }

  .controls-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid rgba(4,44,31,0.1);
    border-radius: 10px;
    padding: 7px 13px;
    transition: all 0.2s;
  }

  .search-box:focus-within {
    border-color: rgba(53,199,162,0.5);
    box-shadow: 0 0 0 3px rgba(53,199,162,0.08);
  }

  .search-box input {
    background: transparent;
    border: none;
    outline: none;
    color: #1a2e1e;
    font-size: 0.86rem;
    font-family: "DM Sans", sans-serif;
    width: 180px;
  }

  .search-box input::placeholder { color: #a6c2ab; }

  .filter-chip {
    padding: 6px 13px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    border: 1px solid rgba(4,44,31,0.1);
    background: #fff;
    color: #6a8e73;
    cursor: pointer;
    transition: all 0.2s;
    font-family: "DM Sans", sans-serif;
  }

  .filter-chip:hover, .filter-chip.active {
    background: rgba(53,199,162,0.1);
    border-color: rgba(53,199,162,0.4);
    color: #2a7a4b;
  }

  /* USER LIST */
  .user-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .user-row {
    background: #fff;
    border: 1px solid rgba(4,44,31,0.07);
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 18px;
    transition: all 0.2s ease;
  }

  .user-row:hover {
    border-color: rgba(53,199,162,0.3);
    box-shadow: 0 4px 16px rgba(53,199,162,0.08);
  }

  .user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #35c7a2, #1e6b5c);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Fraunces", serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
    flex-shrink: 0;
  }

  .user-info { flex: 1; min-width: 0; }

  .user-name {
    font-weight: 700;
    font-size: 0.93rem;
    color: #042C1F;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 0.8rem;
    color: #6a8e73;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-meta {
    display: flex;
    gap: 7px;
    align-items: center;
    flex-shrink: 0;
  }

  .meta-tag {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }

  .meta-tag.university {
    background: rgba(42,122,75,0.08);
    color: #2a7a4b;
    border: 1px solid rgba(42,122,75,0.18);
  }

  .meta-tag.role-seeker {
    background: rgba(59,130,246,0.08);
    color: #2563eb;
    border: 1px solid rgba(59,130,246,0.18);
  }

  .meta-tag.role-helper {
    background: rgba(234,179,8,0.1);
    color: #92400e;
    border: 1px solid rgba(234,179,8,0.2);
  }

  .meta-tag.role-both {
    background: rgba(139,92,246,0.08);
    color: #6d28d9;
    border: 1px solid rgba(139,92,246,0.18);
  }

  .user-date {
    font-size: 0.76rem;
    color: #a6c2ab;
    min-width: 86px;
    text-align: right;
    flex-shrink: 0;
  }

  .verify-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 999px;
    border: none;
    background: #2a7a4b;
    color: #fff;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.22s ease;
    white-space: nowrap;
    flex-shrink: 0;
    font-family: "DM Sans", sans-serif;
  }

  .verify-btn:hover {
    background: #35c7a2;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(42,122,75,0.25);
  }

  .verify-btn:active { transform: translateY(0); }

  /* EMPTY / LOADING */
  .empty-state {
    text-align: center;
    padding: 64px 20px;
    color: #a6c2ab;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(4,44,31,0.07);
  }

  .empty-text { font-size: 0.92rem; color: #6a8e73; }

  .loading-row {
    background: #fff;
    border: 1px solid rgba(4,44,31,0.06);
    border-radius: 14px;
    height: 76px;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  /* TOAST */
  .toast {
    position: fixed;
    bottom: 28px;
    right: 28px;
    background: #042C1F;
    color: #35c7a2;
    font-weight: 700;
    font-size: 0.88rem;
    padding: 12px 20px;
    border-radius: 10px;
    border: 1px solid rgba(53,199,162,0.25);
    box-shadow: 0 10px 28px rgba(4,44,31,0.2);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .admin-sidebar { display: none; }
    .admin-main { margin-left: 0; padding: 24px 20px; }
    .stats-strip { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 600px) {
    .stats-strip { grid-template-columns: 1fr; }
    .user-row { flex-wrap: wrap; }
    .user-date { display: none; }
    .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    .controls-row { flex-wrap: wrap; }
  }
`;

const MOCK_USERS = [
  { _id: "1", name: "Tanvir Ahmed",  email: "tanvir@cu.ac.bd",   university: "Chittagong University", role: "seeker", joinedAt: "Jun 20, 2026" },
  { _id: "2", name: "Nusrat Jahan",  email: "nusrat@cuet.ac.bd", university: "CUET",                  role: "helper", joinedAt: "Jun 20, 2026" },
  { _id: "3", name: "Arif Hossain",  email: "arif@cu.ac.bd",     university: "Chittagong University", role: "both",   joinedAt: "Jun 21, 2026" },
  { _id: "4", name: "Samiha Akter",  email: "samiha@ciu.edu.bd", university: "CIU",                   role: "seeker", joinedAt: "Jun 21, 2026" },
  { _id: "5", name: "Karim Uddin",   email: "karim@cu.ac.bd",    university: "Chittagong University", role: "helper", joinedAt: "Jun 22, 2026" },
];

const ROLE_LABEL = { seeker: "Newcomer", helper: "Buddy", both: "Both" };

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function getRoleClass(role) {
  return { seeker: "role-seeker", helper: "role-helper", both: "role-both" }[role] ?? "role-seeker";
}

export default function AdminPage({ onLogout }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [toast, setToast]     = useState(null);
  const [now, setNow]         = useState(new Date());

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/admin/pending-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendingUsers(); }, []);

  const verifyUser = async (id, name) => {
    try {
      await fetch(`http://localhost:5000/api/admin/verify/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* optimistic */ }
    setUsers(prev => prev.filter(u => u._id !== id));
    showToast(`${name} verified`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const roles = ["All", "seeker", "helper", "both"];

  const filtered = users.filter(u => {
    const matchRole   = filter === "All" || u.role === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
                     || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    total:   users.length,
    seekers: users.filter(u => u.role === "seeker").length,
    helpers: users.filter(u => u.role === "helper").length,
    both:    users.filter(u => u.role === "both").length,
  };

  const timeStr = now.toLocaleString("en-BD", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        <div className="admin-layout">

          {/* ── SIDEBAR ── */}
          <aside className="admin-sidebar">
            <div className="sidebar-logo">
              <span className="sidebar-logo-text">
                Peer<span>Connect</span>
              </span>
              <span className="sidebar-badge">Admin</span>
            </div>

            <nav className="sidebar-nav">
              <div className="nav-section-label">Management</div>

              <button className="nav-item active">
                <Clock size={15} />
                Pending Verification
                {users.length > 0 && (
                  <span className="nav-count">{users.length}</span>
                )}
              </button>


            </nav>

            <div className="sidebar-footer">
              <button className="logout-btn" onClick={onLogout}>
                <LogOut size={15} />
                Log out
              </button>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main className="admin-main">
            <div className="admin-topbar">
              <div>
                <div className="topbar-title">Pending Verification</div>
                <div className="topbar-sub">Review and approve new PeerConnect members</div>
              </div>
              <div className="topbar-time">{timeStr}</div>
            </div>

            {/* STATS */}
            <div className="stats-strip">
              <div className="stat-pill">
                <div className="stat-pill-num">{counts.total}</div>
                <div className="stat-pill-label">Awaiting review</div>
              </div>
              <div className="stat-pill">
                <div className="stat-pill-num">{counts.seekers}</div>
                <div className="stat-pill-label">Newcomers</div>
              </div>
              <div className="stat-pill">
                <div className="stat-pill-num">{counts.helpers + counts.both}</div>
                <div className="stat-pill-label">Buddies</div>
              </div>
            </div>

            {/* LIST HEADER */}
            <div className="section-header">
              <div>
                <div className="section-title">Unverified members</div>
                <div className="section-sub">
                  {filtered.length} {filtered.length === 1 ? "person" : "people"} waiting
                </div>
              </div>
              <div className="controls-row">
                <div className="search-box">
                  <Search size={13} color="#a6c2ab" />
                  <input
                    placeholder="Search name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                {roles.map(r => (
                  <button
                    key={r}
                    className={`filter-chip ${filter === r ? "active" : ""}`}
                    onClick={() => setFilter(r)}
                  >
                    {r === "All" ? "All" : ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* USER ROWS */}
            <div className="user-grid">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="loading-row" />)
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={36} color="#35c7a2" strokeWidth={1.5} />
                  <div className="empty-text">
                    {users.length === 0
                      ? "No pending verifications right now."
                      : "No results match your filter."}
                  </div>
                </div>
              ) : (
                filtered.map(user => (
                  <div className="user-row" key={user._id}>
                    <div className="user-avatar">{getInitials(user.name)}</div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                    <div className="user-meta">
                      <span className="meta-tag university">{user.university}</span>
                      <span className={`meta-tag ${getRoleClass(user.role)}`}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </div>
                    <div className="user-date">{user.joinedAt || "—"}</div>
                    <button
                      className="verify-btn"
                      onClick={() => verifyUser(user._id, user.name)}
                    >
                      <UserCheck size={13} />
                      Verify
                    </button>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>

        {toast && (
          <div className="toast">
            <ShieldCheck size={15} />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}