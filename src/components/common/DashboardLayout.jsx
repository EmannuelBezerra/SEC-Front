import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { logout } from "../../utils/auth";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;   
  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
