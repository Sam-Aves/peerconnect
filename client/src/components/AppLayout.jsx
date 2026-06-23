import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HomeNavbar from "./HomeNavbar";
import logo from "../assets/logo1.png";
import "../pages/Homepage.css";

// Shared shell for /feed and /profile. Uses the SAME HomeNavbar component
// as the marketing page (/about) instead of a separate hand-rolled navbar -
// that's what fixes the "navbar looks different on Feed vs Homepage"
// inconsistency. Pass `user` so HomeNavbar shows Feed/Profile links + name
// instead of the generic Dashboard button (see HomeNavbar.jsx).
//
// AdminPage is NOT wrapped in this layout (see App.jsx) - it already has
// its own complete sidebar with its own logout button, so wrapping it here
// would stack two navbars and two logout buttons, which is the bug that
// was just reported.
export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <HomeNavbar
        logo={logo}
        isHero={false}
        isGuest={false}
        user={user}
        onLogout={handleLogout}
      />

      <main style={{ paddingTop: 84 }}>
        <Outlet />
      </main>
    </div>
  );
}
