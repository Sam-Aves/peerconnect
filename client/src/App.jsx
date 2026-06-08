import { useState } from "react";
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
    </>
  );
}

export default App;