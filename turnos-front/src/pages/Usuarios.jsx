import { useEffect, useState, useMemo } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getUsers, getRoles, deleteUser, getPacientes } from "../api/users";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import {
  Shield,
  ClipboardList,
  Stethoscope,
  User,
  Users,
  Trash2,
} from "lucide-react";

// --- 🔹 ICONOS DE ROLES ---
const getRoleIcon = (roleName, className = "w-6 h-6") => {
  switch (roleName) {
    case "admin":
      return <Shield className={`text-red-600 ${className}`} />;
    case "recepcionista":
      return <ClipboardList className={`text-yellow-600 ${className}`} />;
    case "kinesiologo":
      return <Stethoscope className={`text-blue-600 ${className}`} />;
    case "paciente":
      return <User className={`text-green-600 ${className}`} />;
    default:
      return <User className={`text-gray-400 ${className}`} />;
  }
};

// --- 🔹 RESOLVER NOMBRE DE ROL ---
const getUserRoleName = (user, roles) => {
  if (user.role?.name) return user.role.name; // si ya viene incluido
  if (!user?.role_id || !roles.length) return "sin rol";
  const role = roles.find((r) => String(r.id) === String(user.role_id));
  return role ? role.name : "sin rol";
};

export default function Usuarios() {
  const { user } = useAuth(); // 👈 obtenemos el usuario logueado
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // --- 🔹 Cargar datos ---
  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      let resUsers, resRoles;

      // ✅ Si es admin → obtiene todos los usuarios
      if (user?.role?.name === "admin") {
        [resUsers, resRoles] = await Promise.all([getUsers(), getRoles()]);
        setUsers(resUsers.data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setRoles(resRoles.data);
      }

      // ✅ Si es recepcionista → obtiene solo pacientes
      else if (user?.role?.name === "recepcionista") {
        resUsers = await getPacientes();
        setUsers(resUsers.data.sort((a, b) => a.nombre.localeCompare(b.nombre)));
      }

      else {
        setError("No tienes permisos para ver esta sección.");
      }

    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  // --- 🔹 Eliminar usuario ---
  const handleDeleteUser = async (userId, userName) => {
    const confirm = await Swal.fire({
      title: `¿Eliminar usuario ${userName}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(userId);
        Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo eliminar el usuario.", "error");
      }
    }
  };

  // --- 🔹 Contadores ---
  const roleCounts = useMemo(() => {
    const counts = {
      admin: 0,
      recepcionista: 0,
      kinesiologo: 0,
      paciente: 0,
    };
    users.forEach((u) => {
      const roleName = getUserRoleName(u, roles);
      if (counts[roleName] !== undefined) counts[roleName]++;
    });
    return counts;
  }, [users, roles]);

  // --- 🔹 Filtrado ---
  const filteredUsers =
    filterRole === "all"
      ? users
      : users.filter((u) => getUserRoleName(u, roles) === filterRole);

  // --- 🔹 Estados visuales ---
  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-600 p-6">Cargando usuarios...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-red-600 p-6">{error}</p>
      </MainLayout>
    );
  }

  // --- 🔹 Render principal ---
  return (
    <MainLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">
            {user?.role?.name === "recepcionista"
              ? "Pacientes Registrados"
              : "Usuarios del Sistema"}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role?.name === "recepcionista"
              ? "Visualiza y gestiona los pacientes registrados."
              : "Visualiza, filtra o elimina usuarios del sistema."}
          </p>
        </header>

        {/* --- Tarjetas resumen (solo admin) --- */}
        {user?.role?.name === "admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <button
              onClick={() => setFilterRole("all")}
              className={`flex items-center gap-3 p-4 rounded-lg border shadow transition ${
                filterRole === "all"
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              <Users className="text-blue-600 w-6 h-6" />
              <div className="text-left">
                <p className="text-sm text-gray-500">Todos</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
            </button>

            {[
              { role: "admin", color: "red", label: "Administradores" },
              { role: "recepcionista", color: "yellow", label: "Recepcionistas" },
              { role: "kinesiologo", color: "blue", label: "Kinesiólogos" },
              { role: "paciente", color: "green", label: "Pacientes" },
            ].map(({ role, color, label }) => (
              <button
                key={role}
                onClick={() =>
                  setFilterRole(filterRole === role ? "all" : role)
                }
                className={`flex items-center gap-3 p-4 rounded-lg border shadow transition ${
                  filterRole === role
                    ? `bg-${color}-50 border-${color}-400`
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {getRoleIcon(role)}
                <div className="text-left">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {roleCounts[role]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* --- Tabla de usuarios / pacientes --- */}
        <section className="bg-white shadow border rounded-lg p-6">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                      Nombre
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                      Email
                    </th>
                    {user?.role?.name === "admin" && (
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                        Rol
                      </th>
                    )}
                    {user?.role?.name === "admin" && (
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700 border-b">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const roleName = getUserRoleName(u, roles);
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2 border-b text-gray-800">
                          {u.nombre}
                        </td>
                        <td className="px-4 py-2 border-b text-gray-600">
                          {u.email}
                        </td>
                        {user?.role?.name === "admin" && (
                          <>
                            <td className="px-4 py-2 border-b flex items-center gap-2 capitalize">
                              {getRoleIcon(roleName, "w-5 h-5")}
                              {roleName}
                            </td>
                            <td className="px-4 py-2 border-b text-center">
                              {roleName !== "admin" ? (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.nombre)}
                                  className="text-red-600 hover:text-red-800 transition"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-5 h-5 inline-block" />
                                </button>
                              ) : (
                                <span className="text-gray-400 text-sm italic">
                                  No editable
                                </span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">
              No hay {user?.role?.name === "recepcionista" ? "pacientes" : "usuarios"} para mostrar.
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
