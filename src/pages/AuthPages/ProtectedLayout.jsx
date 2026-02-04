import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedLayout({ user }) {
  if (!user) return <Navigate to="/login" />;

  return <Outlet />; // render nested routes inside
}
