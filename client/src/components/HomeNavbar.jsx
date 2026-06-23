import { Link, useNavigate } from "react-router-dom";

// The one shared navbar for every logged-in-aware page: Homepage (/about)
// AND AppLayout (/feed, /profile). Same look everywhere - no more two
// different "logged in" navbar designs.
//
// `isGuest` keeps its original meaning: true = visitor, show Back/Sign up.
// `user` (optional) is passed only by AppLayout, where there's a real
// logged-in member to show the name for. When `user` is present, the
// Feed/Profile links and the user's name appear; the generic "Dashboard"
// button is hidden since you're already inside the member area.
export default function HomeNavbar({
  logo,
  isHero,
  isGuest,
  onBack,
  onJoin,
  onLogout,
  user,
}) {
  const navigate = useNavigate();
  const isMemberArea = Boolean(user);

  return (
    <nav className={`navbar ${isMemberArea ? "navbar-light" : !isHero ? "navbar-solid" : ""}`}>
      <Link to="/" className="nav-logo">
        <img src={logo} alt="PeerConnect Logo" className="logo-img" />

        <span className="logo-text">
          Peer<span className="logo-highlight">Connect</span>
        </span>
      </Link>

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
            {isMemberArea && (
              <>
                <Link to="/feed" className="nav-link">Feed</Link>
                <Link to="/profile" className="nav-link">Profile</Link>
                <span className="nav-username">{user.name}</span>
              </>
            )}

            <button className="btn btn-outline" onClick={onLogout}>
              Log out
            </button>

            {!isMemberArea && (
              <button
                className="btn btn-solid"
                onClick={() => navigate("/feed")}
              >
                Dashboard
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}