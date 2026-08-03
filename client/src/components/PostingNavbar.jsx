export default function PostingNavbar({ onHome, onLogout }) {
  return (
    <nav className="posting-navbar">
      <h2>PeerConnect</h2>

      <div className="posting-navbar-actions">
        <button onClick={onHome}>Homepage</button>

        <button className="posting-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
