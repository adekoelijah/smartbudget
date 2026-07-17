


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
} from "react";

import { motion } from "framer-motion";

/* =========================================
   SAFE HELPERS
========================================= */
const safeText = (
  value,
  fallback = "—"
) => {
  if (
    typeof value !== "string"
  )
    return fallback;

  const cleaned =
    value.trim();

  return cleaned.length
    ? cleaned
    : fallback;
};

const formatLastSync = (
  value
) => {
  if (!value) return "—";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }
  );
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

  notificationsCount = 0,

  loading = false,
  syncing = false,

  onRefresh,
  onExport,
}) => {
  /* =========================================
     USER ENGINE
  ========================================= */
  const safeUser =
    useMemo(() => {
      /**
       * PRIMARY SOURCE
       * ACTIVE AUTH USER
       */
      if (user?.name) {
        return {
          name:
            safeText(
              user.name,
              "User"
            ),
        };
      }

      /**
       * FALLBACK
       * LOCAL STORAGE
       */
      try {
        const local =
          JSON.parse(
            localStorage.getItem(
              "user"
            )
          );

        return {
          name:
            safeText(
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
  const connectionState =
    useMemo(() => {
      if (syncing)
        return "syncing";

      if (
        status?.isOnline
      )
        return "online";

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
      text:
        "Realtime Sync Active",

      icon: Wifi,

      badge:
        "bg-emerald-500",
    },

    syncing: {
      text:
        "Syncing Transactions",

      icon:
        RefreshCcw,

      badge:
        "bg-amber-500",
    },

    offline: {
      text:
        "Offline Mode",

      icon: WifiOff,

      badge:
        "bg-rose-500",
    },
  };

  const currentStatus =
    statusConfig[
      connectionState
    ];

  const StatusIcon =
    currentStatus.icon;

  /* =========================================
     ACTIONS
  ========================================= */
  const handleRefresh =
    useCallback(
      async () => {
        if (
          typeof onRefresh !==
          "function"
        )
          return;

        try {
          await onRefresh();
        } catch (err) {
          console.error(
            "Dashboard refresh failed:",
            err
          );
        }
      },
      [onRefresh]
    );

  const handleExport =
    useCallback(
      async () => {
        if (
          typeof onExport !==
          "function"
        )
          return;

        try {
          await onExport();
        } catch (err) {
          console.error(
            "Export failed:",
            err
          );
        }
      },
      [onExport]
    );

  /* =========================================
     UI
  ========================================= */
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        relative overflow-hidden
        rounded-3xl
        border border-slate-200
        bg-white
        shadow-sm
      "
    >

      {/* BACKDROP */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-r
          from-slate-50
          via-white
          to-slate-50
          opacity-60
        "
      />

      {/* CONTENT */}
      <div
        className="
          relative z-10
          flex flex-col gap-5
          px-4 py-5
          sm:px-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        {/* =====================================
            LEFT
        ===================================== */}
        <div className="flex items-center gap-4">

          {/* AVATAR */}
          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-2xl
              bg-slate-900
              text-sm font-semibold
              text-white
              shadow-sm
            "
          >
            {safeUser.name
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* USER */}
          <div>

            <div className="flex items-center gap-2">

              <h1
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                  sm:text-base
                "
              >
                Welcome back,{" "}
                {
                  safeUser.name
                }
              </h1>

              <ShieldCheck
                size={16}
                className="text-emerald-500"
              />

            </div>

            <p className="mt-1 text-xs text-slate-500">
              SmartBudget Financial OS
            </p>

          </div>
        </div>

        {/* =====================================
            CENTER STATUS
        ===================================== */}
        <div
          className="
            flex flex-wrap
            items-center gap-2
            rounded-2xl
            border border-slate-200
            bg-slate-50
            px-4 py-2
            text-xs text-slate-600
          "
        >

          <span
            className={`
              h-2 w-2 rounded-full
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
            {
              currentStatus.text
            }
          </span>

          <span className="text-slate-300">
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
        <div className="flex items-center gap-2">

          {/* NOTIFICATIONS */}
          <button
            className="
              relative rounded-2xl
              border border-slate-200
              p-3
              transition
              hover:bg-slate-50
            "
          >

            <Bell size={18} />

            {notificationsCount >
              0 && (
              <span
                className="
                  absolute -right-1 -top-1
                  flex h-5 min-w-[20px]
                  items-center justify-center
                  rounded-full
                  bg-rose-500
                  px-1
                  text-[10px]
                  font-semibold
                  text-white
                "
              >
                {notificationsCount >
                99
                  ? "99+"
                  : notificationsCount}
              </span>
            )}

          </button>

          {/* REFRESH */}
          <button
            onClick={
              handleRefresh
            }
            disabled={
              loading ||
              syncing
            }
            className="
              rounded-2xl
              border border-slate-200
              p-3
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
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

          {/* EXPORT */}
          <button
            onClick={
              handleExport
            }
            className="
              rounded-2xl
              border border-slate-200
              p-3
              transition
              hover:bg-slate-50
            "
          >

            <Download
              size={18}
            />

          </button>

        </div>

      </div>
    </motion.div>
  );
};

export default DashboardHeader;