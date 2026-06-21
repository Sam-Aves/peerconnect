import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import PostingPage from "./pages/PostingPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const [page, setPage] = useState(() => {
  const token = localStorage.getItem("token");

  if (!token) return "landing";

  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.isAdmin) {
    return "admin";
  }

  return "feed";
});
  const go = (p) => setPage(p);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    go("landing");
  };

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onJoin={() => go("auth")}
          onAbout={() => go("about")}
        />
      )}

      {page === "auth" && (
        <AuthPage
          onAuthSuccess={(page) => go(page)}
          onBack={() => go("landing")}
        />
      )}

      {page === "about" && (
        <Homepage
          onJoin={() => go("auth")}
          onBack={() => go("landing")}
          isGuest
        />
      )}

      {page === "admin" && (
        <AdminPage
          onLogout={handleLogout}
        />
      )}

      {page === "feed" && (
        <PostingPage
          onLogout={handleLogout}
          onHome={() => go("about")}
        />
      )}
    </>
  );
}

export default App;