import { useEffect, useState } from "react";
import { getReporteTurnos, descargarReportePDF } from "../api/Reportes";
import MainLayout from "../components/layout/MainLayout";

export default function AdminReportesTurnos() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 👉 Cargar datos del backend
useEffect(() => {
  const fetchReport = async () => {
    try {
      const response = await getReporteTurnos();
      setData({
        por_estado: response.por_estado || {},
        por_kinesiologo: response.por_kinesiologo || {},
        por_mes: response.por_mes || {}
      });
    } catch (err) {
      setError("No se pudo cargar el reporte");
    } finally {
      setLoading(false);
    }
  };
  fetchReport();
}, []);


  // 👉 Descargar PDF
  const handleDescargarPDF = async () => {
    try {
      await descargarReportePDF();
    } catch {
      alert("No se pudo generar el PDF del reporte");
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Cargando reporte...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <MainLayout>

    
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-900 mb-1"> Reporte de Turnos</h1>

      {/* Tarjetas */}
      <div className="grid md:grid-cols-3 sm:grid-cols-1 gap-6">
        {/* Por estado */}
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Por Estado</h2>
          {Object.entries(data.por_estado).map(([estado, cantidad]) => (
            <div key={estado} className="flex justify-between text-sm border-b border-gray-100 pb-1">
              <span className="capitalize">{estado}</span>
              <span className="font-bold">{cantidad}</span>
            </div>
          ))}
        </div>

        {/* Por kinesiólogo */}
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Por Kinesiólogo</h2>
          {Object.entries(data.por_kinesiologo).map(([nombre, cantidad]) => (
            <div key={nombre} className="flex justify-between text-sm border-b border-gray-100 pb-1">
              <span>{nombre}</span>
              <span className="font-bold">{cantidad}</span>
            </div>
          ))}
        </div>

        {/* Por mes */}
        <div className="bg-white shadow-md rounded-lg p-5 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Por Mes</h2>
          {Object.entries(data.por_mes).map(([mes, cantidad]) => (
            <div key={mes} className="flex justify-between text-sm border-b border-gray-100 pb-1">
              <span>{mes}</span>
              <span className="font-bold">{cantidad}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón */}
      <div className="mt-8 text-center">
        <button
          onClick={handleDescargarPDF}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          📥 Descargar PDF
        </button>
      </div>
    </div>
    </MainLayout>
  );
}
