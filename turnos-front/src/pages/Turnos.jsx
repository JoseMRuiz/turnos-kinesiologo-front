import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { getTurnos, createTurno, updateEstadoTurno } from "../api/turnos";
import { getUsers } from "../api/users";
import Swal from "sweetalert2";

export default function Turnos() {
  const [turnos, setTurnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nuevoTurno, setNuevoTurno] = useState({
    paciente_id: "",
    kinesiologo_id: "",
    fecha: "",
    hora: "",
    motivo: "",
  });

  const loadTurnos = async () => {
    try {
      const res = await getTurnos();
      setTurnos(res.data);
    } catch (err) {
      console.error("Error cargando turnos:", err);
      setError("No se pudieron cargar los turnos.");
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const res = await getUsers();
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  useEffect(() => {
    loadTurnos();
    loadUsuarios();
  }, []);

  // Filtrar roles (ajusta los IDs según tu base)
  const pacientes = usuarios.filter((u) => u.role_id === 10);
  const kinesiologos = usuarios.filter((u) => u.role_id === 8);

  const handleCrearTurno = async (e) => {
    e.preventDefault();

    const { paciente_id, kinesiologo_id, fecha, hora, motivo } = nuevoTurno;

    if (!paciente_id || !kinesiologo_id || !fecha || !hora) {
      Swal.fire("Atención", "Completa todos los campos", "warning");
      return;
    }

    const horaISO = hora.includes("Z") ? hora : `${hora}:00.000Z`;

    const payload = {
      fecha,
      hora: horaISO,
      motivo: motivo || "Turno programado",
      paciente_id: Number(paciente_id),
      kinesiologo_id: Number(kinesiologo_id),
    };

    try {
      await createTurno(payload);
      Swal.fire("Éxito", "Turno creado correctamente", "success");
      setNuevoTurno({
        paciente_id: "",
        kinesiologo_id: "",
        fecha: "",
        hora: "",
        motivo: "",
      });
      loadTurnos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo crear el turno", "error");
    }
  };

  const handleCambiarEstado = async (turnoId, nuevoEstado) => {
    try {
      await updateEstadoTurno(turnoId, { estado: nuevoEstado });
      Swal.fire("Actualizado", "El estado del turno fue actualizado.", "success");
      loadTurnos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cambiar el estado.", "error");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-gray-900">Gestión de Turnos</h1>
          <p className="text-gray-600 mt-1">
            Administra los turnos de pacientes y kinesiólogos.
          </p>
        </header>

        {/* Crear nuevo turno */}
        <section className="bg-white shadow border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Crear nuevo turno</h2>
          <form onSubmit={handleCrearTurno} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
              <select
                value={nuevoTurno.paciente_id}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, paciente_id: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kinesiólogo</label>
              <select
                value={nuevoTurno.kinesiologo_id}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, kinesiologo_id: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Seleccionar kinesiólogo</option>
                {kinesiologos.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={nuevoTurno.fecha}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, fecha: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                value={nuevoTurno.hora}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, hora: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input
                type="text"
                placeholder="Motivo del turno"
                value={nuevoTurno.motivo}
                onChange={(e) => setNuevoTurno({ ...nuevoTurno, motivo: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Crear
              </button>
            </div>
          </form>
        </section>

        {/* Lista de turnos */}
        <section className="bg-white shadow border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Turnos</h2>
          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : turnos.length === 0 ? (
            <p className="text-gray-500">No hay turnos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Paciente</th>
                    <th className="px-4 py-2 text-left">Kinesiólogo</th>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Hora</th>
                    <th className="px-4 py-2 text-left">Estado</th>
                    <th className="px-4 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 border-b">{t.paciente?.nombre || "—"}</td>
                      <td className="px-4 py-2 border-b">{t.kinesiologo?.nombre || "—"}</td>
                      <td className="px-4 py-2 border-b">{t.fecha}</td>
                      <td className="px-4 py-2 border-b">{t.hora?.slice(0, 5)}</td>
                      <td className="px-4 py-2 border-b capitalize">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            t.estado === "pendiente"
                              ? "bg-yellow-100 text-yellow-700"
                              : t.estado === "confirmado"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b text-center space-x-2">
                        <button
                          onClick={() => handleCambiarEstado(t.id, "confirmado")}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleCambiarEstado(t.id, "cancelado")}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cancelar
                        </button>
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
