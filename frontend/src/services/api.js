import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function loginApi(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
}

export async function fetchPeerUserApi() {
  const { data } = await api.get("/api/users/peer");
  return data.peerEmail || "";
}

export default api;
