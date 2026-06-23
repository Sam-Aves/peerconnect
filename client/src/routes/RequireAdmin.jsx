import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Two distinct failure cases, handled differently on purpose:
//  - not logged in at all       -> /admin/login
//  - logged in, not an admin    -> /feed (don't bounce a regular student
//                                  to an admin login form)
export default function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}
