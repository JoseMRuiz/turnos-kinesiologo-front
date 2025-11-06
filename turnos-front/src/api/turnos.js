import api from "./Client";

// 🔹 Listar todos los turnos
export const getTurnos = () => api.get("/turnos/");

// 🔹 Crear turno (paciente)
export const createTurno = (data) => api.post("/turnos/", data);



// 🔹 Cambiar estado (admin / recepcionista / kine)
export const updateEstadoTurno = (turnoId, estado) =>
  api.put(`/turnos/${turnoId}/estado`, { estado });



// Paciente → obtiene solo sus turnos
export const getMyTurnos = () => api.get("/turnos/mios");