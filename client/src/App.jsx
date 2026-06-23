import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./routes/RequireAuth";
import RequireAdmin from "./routes/RequireAdmin";
import AppLayout from "./components/AppLayout";

import LandingPage from "./pages/LandingPage";
import Homepage from "./pages/Homepage";
import AuthPage from "./pages/AuthPage";
import PostingPage from "./pages/PostingPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<Homepage isGuest />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Logged-in members */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/feed" element={<PostingPage />} />
            <Route path="/profile" element={<ProfilePlaceholder />} />
          </Route>

          {/* Admins only */}
          <Route
            path="/admin/dashboard"
            element={<RequireAdmin><AdminPage /></RequireAdmin>}
          />

          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProfilePlaceholder() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
      Profile page coming soon.
    </div>
  );
}