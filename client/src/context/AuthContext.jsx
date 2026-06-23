import { createContext, useContext, useState, useCallback } from "react";

// Single source of truth for "who is logged in". Every page reads from
// here instead of calling localStorage.getItem("token") on its own -
// that's what was causing PostingPage, AdminPage, and HomeNavbar to each
// have their own slightly-different idea of the user's auth state.
//
// Shape of `user` matches exactly what server/controllers/authController.js
// returns on POST /api/auth/login:
//   { id, name, email, role, isAdmin }
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(readStoredUser);

  // Call after a successful POST /api/auth/login response:
  //   login(data.token, data.user)
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user?.isAdmin),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
