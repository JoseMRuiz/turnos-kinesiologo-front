import api from "./Client";

// 🔹 Login
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { access_token, token_type }
};

// 🔹 Registro
export const registerUser = async (nombre, email, password) => {
  const res = await api.post("/auth/register", { nombre, email, password });
  return res.data; // { access_token, token_type }
};



// 🔹 Obtener usuario actual
export const getCurrentUser = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

// 🔹 Logout
export const logout = () => {
  localStorage.removeItem("token");
};
