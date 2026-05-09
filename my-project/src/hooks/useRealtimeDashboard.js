
import { useEffect, useState } from "react";
import { realtimeService } from "../services/realtimeService";

/**
 * ⚡ REAL-TIME DASHBOARD HOOK
 * Syncs backend events → UI state instantly
 */

const useRealtimeDashboard = (userId) => {
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    if (!userId) return;

    realtimeService.connect(userId);

    // 💰 LIVE TRANSACTIONS STREAM
    const unsubscribeTx = realtimeService.subscribe(
      "transaction:new",
      (tx) => {
        setLiveTransactions((prev) => [tx, ...prev]);
      }
    );

    // 🚨 AI ALERT STREAM
    const unsubscribeAlert = realtimeService.subscribe(
      "ai:alert",
      (alert) => {
        setLiveAlerts((prev) => [alert, ...prev]);
      }
    );

    return () => {
      unsubscribeTx();
      unsubscribeAlert();
    };
  }, [userId]);

  return {
    liveTransactions,
    liveAlerts,
  };
};

export default useRealtimeDashboard;