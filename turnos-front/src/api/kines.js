// src/api/kines.js
import api from "./Client";

export const kinesApi = {
  // Listar turnos del kinesiólogo autenticado
  getMyAppointments() {
    return api.get("/kines/turnos");
  },
};
