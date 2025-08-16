import { Navigate, Outlet } from "react-router-dom";

const getUserFromStorage = () => {
  const storedUser = localStorage.getItem("user");
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export default function RoleBasedRoute({ allowedRoles }) {
  const user = getUserFromStorage();

  if (!user) return <Navigate to="/" />;

  const hasAccess = allowedRoles.includes(user.perfil);

  return hasAccess ? <Outlet /> : <Navigate to="/app/home" />;
}
