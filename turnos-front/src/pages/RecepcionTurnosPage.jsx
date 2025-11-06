import { useEffect, useState } from "react";
import { recepcionApi } from "../api/recepcion";
import MainLayout from "../components/layout/MainLayout";

export function RecepcionTurnosPage() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // 🔹 Cargar todos los turnos
  const loadTurnos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await recepcionApi.getAllAppointments();
      setTurnos(data);
    } catch (err) {
      console.error("Error cargando turnos:", err);
      setError("Ocurrió un error al cargar los turnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurnos();
  }, []);

  // 🔹 Confirmar o cancelar un turno
  const handleUpdateEstado = async (id, estado) => {
    try {
      setUpdating(id);
      await recepcionApi.updateAppointmentStatus(id, { estado });
      await loadTurnos(); // refresca la lista
    } catch (err) {
      console.error("Error actualizando turno:", err);
      alert("Error al actualizar el turno.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <MainLayout>

    
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">📋 Gestión de Turnos</h1>

      {/* Estado de carga */}
      {loading && (
        <p className="text-gray-600 animate-pulse">Cargando turnos...</p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Tabla de turnos */}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Fecha / Hora
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Paciente
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Kinesiólogo
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Estado
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Nota
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {turnos.map((turno) => (
                <tr
                  key={turno.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(`${turno.fecha}T${turno.hora}`).toLocaleString(
                      "es-AR",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {turno.paciente_nombre || `#${turno.paciente_id}`}
                  </td>
                  <td className="px-4 py-2">
                    {turno.kinesiologo_nombre || `#${turno.kinesiologo_id}`}
                  </td>
                  <td
                    className={`px-4 py-2 capitalize font-medium ${
                      turno.estado === "confirmado"
                        ? "text-green-600"
                        : turno.estado === "cancelado"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {turno.estado}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {turno.nota ? (
                      <span>{turno.nota}</span>
                    ) : (
                      <span className="italic text-gray-400">Sin notas</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    {turno.estado === "pendiente" ? (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateEstado(turno.id, "confirmado")
                          }
                          disabled={updating === turno.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                        >
                          {updating === turno.id ? "Procesando..." : "Confirmar"}
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateEstado(turno.id, "cancelado")
                          }
                          disabled={updating === turno.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </MainLayout>
  );
}
