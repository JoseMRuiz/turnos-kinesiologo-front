import { useEffect, useState } from "react";
import { kinesApi } from "../api/kines"; // API específica del kinesiólogo
import MainLayout from "../components/layout/MainLayout";


export function KinesTurnosPage() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Cargar los turnos del kinesiólogo
  const loadTurnos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await kinesApi.getMyAppointments();
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

  return (
    <MainLayout>

    
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">🗓️ Mis Turnos</h1>

      {/* Estado de carga */}
      {loading && (
        <p className="text-gray-600 animate-pulse">Cargando tus turnos...</p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Sin turnos */}
      {!loading && !error && turnos.length === 0 && (
        <p className="text-gray-700">No tenés turnos asignados.</p>
      )}

      {/* Tabla de turnos */}
      {!loading && !error && turnos.length > 0 && (
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
                  Estado
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Nota
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
