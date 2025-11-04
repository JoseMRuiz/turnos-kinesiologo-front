import { LogOut } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const roleName = user?.role?.name || "sin rol";

  return (
    <header className="h-16 bg-white border-b shadow-sm flex items-center justify-between px-6">
      <input
        type="text"
        placeholder="🔍 Buscar..."
        className="border border-gray-200 rounded-lg px-3 py-1.5 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      <div className="flex items-center gap-4">
        {user ? (
          <p className="text-sm text-gray-700">
            <span className="font-medium">{user.nombre}</span> ({roleName})
          </p>
        ) : (
          <p className="text-sm text-gray-400">Cargando...</p>
        )}

        <button
          onClick={onLogout}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition"
        >
          <LogOut size={16} /> Salir
        </button>
      </div>
    </header>
  );
}
