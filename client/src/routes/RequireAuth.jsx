import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any route that needs a logged-in user:
//   <Route element={<RequireAuth/>}><Route path="/feed" element={<PostingPage/>}/></Route>
// Remembers where they were trying to go (location state) so after login
// you could redirect back there instead of always to /feed - not wired up
// yet since AuthPage doesn't currently read it, but the data is there
// when you want it.
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
