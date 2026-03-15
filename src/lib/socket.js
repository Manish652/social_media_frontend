import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://social-media-backend-m0n7.onrender.com/api";
const LOCAL_SOCKET_URL = "http://localhost:5000/api";

const socket = io(LOCAL_SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

socket.on("connect", () => {
  console.log("✅ [socket] connected", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ [socket] connect_error:", err?.message || err);
});

socket.on("error", (err) => {
  console.error("❌ [socket] error:", err?.message || err);
});

socket.on("disconnect", (reason) => {
  console.log("⚠️ [socket] disconnected:", reason);
});

export default socket;
