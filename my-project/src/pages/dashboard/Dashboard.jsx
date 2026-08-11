
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

/* ============================================================
   SERVICES
============================================================ */

import {
  getTransactions,
  exportTransactionsCSV,
} from "./services/transactionService";

/* ============================================================
   PREFERENCES
============================================================ */

import usePreferences from "../settings/hooks/usePreferences";


/* ============================================================
   ENGINE
============================================================ */

import {
  computeFinancials,
} from "./engine/FinancialEngine";

/* ============================================================
   COMPONENTS
============================================================ */

import DashboardHeader from "./components/DashboardHeader";
import DashboardStats from "./components/DashboardStats";
import RealTimeBalanceEngine from "./components/RealTimeBalanceEngine";
import QuickActionsBar from "./components/QuickActionsBar";
import TransactionAuditTrail from "./components/TransactionAuditTrail";
import TransactionModal from "./components/TransactionModal";

/* ============================================================
   SECTIONS
============================================================ */

import AnalyticsSwitcherEngine from "./section/AnalyticsSwitcherEngine";
import InsightsPanel from "./section/InsightsPanel";

/* ============================================================
   SOCKET
============================================================ */

import useSocket from "./hooks/useDashboardSocket";

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_USER = {
  id: null,
  firstName: "",
  lastName: "",
  email: "",
};

/* ============================================================
   TRANSACTION NORMALIZER
============================================================ */

const normalizeTransactions = (input) => {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input;
  }

  if (Array.isArray(input.transactions)) {
    return input.transactions;
  }

  if (Array.isArray(input.data)) {
    return input.data;
  }

  if (
    input.data &&
    Array.isArray(input.data.transactions)
  ) {
    return input.data.transactions;
  }

  return [];
};

/* ============================================================
   USER NORMALIZER
============================================================ */

const getStoredUser = () => {
  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return DEFAULT_USER;
    }

    const parsedUser =
      JSON.parse(storedUser);

    if (
      !parsedUser ||
      typeof parsedUser !== "object"
    ) {
      return DEFAULT_USER;
    }

    return {
      ...DEFAULT_USER,
      ...parsedUser,
    };
  } catch (error) {
    console.warn(
      "DASHBOARD_USER_PARSE_ERROR:",
      error
    );

    return DEFAULT_USER;
  }
};

/* ============================================================
   TRANSACTION ID
============================================================ */

const getTransactionId = (transaction) => {
  if (!transaction) {
    return null;
  }

  return (
    transaction._id ??
    transaction.id ??
    null
  );
};

/* ============================================================
   DASHBOARD
============================================================ */

const Dashboard = () => {
  const navigate = useNavigate();

  /* ==========================================================
     PREFERENCES
  ========================================================== */

  const {
    preferences,
    loading: preferencesLoading,
    error: preferencesError,
  } = usePreferences();

  /* ==========================================================
     USER
  ========================================================== */

  const [user] = useState(
    () => getStoredUser()
  );

  const userId = useMemo(
    () =>
      user?.id ??
      user?._id ??
      null,
    [user]
  );

  /* ==========================================================
     TRANSACTIONS
  ========================================================== */

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  /* ==========================================================
     TRANSACTION MODAL
  ========================================================== */

  const [
    transactionModalOpen,
    setTransactionModalOpen,
  ] = useState(false);

  const [
    transactionType,
    setTransactionType,
  ] = useState("expense");

  /* ==========================================================
     ONLINE STATUS
  ========================================================== */

  const [
    isOnline,
    setIsOnline,
  ] = useState(
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );

  /* ==========================================================
     LAST SYNC
  ========================================================== */

  const [
    lastSync,
    setLastSync,
  ] = useState(null);

  /* ==========================================================
     PREFERENCE VALUES
  ========================================================== */

  const currency =
    preferences?.regional?.currency ??
    "NGN";

  const language =
    preferences?.regional?.language ??
    "en";

  /* ==========================================================
     LOAD TRANSACTIONS
  ========================================================== */

  const loadTransactions =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!silent) {
          setRefreshing(true);
        }

        try {
          const response =
            await getTransactions();

          const normalized =
            normalizeTransactions(
              response
            );

          setTransactions(
            normalized
          );

          setLastSync(
            new Date()
          );

          return {
            success: true,
            transactions:
              normalized,
          };
        } catch (error) {
          console.error(
            "DASHBOARD_LOAD_ERROR:",
            error
          );

          return {
            success: false,
            transactions: [],
            error,
          };
        } finally {
          setLoading(false);

          if (!silent) {
            setRefreshing(false);
          }
        }
      },
      []
    );

  /* ==========================================================
     INITIAL TRANSACTION LOAD
  ========================================================== */

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  /* ==========================================================
     ONLINE / OFFLINE LISTENERS
  ========================================================== */

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  /* ==========================================================
     DOCUMENT LANGUAGE
  ========================================================== */

  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      language
    ) {
      document.documentElement.lang =
        language;
    }
  }, [language]);

  /* ==========================================================
     FINANCIAL ENGINE
  ========================================================== */

  const financials = useMemo(() => {
    return computeFinancials(
      transactions
    );
  }, [transactions]);

  /* ==========================================================
     CREATE TRANSACTION
  ========================================================== */

  const handleCreateTransaction =
    useCallback(
      (type = "expense") => {
        setTransactionType(
          type === "income"
            ? "income"
            : "expense"
        );

        setTransactionModalOpen(
          true
        );
      },
      []
    );

  /* ==========================================================
     OPEN TRANSACTION MODAL
  ========================================================== */

  const handleOpenTransactionModal =
    useCallback(() => {
      setTransactionType(
        "expense"
      );

      setTransactionModalOpen(
        true
      );
    }, []);

  /* ==========================================================
     CLOSE TRANSACTION MODAL
  ========================================================== */

  const handleCloseTransactionModal =
    useCallback(() => {
      setTransactionModalOpen(
        false
      );
    }, []);

  /* ==========================================================
     REFRESH DASHBOARD
  ========================================================== */

  const handleRefresh =
    useCallback(async () => {
      return loadTransactions();
    }, [
      loadTransactions,
    ]);

  /* ==========================================================
     EXPORT CSV
  ========================================================== */

  const handleExport =
    useCallback(async () => {
      try {
        if (
          !transactions.length
        ) {
          return {
            success: false,
          };
        }

        await exportTransactionsCSV(
          transactions
        );

        return {
          success: true,
        };
      } catch (error) {
        console.error(
          "DASHBOARD_EXPORT_ERROR:",
          error
        );

        return {
          success: false,
          error,
        };
      }
    }, [
      transactions,
    ]);

  /* ==========================================================
     ANALYTICS
  ========================================================== */

  const handleAnalytics =
    useCallback(() => {
      navigate("/analytics");
    }, [navigate]);

  /* ==========================================================
     TRANSACTION SUCCESS
  ========================================================== */

  const handleTransactionSuccess =
    useCallback(
      (transaction) => {
        if (!transaction) {
          setTransactionModalOpen(
            false
          );

          return;
        }

        const transactionId =
          getTransactionId(
            transaction
          );

        setTransactions(
          (previous) => {
            /*
             * Prevent duplicate transactions.
             *
             * The transaction modal success event
             * and WebSocket event can both arrive
             * for the same transaction.
             */

            if (!transactionId) {
              return [
                transaction,
                ...previous,
              ];
            }

            const exists =
              previous.some(
                (item) =>
                  getTransactionId(
                    item
                  ) === transactionId
              );

            if (exists) {
              return previous.map(
                (item) =>
                  getTransactionId(
                    item
                  ) === transactionId
                    ? transaction
                    : item
              );
            }

            return [
              transaction,
              ...previous,
            ];
          }
        );

        setLastSync(
          new Date()
        );

        setTransactionModalOpen(
          false
        );
      },
      []
    );

  /* ==========================================================
     WEBSOCKET REAL-TIME TRANSACTION SYNC
     
     IMPORTANT:
     Notifications are NOT handled here.
     
     NotificationContext is now the single source
     of truth for application notifications.
  ========================================================== */

  useSocket(
    userId,
    useCallback(
      (event) => {
        if (
          !event ||
          typeof event !== "object" ||
          !event.type
        ) {
          return;
        }

        switch (event.type) {
          /* ==================================================
             CREATED
          ================================================== */

          case "transaction:created": {
            const transaction =
              event.data;

            if (!transaction) {
              return;
            }

            const transactionId =
              getTransactionId(
                transaction
              );

            setTransactions(
              (previous) => {
                if (!transactionId) {
                  return [
                    transaction,
                    ...previous,
                  ];
                }

                const exists =
                  previous.some(
                    (item) =>
                      getTransactionId(
                        item
                      ) === transactionId
                  );

                if (exists) {
                  return previous;
                }

                return [
                  transaction,
                  ...previous,
                ];
              }
            );

            setLastSync(
              new Date()
            );

            break;
          }

          /* ==================================================
             UPDATED
          ================================================== */

          case "transaction:updated": {
            const transaction =
              event.data;

            if (!transaction) {
              return;
            }

            const transactionId =
              getTransactionId(
                transaction
              );

            if (!transactionId) {
              return;
            }

            setTransactions(
              (previous) =>
                previous.map(
                  (item) =>
                    getTransactionId(
                      item
                    ) === transactionId
                      ? transaction
                      : item
                )
            );

            setLastSync(
              new Date()
            );

            break;
          }

          /* ==================================================
             DELETED
          ================================================== */

          case "transaction:deleted": {
            const deletedId =
              typeof event.data ===
              "object"
                ? getTransactionId(
                    event.data
                  )
                : event.data;

            if (!deletedId) {
              return;
            }

            setTransactions(
              (previous) =>
                previous.filter(
                  (item) =>
                    getTransactionId(
                      item
                    ) !== deletedId
                )
            );

            setLastSync(
              new Date()
            );

            break;
          }

          /*
           * notification:new intentionally removed.
           *
           * NotificationContext owns notification
           * synchronization and the NotificationPage /
           * NotificationDropdown consume that state.
           */

          default:
            break;
        }
      },
      []
    )
  );

  /* ==========================================================
     LOADING STATE
  ========================================================== */

  if (
    loading ||
    preferencesLoading
  ) {
    return (
      <div
        className="
          min-h-screen
          p-4 sm:p-6 lg:p-8
          bg-slate-50
        "
      >
        <div
          className="
            max-w-7xl
            space-y-6 mx-auto
            animate-pulse
          "
        >
          {/* HEADER */}

          <div
            className="
              h-24
              bg-white
              border border-slate-200 rounded-3xl
            "
            /
          >

          {/* KPI */}

          <div
            className="
              grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4
              gap-4
            "
          >
            {[
              1,
              2,
              3,
              4,
            ].map((item) => (
              <div
                key={item}
                className="
                  h-32
                  bg-white
                  border border-slate-200 rounded-3xl
                "
                /
              >
            ))}
          </div>

          {/* MAIN CONTENT */}

          <div
            className="
              h-96
              bg-white
              border border-slate-200 rounded-3xl
            "
            /
          >
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
      "
    >
      <div
        className="
          max-w-7xl
          space-y-6 mx-auto p-4 md:p-6 lg:p-8
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <DashboardHeader
          user={user}
          preferences={preferences}
          status={{
            isOnline,
            lastSync,
          }}
          loading={
            loading ||
            preferencesLoading
          }
          syncing={refreshing}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* ==================================================
            PREFERENCE ERROR
        ================================================== */}

        {preferencesError && (
          <div
            className="
              px-4 py-3
              text-amber-800 text-sm
              bg-amber-50
              border border-amber-200 rounded-2xl
            "
            role="status"
          >
            Some preferences could not
            be synchronized. Your saved
            settings are being used.
          </div>
        )}

        {/* ==================================================
            KPI STATS
        ================================================== */}

        <DashboardStats
          transactions={
            transactions
          }
          currency={currency}
        />

        {/* ==================================================
            BALANCE + QUICK ACTIONS
        ================================================== */}

        <div
          className="
            grid grid-cols-1
            gap-6
          "
        >
          <RealTimeBalanceEngine
            transactions={
              transactions
            }
            currency={currency}
          />

          <QuickActionsBar
            onCreateTransaction={
              handleCreateTransaction
            }
            onRefresh={
              handleRefresh
            }
            onOpenExport={
              handleExport
            }
            onOpenAnalytics={
              handleAnalytics
            }
            onOpenTransactionModal={
              handleOpenTransactionModal
            }
            refreshing={
              refreshing
            }
          />
        </div>

        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <AnalyticsSwitcherEngine
          transactions={
            transactions
          }
          currency={currency}
        />

        {/* ==================================================
            AI INSIGHTS
        ================================================== */}

        <InsightsPanel
          transactions={
            transactions
          }
          financials={
            financials
          }
        />

        {/* ==================================================
            AUDIT TRAIL
        ================================================== */}

        <TransactionAuditTrail
          transactions={
            transactions
          }
        />

        {/* ==================================================
            TRANSACTION MODAL
        ================================================== */}

        <TransactionModal
          open={
            transactionModalOpen
          }
          type={
            transactionType
          }
          onClose={
            handleCloseTransactionModal
          }
          onSuccess={
            handleTransactionSuccess
          }
        />
      </div>
    </div>
  );
};

export default Dashboard;
