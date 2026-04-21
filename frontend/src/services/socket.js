import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function createSocket(token) {
  if (!token) return null;

  return io(SOCKET_URL, {
    transports: ["polling", "websocket"], // polling pehle — Render pe websocket upgrade hoti he
    auth: { token }
  });
}