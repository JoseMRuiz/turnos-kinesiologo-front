// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../api/users";
import { getTurnos, getMyTurnos, createTurno } from "../api/turnos";
import { kinesApi } from "../api/kines";
import {
  Users,
  CalendarDays,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    motivo: "",
    kinesiologo_id: "",
  });

  // ==========================
  // Cargar datos según el rol
  // ==========================
  const loadData = async () => {
    try {
      if (user?.role?.name === "admin" || user?.role?.name === "recepcionista") {
        const [resUsers, resTurnos] = await Promise.all([getUsers(), getTurnos()]);
        setUsers(resUsers.data);
        setTurnos(resTurnos.data);
      } else if (user?.role?.name === "kinesiologo") {
        const [resStats, resTurnos] = await Promise.all([
          kinesApi.getDashboardData(),
          kinesApi.getMyAppointments(),
        ]);
        setStats(resStats.data);
        setTurnos(resTurnos.data);
      } else if (user?.role?.name === "paciente") {
        const resTurnos = await getMyTurnos(); // ✅ Solo sus turnos
        setTurnos(resTurnos.data);
      }
    } catch (err) {
      console.error("Error cargando datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // ==========================
  // Solicitar nuevo turno (paciente)
  // ==========================
  const handleSolicitarTurno = async (e) => {
    e.preventDefault();
    try {
      await createTurno(formData);
      alert("Turno solicitado con éxito.");
      setShowForm(false);
      setFormData({ fecha: "", hora: "", motivo: "", kinesiologo_id: "" });
      loadData();
    } catch (err) {
      console.error("Error al solicitar turno:", err);
      alert("Hubo un problema al solicitar el turno.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="p-6 text-gray-600">Cargando datos...</p>
      </MainLayout>
    );
  }

  // ==========================
  // 👑 DASHBOARD ADMIN
  // ==========================
  if (user?.role?.name === "admin") {
    const hoy = new Date().toISOString().split("T")[0];
    const turnosHoy = turnos.filter((t) => t.fecha === hoy);
    const turnosConfirmados = turnos.filter((t) => t.estado === "confirmado");
    const tasaConfirmacion = turnos.length
      ? Math.round((turnosConfirmados.length / turnos.length) * 100)
      : 0;

    const usuariosConTurnoProximo = new Set(
      turnos
        .filter(
          (t) =>
            (t.estado === "pendiente" || t.estado === "confirmado") &&
            new Date(t.fecha) >= new Date()
        )
        .flatMap((t) => [t.paciente?.id, t.kinesiologo?.id])
    ).size;

    const tiempoPromedio = "45 min";
    const ultimosTurnos = [...turnos]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 5);

    return (
      <MainLayout>
        <div className="p-6 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1">Bienvenido, administrador.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card icon={Users} title="Usuarios con turno próximo" value={usuariosConTurnoProximo} color="text-blue-500" />
            <Card icon={CalendarDays} title="Citas hoy" value={turnosHoy.length} color="text-purple-500" />
            <Card icon={Activity} title="Tasa de Confirmación" value={`${tasaConfirmacion}%`} color="text-green-500" />
            <Card icon={Clock} title="Tiempo promedio" value={tiempoPromedio} color="text-orange-500" />
          </div>

          <TurnosTable title="Últimos turnos registrados" turnos={ultimosTurnos} />
        </div>
      </MainLayout>
    );
  }

  // ==========================
  // 🧍‍♀️ DASHBOARD RECEPCIONISTA
  // ==========================
  if (user?.role?.name === "recepcionista") {
    const hoy = new Date().toISOString().split("T")[0];
    const turnosHoy = turnos.filter((t) => t.fecha === hoy);
    const turnosPendientes = turnos.filter((t) => t.estado === "pendiente");

    return (
      <MainLayout>
        <div className="p-6 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-900">Panel de Recepción</h1>
          <p className="text-gray-600 mt-1">Gestiona los turnos y agenda de pacientes.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card icon={CalendarDays} title="Turnos de hoy" value={turnosHoy.length} color="text-blue-500" />
            <Card icon={Clock} title="Pendientes" value={turnosPendientes.length} color="text-yellow-500" />
            <Card
              icon={Users}
              title="Pacientes registrados"
              value={users.filter((u) => u.role?.name === "paciente").length}
              color="text-green-500"
            />
          </div>

          <TurnosTable title="Turnos registrados" turnos={turnos} />
        </div>
      </MainLayout>
    );
  }

  // ==========================
  // 🧑‍⚕️ DASHBOARD KINESIÓLOGO
  // ==========================
  if (user?.role?.name === "kinesiologo") {
    const proximo = stats?.proximo_turno;
    const ultimosTurnos = [...turnos]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 6);

    return (
      <MainLayout>
        <div className="p-6 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-900">Panel del Kinesiólogo</h1>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card icon={CalendarDays} title="Total de turnos" value={stats.total} color="text-blue-500" />
              <Card icon={CheckCircle} title="Confirmados" value={stats.confirmados} color="text-green-500" />
              <Card icon={Clock} title="Pendientes" value={stats.pendientes} color="text-yellow-500" />
              <Card icon={XCircle} title="Cancelados" value={stats.cancelados} color="text-red-500" />
            </div>
          )}

          <TurnosTable title="Mis próximos turnos" turnos={ultimosTurnos} />
        </div>
      </MainLayout>
    );
  }

  // ==========================
  // 👤 DASHBOARD PACIENTE
  // ==========================
  if (user?.role?.name === "paciente") {
    const turnosOrdenados = [...turnos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return (
      <MainLayout>
        <div className="p-6 space-y-8">
          <h1 className="text-3xl font-semibold text-gray-900">Mis turnos</h1>
          <p className="text-gray-600">Podés ver tus turnos y solicitar uno nuevo.</p>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-5 h-5" /> Solicitar nuevo turno
            </button>
          ) : (
            <form
              onSubmit={handleSolicitarTurno}
              className="bg-white border rounded-lg shadow-sm p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  className="mt-1 border rounded w-full p-2"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hora</label>
                <input
                  type="time"
                  className="mt-1 border rounded w-full p-2"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Motivo</label>
                <input
                  type="text"
                  className="mt-1 border rounded w-full p-2"
                  placeholder="Motivo del turno"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Confirmar solicitud
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <TurnosTable title="Historial de mis turnos" turnos={turnosOrdenados} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Panel en construcción para tu rol: {user?.role?.name}
        </h1>
      </div>
    </MainLayout>
  );
}

// --- COMPONENTE TARJETA ---
const Card = ({ icon: Icon, title, value, color }) => (
  <div className="flex items-center bg-white border shadow-sm rounded-lg p-5">
    <Icon className={`w-8 h-8 mr-3 ${color}`} />
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

// --- COMPONENTE TABLA REUTILIZABLE ---
const TurnosTable = ({ title, turnos }) => (
  <section className="bg-white border rounded-lg shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {turnos.length === 0 ? (
      <p className="text-gray-500 text-sm">No hay turnos registrados.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm text-gray-700">Paciente</th>
              <th className="px-4 py-2 text-left text-sm text-gray-700">Kinesiólogo</th>
              <th className="px-4 py-2 text-left text-sm text-gray-700">Fecha</th>
              <th className="px-4 py-2 text-left text-sm text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{t.paciente?.nombre || "—"}</td>
                <td className="px-4 py-2 text-sm">{t.kinesiologo?.nombre || "—"}</td>
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
);
