import { Navigate } from "react-router-dom";
import { clearAuth, getAuth } from "../services/auth";

function ProtectedRoute({ children, requiredRole }) {
  const auth = getAuth();

  if (!auth) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && auth.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
