import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
  }
  return socket;
};

const useDashboardSocket = (userId, handler) => {
  const handlerRef = useRef(handler);

  // always keep latest handler (prevents re-subscription)
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!userId) return;

    const s = getSocket();

    s.emit("join:user", { userId });

    const emit = (type) => (data) => {
      handlerRef.current?.({ type, data });
    };

    // EVENTS (clean mapping layer)
    s.on("transaction:created", emit("transaction:created"));
    s.on("transaction:updated", emit("transaction:updated"));
    s.on("balance:updated", emit("balance:updated"));
    s.on("analytics:updated", emit("analytics:updated"));
    s.on("notification:new", emit("notification:new"));

    return () => {
      s.off("transaction:created");
      s.off("transaction:updated");
      s.off("balance:updated");
      s.off("analytics:updated");
      s.off("notification:new");
    };
  }, [userId]);
};

export default useDashboardSocket;