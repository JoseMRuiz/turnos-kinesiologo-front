import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getRoles, createRole, assignRoleToUser, getUsers } from "../api/users";
import Swal from "sweetalert2";
import { Shield, ClipboardList, Stethoscope, User } from "lucide-react";

// 🔹 Ícono según el nombre del rol
const getRoleIcon = (roleName) => {
  switch (roleName) {
    case "admin":
      return <Shield className="text-red-600 w-5 h-5" />;
    case "recepcionista":
      return <ClipboardList className="text-yellow-600 w-5 h-5" />;
    case "kinesiologo":
      return <Stethoscope className="text-blue-600 w-5 h-5" />;
    case "paciente":
      return <User className="text-green-600 w-5 h-5" />;
    default:
      return <User className="text-gray-500 w-5 h-5" />;
  }
};

// 🔹 Obtener el nombre del rol desde role_id
const getUserRoleName = (user, roles) => {
  if (!user || !user.role_id || !roles.length) return "sin rol";
  const role = roles.find((r) => String(r.id) === String(user.role_id));
  return role ? role.name : "sin rol";
};

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // 🔹 Cargar roles
  const loadRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      console.error("Error cargando roles:", err);
    }
  };

  // 🔹 Cargar usuarios
  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  // 🔹 Crear nuevo rol
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRole) {
      Swal.fire("Atención", "Debes escribir un nombre de rol", "warning");
      return;
    }

    try {
      await createRole({ name: newRole });
      Swal.fire("Éxito", "Rol creado correctamente", "success");
      setNewRole("");
      loadRoles();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo crear el rol", "error");
    }
  };

  // 🔹 Asignar rol
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      Swal.fire("Atención", "Selecciona usuario y rol", "info");
      return;
    }

    // 🚫 Evitar asignar rol admin manualmente
    const selectedRoleObj = roles.find((r) => String(r.id) === String(selectedRole));
    if (selectedRoleObj?.name === "admin") {
      Swal.fire("Prohibido", "El rol 'admin' no puede asignarse manualmente.", "error");
      return;
    }

    try {
      await assignRoleToUser(selectedUser, selectedRole);
      Swal.fire("Éxito", "Rol asignado correctamente", "success");
      loadUsers();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo asignar el rol", "error");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600 mt-1">
            Administra los roles del sistema y asigna permisos a los usuarios.
          </p>
        </header>

        {/* 🔹 Listado de roles */}
        <section className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Roles existentes</h2>
          {roles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {roles.map((role) => (
                <li key={role.id} className="flex items-center gap-2 py-2">
                  {getRoleIcon(role.name)}
                  <span className="font-medium text-gray-800 capitalize">{role.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay roles registrados.</p>
          )}
        </section>

        {/* 🔹 Crear nuevo rol */}
        <section className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Crear nuevo rol</h2>
          <form onSubmit={handleCreateRole} className="flex gap-3">
            <input
              type="text"
              className="border rounded px-3 py-2 flex-1"
              placeholder="Nombre del rol"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Crear
            </button>
          </form>
        </section>

        {/* 🔹 Asignar rol a usuario */}
        <section className="bg-white rounded-lg shadow border p-6">
          <h2 className="text-xl font-semibold mb-4">Asignar rol a usuario</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Select usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 invisible">
                Seleccionar usuario
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar usuario</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({getUserRoleName(u, roles)})
                  </option>
                ))}
              </select>
            </div>

            {/* Select rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Rol
              </label>
              <div
                className={`flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm transition ${
                  selectedRole ? "border-blue-500 ring-1 ring-blue-200" : "border-gray-300"
                }`}
              >
                <div className="mr-2">
                  {roles.find((r) => String(r.id) === String(selectedRole))
                    ? getRoleIcon(roles.find((r) => String(r.id) === String(selectedRole)).name)
                    : <User className="text-gray-400 w-5 h-5" />}
                </div>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="appearance-none bg-transparent flex-1 focus:outline-none text-gray-800 capitalize"
                >
                  <option value="">Seleccionar Rol</option>
                  {roles
                    .filter((r) => r.name !== "admin") // 🚫 No mostrar el rol admin
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>

                <svg
                  className="w-4 h-4 text-gray-500 ml-2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Botón */}
            <div className="flex md:justify-end">
              <button
                onClick={handleAssignRole}
                className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Asignar Rol
              </button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
