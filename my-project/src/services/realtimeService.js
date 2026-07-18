
/**
 * ⚡ REAL-TIME SERVICE (SAAS LAYER)
 * Handles WebSocket connection for live dashboard updates
 */

class RealtimeService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket) return;

    const WS_URL =
      import.meta.env.VITE_WS_URL || "wss://smartbudgets.vercel.app/api/realtime";

    this.socket = new WebSocket(`${WS_URL}?userId=${userId}`);

    this.socket.onopen = () => {
      console.log("⚡ WebSocket connected");
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };

    this.socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
      this.socket = null;
    };
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => cb(data));
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);

    return () => {
      this.listeners.set(
        event,
        this.listeners.get(event).filter((cb) => cb !== callback)
      );
    };
  }

  send(event, payload) {
    if (!this.socket) return;

    this.socket.send(
      JSON.stringify({
        event,
        payload,
      })
    );
  }
}

export const realtimeService = new RealtimeService();