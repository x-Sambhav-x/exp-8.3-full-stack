import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" />;

  if (roles && !roles.includes(role)) {
    return <h2>🚫 Access Denied</h2>;
  }

  return children;
}
