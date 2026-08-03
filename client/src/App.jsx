import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import DashboardPage from "./pages/Dashboard";
import AdminPage from "./pages/AdminPage";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [page, setPage] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return "landing";

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.isAdmin) return "admin";
    } catch {
      return "landing";
    }

    return "dashboard";
  });

  const go = (p) => setPage(p);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    go("landing");
  };

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };
  const user = getUser();

  return (
    <ThemeProvider>
      {page === "landing" && (
        <LandingPage onJoin={() => go("auth")} onAbout={() => go("about")} />
      )}

      {page === "auth" && (
        <AuthPage
          onAuthSuccess={(dest) => {
            // dest will be "admin" or "feed" — passed from LoginPage
            if (dest === "admin") {
              go("admin");
            } else {
              go("dashboard");
            }
          }}
          onBack={() => go("landing")}
        />
      )}

      {page === "about" && (
        <Homepage onJoin={() => go("auth")} onBack={() => go("landing")} isGuest />
      )}

      {page === "admin" && <AdminPage onLogout={handleLogout} />}

      {page === "dashboard" && (
        <DashboardPage user={user} onLogout={handleLogout} onHome={() => go("about")} />
      )}
    </ThemeProvider>
  );
}

export default App;