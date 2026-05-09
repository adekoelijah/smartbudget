// import { useEffect, useMemo, useState, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// /* SERVICES */
// import { getTransactions } from "./services/transactionService";

// /* ENGINE */
// import { computeFinancials } from "./engine/FinancialEngine";

// /* COMPONENTS */
// import DashboardHeader from "./components/DashboardHeader";
// import DashboardStats from "./components/DashboardStats";
// //import SummaryCards from "./components/SummaryCards";

// import RealTimeBalanceEngine from "./components/RealTimeBalanceEngine";
// import QuickActionsBar from "./components/QuickActionsBar";
// import MoneyMovementPanel from "./section/MoneyMovementPanel";

// import AnalyticsSwitcherEngine from "./section/AnalyticsSwitcherEngine";
// import InsightsPanel from "./section/InsightsPanel";

// import TransactionHistory from "./section/TransactionHistory";
// import TransactionAuditTrail from "./components/TransactionAuditTrail";

// import NotificationCenter from "./section/NotificationCenter";

// /* SOCKET */
// import useSocket from "./hooks/useDashboardSocket";

// /* =========================
//    DASHBOARD
// ========================= */

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);
//   const [transactions, setTransactions] = useState([]);
//   const [notifications, setNotifications] = useState([]);

//   const userId = useMemo(() => {
//     return JSON.parse(localStorage.getItem("user"))?.id;
//   }, []);

//   /* =========================
//      LOAD DATA (SOURCE OF TRUTH)
//   ========================= */
//   const loadTransactions = useCallback(async () => {
//     try {
//       setLoading(true);

//       const res = await getTransactions();

//       if (res.success) {
//         setTransactions(res.data);
//       }
//     } catch (err) {
//       console.error("Load error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadTransactions();
//   }, [loadTransactions]);

//   /* =========================
//      FINANCIAL ENGINE (CORE)
//   ========================= */
//   const financials = useMemo(() => {
//     return computeFinancials(transactions);
//   }, [transactions]);

//   /* =========================
//      SOCKET REAL-TIME SYNC
//   ========================= */
//   useSocket(userId, (event) => {
//     if (!event) return;

//     switch (event.type) {
//       case "transaction:created":
//         setTransactions((prev) => {
//           const exists = prev.find(
//             (t) => t._id === event.data._id
//           );
//           if (exists) return prev;
//           return [event.data, ...prev];
//         });

//         setNotifications((prev) => [
//           {
//             type: "success",
//             message: "Transaction added",
//           },
//           ...prev,
//         ]);
//         break;

//       case "transaction:updated":
//         setTransactions((prev) =>
//           prev.map((t) =>
//             t._id === event.data._id ? event.data : t
//           )
//         );
//         break;

//       case "transaction:deleted":
//         setTransactions((prev) =>
//           prev.filter((t) => t._id !== event.data)
//         );
//         break;

//       case "notification:new":
//         setNotifications((prev) => [
//           event.data,
//           ...prev,
//         ]);
//         break;

//       default:
//         break;
//     }
//   });

//   /* =========================
//      LOADING UI
//   ========================= */
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-6 animate-pulse space-y-4">
//         <div className="h-20 bg-white rounded-3xl" />
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="h-28 bg-white rounded-3xl" />
//           <div className="h-28 bg-white rounded-3xl" />
//           <div className="h-28 bg-white rounded-3xl" />
//           <div className="h-28 bg-white rounded-3xl" />
//         </div>
//         <div className="h-64 bg-white rounded-3xl" />
//       </div>
//     );
//   }

//   /* =========================
//      UI
//   ========================= */
//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* HEADER */}
//         <DashboardHeader
//           user={{ name: "User" }}
//           status={{ isOnline: true }}
//         />

//         {/* STATS (ENGINE DRIVEN) */}
//         <DashboardStats data={transactions} />

//         {/* SUMMARY + BALANCE */}
//         <div className="grid lg:grid-cols-2 gap-6">
//           <RealTimeBalanceEngine transactions={transactions} />
//           <QuickActionsBar />
//         </div>

//         {/* MONEY MOVEMENT */}
//         <MoneyMovementPanel />

//         {/* ANALYTICS */}
//         <AnalyticsSwitcherEngine
//           data={{
//             monthly: financials.monthly,
//             categories: financials.categories,
//           }}
//         />

//         {/* INSIGHTS */}
//         <InsightsPanel data={financials} />

//         {/* TRANSACTIONS */}
//         <TransactionHistory data={transactions} />

//         {/* AUDIT TRAIL */}
//         <TransactionAuditTrail data={transactions} />

//         {/* NOTIFICATIONS */}
//         <NotificationCenter data={notifications} />

//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { motion } from "framer-motion";

/* SERVICES */
import {
  getTransactions,
} from "./services/transactionService";

/* ENGINE */
import {
  computeFinancials,
} from "./engine/FinancialEngine";

/* COMPONENTS */
import DashboardHeader from "./components/DashboardHeader";
import DashboardStats from "./components/DashboardStats";

import RealTimeBalanceEngine from "./components/RealTimeBalanceEngine";

import QuickActionsBar from "./components/QuickActionsBar";

import MoneyMovementPanel from "./section/MoneyMovementPanel";

import AnalyticsSwitcherEngine from "./section/AnalyticsSwitcherEngine";

import InsightsPanel from "./section/InsightsPanel";

import TransactionHistory from "./section/TransactionHistory";

import TransactionAuditTrail from "./components/TransactionAuditTrail";

import NotificationCenter from "./section/NotificationCenter";

//new 
import { useNavigate } from "react-router-dom";

import TransactionModal from "./components/TransactionModal";

import {
  exportTransactionsCSV,
} from "./services/transactionService";

/* SOCKET */
import useSocket from "./hooks/useDashboardSocket";

/* =========================================
   NORMALIZER
========================================= */
const normalizeTransactions = (input) => {
  if (!input) return [];

  if (Array.isArray(input)) return input;

  if (Array.isArray(input?.transactions))
    return input.transactions;

  if (Array.isArray(input?.data))
    return input.data;

  if (Array.isArray(input?.data?.transactions))
    return input.data.transactions;

  return [];
};

/* =========================================
   DASHBOARD
========================================= */
const Dashboard = () => {
  const [loading, setLoading] =
    useState(true);

  const [transactions, setTransactions] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);

    //new 
    /* =========================================
   QUICK ACTION HANDLERS
========================================= */

/**
 * CREATE TRANSACTION
 */
const handleCreateTransaction = (
  type = "expense"
) => {
  setTransactionType(type);
  setTransactionModalOpen(true);
};

/**
 * OPEN GENERIC MODAL
 */
const handleOpenTransactionModal =
  () => {
    setTransactionType("expense");
    setTransactionModalOpen(true);
  };

/**
 * REFRESH DASHBOARD
 */
const handleRefresh =
  async () => {
    try {
      await loadTransactions();

      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "info",
          message:
            "Dashboard refreshed",
          createdAt: new Date(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(
        "Refresh error:",
        err
      );
    }
  };

/**
 * EXPORT CSV
 */
const handleExport =
  async () => {
    try {
      exportTransactionsCSV(
        transactions
      );

      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "success",
          message:
            "Transactions exported successfully",
          createdAt: new Date(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(
        "Export failed:",
        err
      );
    }
  };

/**
 * ANALYTICS ROUTE
 */
const handleAnalytics =
  () => {
    navigate("/analytics");
  };



    //new 

    const navigate = useNavigate();

     const [transactionModalOpen, setTransactionModalOpen] =
  useState(false);

   const [transactionType, setTransactionType] =
  useState("expense");

     const [refreshing, setRefreshing] =
  useState(false);
  /* =========================================
     USER
  ========================================= */
  const userId = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      )?.id;
    } catch {
      return null;
    }
  }, []);

  /* =========================================
     LOAD TRANSACTIONS
  ========================================= */
  const loadTransactions =
  useCallback(async () => {
    try {
      setRefreshing(true);

      const res =
        await getTransactions();

      const tx =
        normalizeTransactions(res);

      setTransactions(tx);
    } catch (err) {
      console.error(
        "Dashboard load error:",
        err
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  /* =========================================
     CENTRAL FINANCIAL ENGINE
  ========================================= */
  const financials = useMemo(() => {
    return computeFinancials(
      transactions
    );
  }, [transactions]);

  /* =========================================
     SOCKET REAL-TIME SYNC
  ========================================= */
  useSocket(userId, (event) => {
    if (!event?.type) return;

    switch (event.type) {
      /* =========================
         CREATED
      ========================= */
      case "transaction:created": {
        const tx = event.data;

        setTransactions((prev) => {
          const exists = prev.some(
            (p) => p._id === tx._id
          );

          if (exists) return prev;

          return [tx, ...prev];
        });

        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "success",
            message:
              "Transaction added successfully",
            createdAt: new Date(),
          },
          ...prev,
        ]);

        break;
      }

      /* =========================
         UPDATED
      ========================= */
      case "transaction:updated": {
        const tx = event.data;

        setTransactions((prev) =>
          prev.map((item) =>
            item._id === tx._id
              ? tx
              : item
          )
        );

        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "info",
            message:
              "Transaction updated",
            createdAt: new Date(),
          },
          ...prev,
        ]);

        break;
      }

      /* =========================
         DELETED
      ========================= */
      case "transaction:deleted": {
        const id = event.data;

        setTransactions((prev) =>
          prev.filter(
            (item) => item._id !== id
          )
        );

        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "danger",
            message:
              "Transaction deleted",
            createdAt: new Date(),
          },
          ...prev,
        ]);

        break;
      }

      /* =========================
         PUSH NOTIFICATIONS
      ========================= */
      case "notification:new": {
        setNotifications((prev) => [
          event.data,
          ...prev,
        ]);

        break;
      }

      default:
        break;
    }
  });

  /* =========================================
     LOADING STATE
  ========================================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">

          <div className="h-24 rounded-3xl bg-white" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="h-32 rounded-3xl bg-white" />
            <div className="h-32 rounded-3xl bg-white" />
            <div className="h-32 rounded-3xl bg-white" />
            <div className="h-32 rounded-3xl bg-white" />
          </div>

          <div className="h-96 rounded-3xl bg-white" />

        </div>
      </div>
    );
  }

  /* =========================================
     UI
  ========================================= */
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        {/* =====================================
            HEADER
        ===================================== */}
        <DashboardHeader
  user={JSON.parse(localStorage.getItem("user"))}
  status={{
    isOnline: navigator.onLine,
    lastSync: new Date(),
  }}
  notificationsCount={notifications.length}
  loading={loading}
  syncing={refreshing}
  onRefresh={loadTransactions}
  onExport={handleExport}
/>

        {/* =====================================
            KPI STATS
        ===================================== */}
        <DashboardStats
          transactions={transactions}
        />

        {/* =====================================
            BALANCE + ACTIONS
        ===================================== */}
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">

          <div className="xl:col-span-2">
            <RealTimeBalanceEngine
              transactions={transactions}
            />
          </div>

          <div>
            <QuickActionsBar
  onCreateTransaction={
    handleCreateTransaction
  }
  onRefresh={handleRefresh}
  onOpenExport={handleExport}
  onOpenAnalytics={
    handleAnalytics
  }
  onOpenTransactionModal={
    handleOpenTransactionModal
  }
  refreshing={refreshing}
/>
            
          </div>

        </div>

        {/* =====================================
            MONEY FLOW
        ===================================== */}
        {/* <MoneyMovementPanel
          transactions={transactions}
        /> */}

        {/* =====================================
            ANALYTICS
        ===================================== */}
        <AnalyticsSwitcherEngine
          transactions={transactions}
        />

        {/* =====================================
            AI INSIGHTS
        ===================================== */}
        <InsightsPanel
          transactions={transactions}
          financials={financials}
        />

        {/* =====================================
            TRANSACTION HISTORY
        ===================================== */}
        {/* <TransactionHistory
          transactions={transactions}
        /> */}

        {/* =====================================
            AUDIT TRAIL
        ===================================== */}
        <TransactionAuditTrail
          transactions={transactions}
        />

        {/* =====================================
            NOTIFICATIONS
        ===================================== */}
        <NotificationCenter
          notifications={
            notifications
          }
        />
        
        <TransactionModal
  open={transactionModalOpen}
  type={transactionType}
  onClose={() =>
    setTransactionModalOpen(false)
  }
  onSuccess={(transaction) => {
    setTransactions((prev) => [
      transaction,
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: Date.now(),
        type: "success",
        message:
          "Transaction created successfully",
      },
      ...prev,
    ]);

    setTransactionModalOpen(false);
  }}
/>

      </div>
    </div>
  );
};

export default Dashboard;