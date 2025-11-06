import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getUsers } from "../api/users";
import { getTurnos } from "../api/turnos";
import {
  Users,
  CalendarDays,
  Activity,
  Clock,
} from "lucide-react";

export default function DashboardAdmin() {
  const [users, setUsers] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resUsers, resTurnos] = await Promise.all([getUsers(), getTurnos()]);
      setUsers(resUsers.data);
      setTurnos(resTurnos.data);
    } catch (err) {
      console.error("Error cargando datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading)
    return (
      <MainLayout>
        <p className="p-6 text-gray-600">Cargando datos...</p>
      </MainLayout>
    );

  // --- Fecha actual ---
  const hoy = new Date().toISOString().split("T")[0];

  // --- Filtrados por rol (útil para métricas secundarias) ---
  const pacientes = users.filter((u) => u.role?.name === "paciente");
  const kinesiologos = users.filter((u) => u.role?.name === "kinesiologo");
  const recepcionistas = users.filter((u) => u.role?.name === "recepcionista");

  // --- Turnos ---
  const turnosHoy = turnos.filter((t) => t.fecha === hoy);
  const turnosConfirmados = turnos.filter((t) => t.estado === "confirmado");
  const tasaConfirmacion = turnos.length
    ? Math.round((turnosConfirmados.length / turnos.length) * 100)
    : 0;

  // --- Usuarios con turno próximo ---
  const usuariosConTurnoProximo = new Set(
    turnos
      .filter(
        (t) =>
          (t.estado === "pendiente" || t.estado === "confirmado") &&
          new Date(t.fecha) >= new Date()
      )
      .flatMap((t) => [t.paciente?.id, t.kinesiologo?.id])
  ).size;

  // --- Tiempo promedio simulado ---
  const tiempoPromedio = "45 min";

  // --- Últimos turnos ---
  const ultimosTurnos = [...turnos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1">Bienvenido.</p>
        </header>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center bg-white border shadow-sm rounded-lg p-5">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-gray-600 text-sm">Usuarios con turno próximo</p>
              <p className="text-2xl font-semibold text-gray-800">
                {usuariosConTurnoProximo}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-white border shadow-sm rounded-lg p-5">
            <CalendarDays className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-gray-600 text-sm">Citas hoy</p>
              <p className="text-2xl font-semibold text-gray-800">{turnosHoy.length}</p>
            </div>
          </div>

          <div className="flex items-center bg-white border shadow-sm rounded-lg p-5">
            <Activity className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-gray-600 text-sm">Tasa de Confirmación</p>
              <p className="text-2xl font-semibold text-gray-800">
                {tasaConfirmacion}%
              </p>
            </div>
          </div>

          <div className="flex items-center bg-white border shadow-sm rounded-lg p-5">
            <Clock className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-gray-600 text-sm">Tiempo promedio</p>
              <p className="text-2xl font-semibold text-gray-800">
                {tiempoPromedio}
              </p>
            </div>
          </div>
        </div>

        {/* Últimos turnos */}
        <section className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Últimos turnos registrados</h2>

          {ultimosTurnos.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay turnos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-md">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">
                      Paciente
                    </th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">
                      Kinesiólogo
                    </th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">
                      Fecha
                    </th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosTurnos.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {t.paciente?.nombre || "—"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {t.kinesiologo?.nombre || "—"}
                      </td>
                      <td className="px-4 py-2 text-sm">{t.fecha}</td>
                      <td className="px-4 py-2 text-sm capitalize">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            t.estado === "confirmado"
                              ? "bg-green-100 text-green-700"
                              : t.estado === "pendiente"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
