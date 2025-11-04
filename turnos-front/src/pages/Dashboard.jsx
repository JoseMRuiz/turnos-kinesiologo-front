import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Users, Calendar, TrendingUp, Clock } from "lucide-react";
import api from "../api/Client";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Cargar info del usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("❌ Error cargando usuario:", err);
        setError("Error al cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-600">Cargando datos del usuario...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-red-600">{error}</p>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <p className="text-gray-600">No se encontró información del usuario.</p>
      </MainLayout>
    );
  }

  // 🔹 Render dinámico por rol
  const renderContentByRole = () => {
    switch (user.role?.name) {
      case "admin":
        return (
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Panel de Administrador</h2>
            <p className="text-gray-600">Aquí podrás gestionar usuarios, roles y estadísticas generales.</p>
          </div>
        );

      case "recepcionista":
        return (
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Panel de Recepción</h2>
            <p className="text-gray-600">Acceso a turnos, pacientes y agenda del día.</p>
          </div>
        );

      case "kinesiologo":
        return (
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Panel del Kinesiólogo</h2>
            <p className="text-gray-600">Aquí podrás ver tus turnos asignados y registrar sesiones.</p>
          </div>
        );

      case "paciente":
        return (
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Panel del Paciente</h2>
            <p className="text-gray-600">Visualiza tus turnos y seguimientos con tu kinesiólogo.</p>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Panel General</h2>
            <p className="text-gray-600">Bienvenido al sistema.</p>
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Panel de Control
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {user.nombre} ({user.role?.name})
          </p>
        </div>

        {/* Estadísticas generales (solo admin o recepcionista) */}
        {(user.role?.name === "admin" || user.role?.name === "recepcionista") && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-white rounded-lg shadow border flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Pacientes Activos</p>
                <p className="text-2xl font-bold text-gray-900">127</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow border flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow border flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Tasa de Recuperación</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow border flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">45min</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido dinámico según el rol */}
        {renderContentByRole()}
      </div>
    </MainLayout>
  );
}
