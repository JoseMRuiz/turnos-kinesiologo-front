import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 🔹 Páginas
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Usuarios from "../pages/Usuarios";
import Turnos from "../pages/Turnos";
import Citas from "../pages/Citas";
import Reportes from "../pages/Reportes";
import Roles from "../pages/Roles";
import { KinesTurnosPage } from "../pages/KinesTurnosPage";
import { RecepcionTurnosPage } from "../pages/RecepcionTurnosPage";

// 🔒 Contexto de autenticación
import { useAuth } from "../context/AuthContext";

// =====================================
// 🔐 Componente de ruta privada
// =====================================
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  // Si no hay usuario autenticado → redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles definidos, valida que el usuario tenga permiso
  if (roles && !roles.includes(user.role?.name)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está OK → renderiza el contenido protegido
  return children;
}

// =====================================
// 🧭 Ruteo principal de la app
// =====================================
export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* 🔓 RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔒 RUTAS PRIVADAS (requieren autenticación) */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Usuarios */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Usuarios />
            </PrivateRoute>
          }
        />

        {/* Turnos (genéricos / admin / recepcionista) */}
        <Route
          path="/turnos"
          element={
            <PrivateRoute>
              <Turnos />
            </PrivateRoute>
          }
        />

        {/* Citas (paciente o uso general) */}
        <Route
          path="/citas"
          element={
            <PrivateRoute>
              <Citas />
            </PrivateRoute>
          }
        />

        {/* Reportes (solo admin) */}
        <Route
          path="/reportes"
          element={
            <PrivateRoute roles={["admin"]}>
              <Reportes />
            </PrivateRoute>
          }
        />

        {/* Roles (solo admin) */}
        <Route
          path="/roles"
          element={
            <PrivateRoute roles={["admin"]}>
              <Roles />
            </PrivateRoute>
          }
        />

        {/* Recepcionista */}
        <Route
          path="/recep"
          element={
            <PrivateRoute roles={["recepcionista"]}>
              <RecepcionTurnosPage />
            </PrivateRoute>
          }
        />

        {/* Kinesiólogo */}
        <Route
          path="/kines"
          element={
            <PrivateRoute roles={["kinesiologo"]}>
              <KinesTurnosPage />
            </PrivateRoute>
          }
        />

        {/* 🔁 Ruta por defecto: redirige al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
