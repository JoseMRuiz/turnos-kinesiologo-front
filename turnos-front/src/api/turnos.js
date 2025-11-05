import api from "./Client";

// Obtener todos los turnos
export const getTurnos = () => api.get("/turnos/");

// Crear un nuevo turno
export const createTurno = (data) => api.post("/turnos/", data);

// Cambiar el estado de un turno
export const updateEstadoTurno = (turnoId, data) => {
  
  return api.put(`/turnos/${turnoId}/estado`, data);
};
