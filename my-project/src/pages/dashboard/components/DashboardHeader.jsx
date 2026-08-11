
import {
  Bell,
  RefreshCcw,
  Download,
  Wifi,
  WifiOff,
  ShieldCheck,
} from "lucide-react";

import {
  useMemo,
  useCallback,
  useState,
} from "react";

import { motion } from "framer-motion";

import { useNotifications } from "../../../context/NotificationContext";

import NotificationDropdown from "../../settings/components/sections/components/NotificationDropdown";

/* =========================================
   SAFE HELPERS
========================================= */

const safeText = (
  value,
  fallback = "—"
) => {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value.trim();

  return cleaned.length
    ? cleaned
    : fallback;
};

const formatLastSync = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};

/* =========================================
   COMPONENT
========================================= */

const DashboardHeader = ({
  user = null,

  status = {
    isOnline: false,
    lastSync: null,
  },

  loading = false,
  syncing = false,

  onRefresh,
  onExport,
}) => {
  /* =========================================
     NOTIFICATION STATE
  ========================================= */

  const {
    unreadCount = 0,
    refreshNotifications,
  } = useNotifications();

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  /* =========================================
     USER ENGINE
  ========================================= */

  const safeUser = useMemo(() => {
    /*
     * PRIMARY SOURCE
     * ACTIVE AUTH USER
     */

    if (user?.name) {
      return {
        name: safeText(
          user.name,
          "User"
        ),
      };
    }

    /*
     * FALLBACK
     * LOCAL STORAGE
     */

    try {
      const local = JSON.parse(
        localStorage.getItem("user")
      );

      return {
        name: safeText(
          local?.name,
          "User"
        ),
      };
    } catch {
      return {
        name: "User",
      };
    }
  }, [user]);

  /* =========================================
     REALTIME STATE
  ========================================= */

  const connectionState = useMemo(() => {
    if (syncing) {
      return "syncing";
    }

    if (status?.isOnline) {
      return "online";
    }

    return "offline";
  }, [
    syncing,
    status?.isOnline,
  ]);

  /* =========================================
     STATUS CONFIG
  ========================================= */

  const statusConfig = {
    online: {
      text: "Realtime Sync Active",
      icon: Wifi,
      badge: "bg-emerald-500",
    },

    syncing: {
      text: "Syncing Transactions",
      icon: RefreshCcw,
      badge: "bg-amber-500",
    },

    offline: {
      text: "Offline Mode",
      icon: WifiOff,
      badge: "bg-rose-500",
    },
  };

  const currentStatus =
    statusConfig[connectionState];

  const StatusIcon =
    currentStatus.icon;

  /* =========================================
     REFRESH DASHBOARD
  ========================================= */

  const handleRefresh = useCallback(
    async () => {
      if (
        typeof onRefresh !==
        "function"
      ) {
        return;
      }

      try {
        await onRefresh();
      } catch (err) {
        console.error(
          "DASHBOARD_REFRESH_ERROR:",
          err
        );
      }
    },
    [onRefresh]
  );

  /* =========================================
     EXPORT
  ========================================= */

  const handleExport = useCallback(
    async () => {
      if (
        typeof onExport !==
        "function"
      ) {
        return;
      }

      try {
        await onExport();
      } catch (err) {
        console.error(
          "EXPORT_ERROR:",
          err
        );
      }
    },
    [onExport]
  );

  /* =========================================
     NOTIFICATION TOGGLE
  ========================================= */

  const handleNotificationToggle =
    useCallback(async () => {
      const nextState =
        !notificationsOpen;

      setNotificationsOpen(
        nextState
      );

      /*
       * Refresh the complete notification
       * state whenever the dropdown opens.
       *
       * This keeps the dropdown and badge
       * synchronized with the backend.
       */

      if (nextState) {
        try {
          await refreshNotifications();
        } catch (error) {
          console.error(
            "NOTIFICATION_REFRESH_ON_OPEN_ERROR:",
            error
          );
        }
      }
    }, [
      notificationsOpen,
      refreshNotifications,
    ]);

  const closeNotifications =
    useCallback(() => {
      setNotificationsOpen(false);
    }, []);

  /* =========================================
     UI
  ========================================= */

  return (
    <motion
      .div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        relative overflow-visible
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >
      {/* =====================================
          BACKDROP
      ===================================== */}

      <div
        className="
          absolute inset-0
          bg-gradient-to-r from-slate-50 via-white to-slate-50
          rounded-3xl
          opacity-60
          pointer-events-none
        "
        /
      >

      {/* =====================================
          CONTENT
      ===================================== */}

      <div
        className="
          z-10 relative flex flex-col lg:flex-row lg:justify-between
          lg:items-center
          px-4 sm:px-6 py-5
          gap-5
        "
      >
        {/* =====================================
            LEFT
        ===================================== */}

        <div
          className="
            flex items-center
            gap-4
          "
        >
          {/* AVATAR */}

          <div
            className="
              flex justify-center items-center
              w-12 h-12
              font-semibold text-white text-sm
              bg-slate-900
              rounded-2xl
              shadow-sm
              shrink-0
            "
          >
            {safeUser.name
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* USER */}

          <div>
            <div
              className="
                flex items-center
                gap-2
              "
            >
              <h1
                className="
                  font-semibold text-slate-900 text-sm sm:text-base
                "
              >
                Welcome back,{" "}
                {safeUser.name}
              </h1>

              <ShieldCheck
                size={16}
                className="
                  text-emerald-500
                "
                /
              >
            </div>

            <p
              className="
                mt-1
                text-slate-500 text-xs
              "
            >
              SmartBudget Financial OS
            </p>
          </div>
        </div>

        {/* =====================================
            CENTER STATUS
        ===================================== */}

        <div
          className="
            flex flex-wrap items-center
            px-4 py-2
            text-slate-600 text-xs
            bg-slate-50
            border border-slate-200 rounded-2xl
            gap-2
          "
        >
          <span
            className={`
              h-2
              w-2
              rounded-full
              ${currentStatus.badge}
            `}
          />

          <StatusIcon
            size={14}
            className={
              syncing
                ? "animate-spin"
                : ""
            }
          />

          <span>
            {currentStatus.text}
          </span>

          <span
            className="
              text-slate-300
            "
          >
            •
          </span>

          <span>
            Last sync:{" "}
            {formatLastSync(
              status?.lastSync
            )}
          </span>
        </div>

        {/* =====================================
            ACTIONS
        ===================================== */}

        <div
          className="
            flex items-center
            gap-2
          "
        >
          {/* ===================================
              NOTIFICATIONS
          =================================== */}

          <div
            className="
              relative
            "
          >
            <button
              type="button"
              onClick={
                handleNotificationToggle
              }
              aria-label={
                notificationsOpen
                  ? "Close notifications"
                  : "Open notifications"
              }
              aria-expanded={
                notificationsOpen
              }
              className="
                relative
                p-3
                text-slate-700 hover:text-slate-900
                bg-white hover:bg-slate-50
                border border-slate-200 rounded-2xl focus:outline-none
                focus:ring-2 focus:ring-slate-300
                transition
              "
            >
              <Bell size={18} />

              {/* UNREAD BADGE */}

              {unreadCount > 0 && (
                <span
                  className="
                    absolute flex justify-center items-center
                    min-w-[20px] h-5
                    px-1
                    font-semibold text-[10px] text-white
                    bg-rose-500
                    rounded-full
                    shadow-sm
                    -top-1 -right-1
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* =================================
                NOTIFICATION DROPDOWN
            ================================= */}

            {notificationsOpen && (
              <NotificationDropdown
                onClose={
                  closeNotifications
                }
              />
            )}
          </div>

          {/* ===================================
              REFRESH
          =================================== */}

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={
              loading ||
              syncing
            }
            aria-label="Refresh dashboard"
            className="
              p-3
              text-slate-700 hover:text-slate-900
              bg-white hover:bg-slate-50
              border border-slate-200 rounded-2xl focus:outline-none
              focus:ring-2 focus:ring-slate-300
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
            "
          >
            <RefreshCcw
              size={18}
              className={
                loading ||
                syncing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          {/* ===================================
              EXPORT
          =================================== */}

          <button
            type="button"
            onClick={
              handleExport
            }
            aria-label="Export financial data"
            className="
              p-3
              text-slate-700 hover:text-slate-900
              bg-white hover:bg-slate-50
              border border-slate-200 rounded-2xl focus:outline-none
              focus:ring-2 focus:ring-slate-300
              transition
            "
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
