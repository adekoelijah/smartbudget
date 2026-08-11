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
        /*
         * Mark as read first.
         *
         * The context updates the local notification state
         * and unread count after the API succeeds.
         */
        if (!notification?.isRead && id) {
          await readNotification(id);
        }

        /*
         * Navigate only when the notification has
         * an action URL.
         */
        if (notification?.actionUrl) {
          navigate(notification.actionUrl);
          onClose?.();
          return;
        }

        /*
         * If there is no destination, simply close
         * the dropdown after reading it.
         */
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
        right-0 z-50 absolute overflow-hidden
        w-[380px] max-w-[calc(100vw-2rem)]
        mt-3
        bg-white
        border border-slate-200 rounded-3xl
        shadow-2xl
      "
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        className="
          flex justify-between items-center
          px-5 py-4
          border-slate-200 border-b
        "
      >
        <div
          className="
            flex items-center
            gap-3
          "
        >

          <div
            className="
              flex justify-center items-center
              w-10 h-10
              text-slate-700
              bg-slate-100
              rounded-2xl
            "
          >
            <Bell size={18} />
          </div>

          <div>
            <h3
              className="
                font-semibold text-slate-900 text-sm
              "
            >
              Notifications
            </h3>

            <p
              className="
                mt-1
                text-slate-500 text-xs
              "
            >
              Stay updated with your SmartBudget activity
            </p>
          </div>

        </div>

        <div
          className="
            flex items-center
            gap-1
          "
        >

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh notifications"
            className="
              p-2
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
            className="
              p-2
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
            px-5 py-2.5
            bg-slate-50
            border-slate-100 border-b
          "
        >
          <p
            className="
              font-medium text-slate-600 text-xs
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
              inline-flex items-center
              px-2 py-1.5
              font-medium text-blue-600 text-xs
              hover:bg-blue-50
              rounded-xl
              transition
              gap-1
            "
          >
            <CheckCheck size={14} />
            Mark all
          </button>
        </div>
      )}

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          overflow-y-auto
          max-h-[430px]
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
                px-8 py-12
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
          latestNotifications.map(
            (notification) => {
              const id =
                getNotificationId(
                  notification
                );

              const Icon =
                getNotificationIcon(
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
                    px-4
                    py-4
                    transition
                    hover:bg-slate-50

                    ${
                      isUnread
                        ? "bg-blue-50/40"
                        : "bg-white"
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      gap-3
                    "
                  >

                    {/* ICON */}

                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        ${
                          isUnread
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }
                      `}
                    >
                      <Icon size={18} />
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
                          flex justify-between items-start
                          gap-2
                        "
                      >
                        <h4
                          className="
                            font-semibold text-slate-900 text-sm truncate
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
                            /
                          >
                        )}
                      </div>

                      {/* MESSAGE */}

                      <p
                        className="
                          mt-1
                          text-slate-500 text-xs leading-relaxed
                        "
                      >
                        {notification.message ||
                          "You have a new notification."}
                      </p>

                      {/* DATE */}

                      <p
                        className="
                          mt-2
                          text-[11px] text-slate-400
                        "
                      >
                        {formatDate(
                          notification.createdAt
                        )}
                      </p>

                      {/* ACTIONS */}

                      <div
                        className="
                          flex items-center
                          mt-3
                          gap-3
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
                          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 text-xs hover:underline transition"
                        >
                          {notification.actionUrl
                            ? "View"
                            : "Mark as read"}

                          <ArrowRight
                            size={13}
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              notification
                            )
                          }
                          className="inline-flex items-center gap-1 font-medium text-rose-500 hover:text-rose-600 text-xs hover:underline transition"
                        >
                          <Trash2
                            size={13}
                          />
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                </div>
              );
            }
          )}

      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <div
        className="
          p-4
          text-center
          bg-white
          border-slate-200 border-t
        "
      >
        <button
          type="button"
          onClick={() => {
            navigate("/app/notifications");
            onClose?.();
          }}
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 text-sm hover:underline transition"
        >
          View all notifications

          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};

export default NotificationDropdown;