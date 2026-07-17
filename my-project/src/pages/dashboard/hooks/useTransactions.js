import { useEffect, useState, useCallback } from "react";
import {
  getTransactions,
  createTransaction,
} from "../services/transactionService";
import { getSocket } from "../../socket/socket";

/* =========================
   NORMALIZER
========================= */
const normalize = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.transactions)) return res.transactions;
  return [];
};

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH
  ========================= */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransactions();
      setTransactions(normalize(res));
    } catch (err) {
      console.error("Transaction fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     CREATE (OPTIMISTIC)
  ========================= */
  const addTransaction = useCallback(async (payload) => {
    try {
      const temp = {
        ...payload,
        _id: Date.now(), // temp ID
      };

      // optimistic update
      setTransactions((prev) => [temp, ...prev]);

      const saved = await createTransaction(payload);

      // replace temp with real
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === temp._id ? saved?.data || saved : t
        )
      );
    } catch (err) {
      console.error("Create transaction failed:", err);
    }
  }, []);

  /* =========================
     SOCKET SYNC
  ========================= */
  useEffect(() => {
    const socket = getSocket();

    socket?.on("transaction:created", (tx) => {
      setTransactions((prev) => {
        const exists = prev.find((t) => t._id === tx._id);
        if (exists) return prev;
        return [tx, ...prev];
      });
    });

    return () => {
      socket?.off("transaction:created");
    };
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    refetch: fetchTransactions,
    addTransaction,
  };
};

export default useTransactions;