import { Navigate, useLocation } from "react-router-dom";
import { userAuth } from "../../context/AuthContext.jsx";
import getToken from "../../utils/getToken.js";
import Skaliton from "../layout/Skaliton.jsx";

export default function ProtectedRoute({ children }) {
  const { token, loading } = userAuth() || {};
  const location = useLocation();
  const hasToken = token || getToken();

  // Auth is still initialising (refresh call in flight) — show skeleton, not /about
  if (loading) {
    return <Skaliton />;
  }

  if (!hasToken) {
    return <Navigate to="/about" replace state={{ from: location }} />;
  }

  return children;
}


