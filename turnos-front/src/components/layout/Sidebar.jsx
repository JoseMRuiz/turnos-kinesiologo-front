import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart2,
  Shield,
} from "lucide-react";

export default function Sidebar({ user }) {
  const location = useLocation();
  const roleName = user?.role?.name || "sin rol";

  // 🔹 Menú dinámico según el rol
  const getMenuItems = () => {
    switch (roleName) {
      case "admin":
        return [
          { name: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
          { name: "Usuarios", icon: <Users />, path: "/usuarios" },
          { name: "Citas", icon: <Calendar />, path: "/turnos" },
          { name: "Reportes", icon: <BarChart2 />, path: "/reportes" },
          { name: "Roles", icon: <Shield />, path: "/roles" },
          
        ];
      case "recepcionista":
        return [
          { name: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
          { name: "Pacientes", icon: <Users />, path: "/usuarios" },
          { name: "Citas", icon: <Calendar />, path: "/turnos" },
        ];
      case "kinesiologo":
        return [
          { name: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
          { name: "Mis Turnos", icon: <Calendar />, path: "/citas" },
        ];
      case "paciente":
        return [
          { name: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
          { name: "Mis Citas", icon: <Calendar />, path: "/citas" },
        ];
      default:
        return [
          { name: "Dashboard", icon: <LayoutDashboard />, path: "/dashboard" },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r flex flex-col shadow-sm">
      {/* 🔹 Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">KinesioPro</h1>
        {user && (
          <p className="text-sm text-gray-500 mt-1 capitalize">
            Rol: <span className="font-medium text-gray-700">{roleName}</span>
          </p>
        )}
      </div>

      {/* 🔹 Menú principal */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 🔹 Footer */}
      <div className="p-4 border-t text-xs text-gray-400 text-center">
        v2.46.2 © 2025
      </div>
    </aside>
  );
}
