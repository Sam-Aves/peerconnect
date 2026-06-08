import { useState } from "react";
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
    </>
  );
}

export default App;