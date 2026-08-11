
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowRight,
  WalletCards,
  ShieldAlert,
  AlertTriangle,
  Target,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useNotifications } from "../../../../../context/NotificationContext";

import { useMemo, useCallback } from "react";

/* =========================================================
   TYPE CONFIGURATION
========================================================= */

const notificationIcons = {
  transaction: WalletCards,
  "transaction:created": WalletCards,

  income: ArrowUpRight,
  "income:received": ArrowUpRight,

  expense: ArrowDownRight,
  "expense:high": ArrowDownRight,

  security: ShieldAlert,
  "security:alert": ShieldAlert,

  budget: AlertTriangle,
  "budget:warning": AlertTriangle,

  goal: Target,

  system: Info,
};

/* =========================================================
   HELPERS
========================================================= */

const getNotificationIcon = (type) => {
  return notificationIcons[type] || Info;
};

const getNotificationId = (notification) => {
  return notification?._id || notification?.id;
};

const formatDate = (date) => {
  if (!date) {
    return "Just now";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Just now";
  }

  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    readNotification,
    readAllNotifications,
    removeNotification,
    refreshNotifications,
  } = useNotifications();

  /* =======================================================
     LATEST NOTIFICATIONS
  ======================================================= */

  const latestNotifications = useMemo(() => {
    return notifications.slice(0, 10);
  }, [notifications]);

  /* =======================================================
     OPEN NOTIFICATION
  ======================================================= */

  const handleOpen = useCallback(
    async (notification) => {
      const id = getNotificationId(notification);

      try {
        if (!notification?.isRead && id) {
          await readNotification(id);
        }

        if (notification?.actionUrl) {
          navigate(notification.actionUrl);
          onClose?.();
          return;
        }

        onClose?.();
      } catch (error) {
        console.error(
          "OPEN_NOTIFICATION_ERROR:",
          error
        );
      }
    },
    [
      navigate,
      onClose,
      readNotification,
    ]
  );

  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const handleMarkAll = useCallback(async () => {
    if (unreadCount <= 0) {
      return;
    }

    try {
      await readAllNotifications();
    } catch (error) {
      console.error(
        "MARK_ALL_NOTIFICATIONS_ERROR:",
        error
      );
    }
  }, [
    unreadCount,
    readAllNotifications,
  ]);

  /* =======================================================
     DELETE NOTIFICATION
  ======================================================= */

  const handleDelete = useCallback(
    async (notification) => {
      const id = getNotificationId(notification);

      if (!id) {
        return;
      }

      try {
        await removeNotification(id);
      } catch (error) {
        console.error(
          "DELETE_NOTIFICATION_ERROR:",
          error
        );
      }
    },
    [removeNotification]
  );

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error(
        "REFRESH_NOTIFICATION_ERROR:",
        error
      );
    }
  }, [refreshNotifications]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
   <div
     className="
       top-20 sm:top-full sm:right-0 left-1/2 sm:left-auto z-[100] fixed
       sm:absolute overflow-hidden
       w-[calc(100vw-2rem)] sm:w-[380px]
       max-w-[380px] max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-5rem)]
       sm:mt-2
       bg-white
       border border-slate-200 rounded-2xl sm:rounded-3xl
       shadow-2xl
       origin-top sm:origin-top-right sm:translate-x-0
       -translate-x-1/2
     "
   >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex justify-between items-center
          px-3 sm:px-5 py-3 sm:py-4
          border-slate-200 border-b
          gap-3
        "
      >
        <div
          className="
            flex items-center
            min-w-0
            gap-2.5 sm:gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-9 sm:w-10 h-9 sm:h-10
              text-slate-700
              bg-slate-100
              rounded-xl sm:rounded-2xl
              shrink-0
            "
          >
            <Bell
              size={17}
              className="
                sm:w-[18px] sm:h-[18px]
              "
              /
            >
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h3
              className="
                font-semibold text-slate-900 text-sm truncate
              "
            >
              Notifications
            </h3>

            <p
              className="
                mt-0.5 sm:mt-1
                text-[11px] text-slate-500 sm:text-xs truncate
              "
            >
              Stay updated with your SmartBudget activity
            </p>
          </div>
        </div>

        <div
          className="
            flex items-center
            gap-0.5 shrink-0
          "
        >
          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh notifications"
            aria-label="Refresh notifications"
            className="
              flex justify-center items-center
              w-9 h-9
              text-slate-500 hover:text-slate-700
              hover:bg-slate-100
              rounded-xl
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
            "
          >
            <span
              className={
                refreshing
                  ? "inline-flex animate-spin"
                  : "inline-flex"
              }
            >
              <ArrowRight
                size={15}
                className="
                  rotate-90
                "
                /
              >
            </span>
          </button>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            title="Close notifications"
            aria-label="Close notifications"
            className="
              flex justify-center items-center
              w-9 h-9
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              rounded-xl
              transition
            "
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ===================================================
          ACTION BAR
      =================================================== */}

      {unreadCount > 0 && (
        <div
          className="
            flex justify-between items-center
            px-3 sm:px-5 py-2.5
            bg-slate-50
            border-slate-100 border-b
            gap-3
          "
        >
          <p
            className="
              min-w-0
              font-medium text-[11px] text-slate-600 sm:text-xs truncate
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}{" "}
            unread notification
            {unreadCount === 1 ? "" : "s"}
          </p>

          <button
            type="button"
            onClick={handleMarkAll}
            className="
              inline-flex justify-center items-center
              min-h-[36px]
              px-2.5
              font-medium text-blue-600 text-xs
              hover:bg-blue-50
              rounded-xl
              transition
              gap-1 shrink-0
            "
          >
            <CheckCheck size={14} />
            <span>Mark all</span>
          </button>
        </div>
      )}

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          overflow-y-auto overscroll-contain
          max-h-[calc(100vh-12rem)] sm:max-h-[430px]
          /* * Smooth scrolling on supported mobile browsers. */
          [scrollbar-width:thin]
        "
      >
        {/* LOADING */}

        {loading && (
          <div
            className="
              flex flex-col justify-center items-center
              px-6 py-12
              text-center
            "
          >
            <div
              className="
                w-8 h-8
                mb-3
                border-2 border-slate-200 border-t-slate-700 rounded-full
                animate-spin
              "
              /
            >

            <p
              className="
                font-medium text-slate-700 text-sm
              "
            >
              Loading notifications...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          latestNotifications.length === 0 && (
            <div
              className="
                flex flex-col justify-center items-center
                px-6 sm:px-8 py-12
                text-center
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-14 h-14
                  text-slate-400
                  bg-slate-100
                  rounded-2xl
                "
              >
                <Bell size={24} />
              </div>

              <p
                className="
                  mt-4
                  font-semibold text-slate-900 text-sm
                "
              >
                No notifications
              </p>

              <p
                className="
                  max-w-[240px]
                  mt-1
                  text-slate-500 text-xs leading-relaxed
                "
              >
                You're all caught up. New financial
                alerts will appear here.
              </p>
            </div>
          )}

        {/* NOTIFICATION LIST */}

        {!loading &&
          latestNotifications.length > 0 &&
          latestNotifications.map((notification) => {
            const id = getNotificationId(notification);

            const Icon = getNotificationIcon(
              notification.type
            );

            const isUnread =
              !notification.isRead;

            return (
              <div
                key={id}
                className={`
                  group

                  border-b
                  border-slate-100

                  px-3 sm:px-4
                  py-4

                  transition

                  ${
                    isUnread
                      ? "bg-blue-50/40"
                      : "bg-white"
                  }

                  hover:bg-slate-50
                `}
              >
                <div
                  className="
                    flex items-start
                    min-w-0
                    gap-2.5 sm:gap-3
                  "
                >
                  {/* ICON */}

                  <div
                    className={`
                      flex
                      items-center
                      justify-center

                      w-9 h-9 sm:w-10 sm:h-10

                      shrink-0

                      rounded-xl

                      ${
                        isUnread
                          ? "bg-blue-100 text-blue-600"
                          : "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    <Icon
                      size={17}
                      className="
                        sm:w-[18px] sm:h-[18px]
                      "
                      /
                    >
                  </div>

                  {/* CONTENT */}

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >
                    {/* TITLE */}

                    <div
                      className="
                        flex items-start
                        min-w-0
                        gap-2
                      "
                    >
                      <h4
                        className="
                          flex-1
                          min-w-0
                          font-semibold text-slate-900 text-sm break-words
                          leading-snug
                        "
                      >
                        {notification.title ||
                          "Notification"}
                      </h4>

                      {isUnread && (
                        <span
                          className="
                            w-2 h-2
                            mt-1
                            bg-blue-600
                            rounded-full
                            shrink-0
                          "
                          aria-label="Unread"
                        /
                        >
                      )}
                    </div>

                    {/* MESSAGE */}

                    <p
                      className="
                        overflow-wrap-anywhere
                        mt-1
                        text-slate-500 text-xs break-words leading-relaxed
                      "
                    >
                      {notification.message ||
                        "You have a new notification."}
                    </p>

                    {/* DATE */}

                    <p
                      className="
                        mt-2
                        text-[10px] text-slate-400 sm:text-[11px]
                      "
                    >
                      {formatDate(
                        notification.createdAt
                      )}
                    </p>

                    {/* ACTIONS */}

                    <div
                      className="
                        flex flex-wrap items-center
                        mt-3
                        gap-2 sm:gap-3
                      "
                    >
                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() =>
                          handleOpen(
                            notification
                          )
                        }
                        className="inline-flex justify-center items-center gap-1 hover:bg-blue-50 px-2 rounded-lg min-h-[36px] font-medium text-blue-600 hover:text-blue-700 text-xs transition"
                      >
                        {notification.actionUrl
                          ? "View"
                          : "Mark as read"}

                        <ArrowRight size={13} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            notification
                          )
                        }
                        className="inline-flex justify-center items-center gap-1 hover:bg-rose-50 px-2 rounded-lg min-h-[36px] font-medium text-rose-500 hover:text-rose-600 text-xs transition"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        className="
          bottom
          pb-[calc(0.75rem+env(safe-area-inset-bottom))] p-3 sm:p-4
          text-center
          bg-white
          border-slate-200 border-t
          /* * * Safe-area support for iPhones with navigation/home indicators.
          */
        "
      >
        <button
          type="button"
          onClick={() => {
            navigate("/app/notifications");
            onClose?.();
          }}
          className="inline-flex justify-center items-center gap-1 hover:bg-blue-50 px-4 rounded-xl w-full sm:w-auto min-h-[40px] font-medium text-blue-600 hover:text-blue-700 text-sm transition"
        >
          View all notifications

          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
