import MainLayout from "../components/layout/MainLayout";

export default function Pacientes() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">Pacientes</h1>
      <p className="text-gray-600">
        Aquí podrás ver, registrar y gestionar los pacientes del sistema.
      </p>
    </MainLayout>
  );
}
