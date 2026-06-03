import { useState } from "react";
import Welcome from "./pages/Welcome";

function App() {
  const [page, setPage] = useState("welcome");

  return (
    <>
      {page === "welcome" && (
        <Welcome
          onAbout={() => alert("About Us - Coming Soon!")}
          onJoin={() => alert("Join Us - Coming Soon!")}
        />
      )}
    </>
  );
}

export default App;