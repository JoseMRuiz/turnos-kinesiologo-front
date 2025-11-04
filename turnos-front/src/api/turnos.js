import api from "./Client";

export const getTurnos = async () => {
  const res = await api.get("/turnos/");
  return res.data;
};

export const crearTurno = async (turno) => {
  const res = await api.post("/turnos/", turno);
  return res.data;
};

export const cambiarEstadoTurno = async (id, estado) => {
  const res = await api.put(`/turnos/${id}/estado`, { estado });
  return res.data;
};
