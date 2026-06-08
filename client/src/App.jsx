import { useState } from "react";
<<<<<<< HEAD
import Welcome from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

function App() {
  const [page, setPage] = useState("welcome");

  return (
    <>
      {page === "welcome" && (
        <Welcome
          onAbout={() => alert("About Us - Coming Soon!")}
          onJoin={() => setPage("auth")}
        />
      )}
      {page === "auth" && <AuthPage />}
=======
import LandingPage from "./pages/LandingPage";
import Homepage from "./pages/Homepage";

function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing" && (
        <LandingPage
          onAbout={() => setPage("home")}
          onJoin={() => console.log("Join clicked")}
        />
      )}

      {page === "home" && <Homepage />}
>>>>>>> origin/Nusrat-Frontend
    </>
  );
}

export default App;