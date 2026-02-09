import { io } from "socket.io-client";

<<<<<<< HEAD
const socket = io(import.meta.env.VITE_SOCKET_URL||"https://socialmediabackend-production-0a44.up.railway.app", {
=======
const socket = io(import.meta.env.VITE_SOCKET_URL || "https://socialmediabackend-production-0a44.up.railway.app", {
>>>>>>> 4bd4cdd5bb72c68fb8c5b04b6dc216d8ceb7235f
  withCredentials: true,
  autoConnect: false,
});

// Basic diagnostics
socket.on("connect", () => console.log("[socket] connected", socket.id));
socket.on("connect_error", (err) => console.warn("[socket] connect_error", err?.message || err));
socket.on("error", (err) => console.warn("[socket] error", err?.message || err));
socket.on("disconnect", (reason) => console.log("[socket] disconnected", reason));

export default socket;
