import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:5000");
    socket.emit("join", userId);
  }
};

export const getSocket = () => socket;