export default function HomeNavbar({
  logo,
  isHero,
  isGuest,
  onBack,
  onJoin,
  onLogout,
}) {
  return (
    <nav className={`navbar ${!isHero ? "navbar-solid" : ""}`}>
      <a href="/" className="nav-logo">
        <img src={logo} alt="PeerConnect Logo" className="logo-img" />

        <span className="logo-text">
          Peer<span className="logo-highlight">Connect</span>
        </span>
      </a>

      <div className="nav-actions">
        {isGuest ? (
          <>
            <button className="btn btn-outline" onClick={onBack}>
              ← Back
            </button>

            <button className="btn btn-solid" onClick={onJoin}>
              Sign up
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={onLogout}>
              Log out
            </button>

            <button
              className="btn btn-solid"
              onClick={() => {
                const token = localStorage.getItem("token");

                if (token) {
                  window.location.reload();
                } else {
                  onJoin();
                }
              }}
            >
              Dashboard
            </button>
          </>
        )}
      </div>
    </nav>
  );
}