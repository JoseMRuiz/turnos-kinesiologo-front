import api from "./Client";

// Obtener todos los usuarios
export const getUsers = () => api.get("/users");

// Obtener perfil del usuario autenticado
export const getProfile = () => api.get("/users/me");

// Eliminar usuario
export const deleteUser = (userId) => api.delete(`/users/${userId}`);

// Asignar rol a usuario
export const assignRoleToUser = (userId, roleId) =>
  api.put(`/users/${userId}/role/${roleId}`);

// Roles
export const getRoles = () => api.get("/roles");
export const createRole = (data) => api.post("/roles", data);


