import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";

function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onAbout={() => alert("About Us - Coming Soon!")}
          onJoin={() => setPage("auth")}
        />
      )}
      {page === "auth" && <AuthPage onLoginSuccess={() => setPage("home")} />}
      {page === "home" && <Homepage />}
    </>
  );
}

export default App;
