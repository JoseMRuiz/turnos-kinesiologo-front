import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import api from "../../api/Client";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout({ children }) {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        console.log("🧩 Usuario logueado:", res.data);
        setUser(res.data);
      } catch (err) {
        console.error("❌ Error obteniendo usuario:", err);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
