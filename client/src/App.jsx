import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import PostingPage from "./pages/PostingPage";
function App() {
  const [page, setPage] = useState(() => {
  const token = localStorage.getItem("token");
  return token ? "feed" : "landing";
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
          onAuthSuccess={() => go("feed")}
          onBack={() => go("landing")}
        />
      )}
      {/* "about" shows the marketing Homepage without the logged-in user context */}
      {page === "about" && (
        <Homepage
          onJoin={() => go("auth")}
          onBack={() => go("landing")}
          isGuest
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