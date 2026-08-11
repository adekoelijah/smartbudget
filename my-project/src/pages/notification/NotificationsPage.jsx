import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCheck,
  CheckCircle2,
  Info,
  RefreshCcw,
  Search,
  ShieldAlert,
  Target,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useNotifications } from "../../context/NotificationContext";

/* =========================================================
   TYPE CONFIGURATION
========================================================= */

const TYPE_CONFIG = {
  transaction: {
    label: "Transactions",
    icon: WalletCards,
    iconClass: "text-blue-600",
    iconBackground: "bg-blue-50",
  },

  income: {
    label: "Income",
    icon: ArrowUpRight,
    iconClass: "text-emerald-600",
    iconBackground: "bg-emerald-50",
  },

  expense: {
    label: "Expenses",
    icon: ArrowDownRight,
    iconClass: "text-rose-600",
    iconBackground: "bg-rose-50",
  },

  security: {
    label: "Security",
    icon: ShieldAlert,
    iconClass: "text-red-600",
    iconBackground: "bg-red-50",
  },

  budget: {
    label: "Budgets",
    icon: AlertTriangle,
    iconClass: "text-amber-600",
    iconBackground: "bg-amber-50",
  },

  goal: {
    label: "Goals",
    icon: Target,
    iconClass: "text-violet-600",
    iconBackground: "bg-violet-50",
  },

  system: {
    label: "System",
    icon: Info,
    iconClass: "text-slate-600",
    iconBackground: "bg-slate-100",
  },

  success: {
    label: "Success",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBackground: "bg-emerald-50",
  },

  default: {
    label: "General",
    icon: Bell,
    iconClass: "text-slate-600",
    iconBackground: "bg-slate-100",
  },
};

/* =========================================================
   SAFE HELPERS
========================================================= */

const getNotificationType = (type = "") => {
  const normalized = String(type).toLowerCase();

  if (normalized.startsWith("transaction")) {
    return "transaction";
  }

  if (normalized.startsWith("income")) {
    return "income";
  }

  if (normalized.startsWith("expense")) {
    return "expense";
  }

  if (normalized.startsWith("security")) {
    return "security";
  }

  if (normalized.startsWith("budget")) {
    return "budget";
  }

  if (normalized.startsWith("goal")) {
    return "goal";
  }

  if (normalized.startsWith("system")) {
    return "system";
  }

  if (normalized.startsWith("success")) {
    return "success";
  }

  return "default";
};

const getTypeConfig = (type) => {
  return TYPE_CONFIG[getNotificationType(type)] ||
    TYPE_CONFIG.default;
};

const formatDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelativeDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff =
    Date.now() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)}m ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }

  if (diff < 7 * day) {
    return `${Math.floor(diff / day)}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* =========================================================
   COMPONENT
========================================================= */

const NotificationsPage = () => {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,

    refreshNotifications,

    readNotification,
    readAllNotifications,

    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [deletingId, setDeletingId] =
    useState(null);

  const [clearing, setClearing] =
    useState(false);

  /* =======================================================
     FILTERED NOTIFICATIONS
  ======================================================= */

  const filteredNotifications =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return notifications.filter(
        (notification) => {
          /* STATUS */

          if (
            statusFilter === "unread" &&
            notification.isRead
          ) {
            return false;
          }

          if (
            statusFilter === "read" &&
            !notification.isRead
          ) {
            return false;
          }

          /* TYPE */

          if (
            typeFilter !== "all" &&
            getNotificationType(
              notification.type
            ) !== typeFilter
          ) {
            return false;
          }

          /* SEARCH */

          if (!query) {
            return true;
          }

          const searchableText = [
            notification.title,
            notification.message,
            notification.type,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );
    }, [
      notifications,
      search,
      statusFilter,
      typeFilter,
    ]);

  /* =======================================================
     OPEN NOTIFICATION
  ======================================================= */

  const handleOpenNotification =
    useCallback(
      async (notification) => {
        if (!notification?._id) {
          return;
        }

        try {
          if (!notification.isRead) {
            await readNotification(
              notification._id
            );
          }

          if (notification.actionUrl) {
            navigate(
              notification.actionUrl
            );
          }
        } catch (err) {
          console.error(
            "OPEN_NOTIFICATION_ERROR:",
            err
          );
        }
      },
      [
        navigate,
        readNotification,
      ]
    );

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete =
    useCallback(
      async (id) => {
        if (!id) {
          return;
        }

        try {
          setDeletingId(id);

          await removeNotification(id);
        } catch (err) {
          console.error(
            "DELETE_NOTIFICATION_ERROR:",
            err
          );
        } finally {
          setDeletingId(null);
        }
      },
      [removeNotification]
    );

  /* =======================================================
     CLEAR ALL
  ======================================================= */

  const handleClearAll =
    useCallback(async () => {
      if (!notifications.length) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete all notifications?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setClearing(true);

        await clearAllNotifications();
      } catch (err) {
        console.error(
          "CLEAR_NOTIFICATIONS_ERROR:",
          err
        );
      } finally {
        setClearing(false);
      }
    }, [
      clearAllNotifications,
      notifications.length,
    ]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
      try {
        await refreshNotifications();
      } catch (err) {
        console.error(
          "NOTIFICATIONS_REFRESH_ERROR:",
          err
        );
      }
    }, [refreshNotifications]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const clearFilters =
    useCallback(() => {
      setSearch("");
      setStatusFilter("all");
      setTypeFilter("all");
    }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && !notifications.length) {
    return (
      <div
        className="
          space-y-6
        "
      >
        <PageHeader />

        <div
          className="
            flex justify-center items-center
            min-h-[420px]
            bg-white
            border border-slate-200 rounded-3xl
            shadow-sm
          "
        >
          <div
            className="
              text-center
            "
          >
            <div
              className="
                flex justify-center items-center
                w-12 h-12
                mx-auto
                bg-slate-100
                rounded-2xl
              "
            >
              <RefreshCcw
                size={20}
                className="
                  text-slate-500
                  animate-spin
                "
                /
              >
            </div>

            <p
              className="
                mt-4
                font-medium text-slate-900 text-sm
              "
            >
              Loading notifications
            </p>

            <p
              className="
                mt-1
                text-slate-500 text-xs
              "
            >
              Synchronizing your notification center...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        space-y-6
      "
    >

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        unreadCount={unreadCount}
        totalCount={notifications.length}
        refreshing={refreshing}
        clearing={clearing}
        onRefresh={handleRefresh}
        onClearAll={handleClearAll}
      />

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div
          className="
            flex items-start
            p-4
            bg-rose-50
            border border-rose-200 rounded-2xl
            gap-3
          "
        >
          <AlertTriangle
            size={18}
            className="
              mt-0.5
              text-rose-600
              shrink-0
            "
            /
          >

          <div>
            <p
              className="
                font-medium text-rose-800 text-sm
              "
            >
              Unable to synchronize notifications
            </p>

            <p
              className="
                mt-1
                text-rose-600 text-xs
              "
            >
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div
        className="
          grid grid-cols-1 sm:grid-cols-3
          gap-4
        "
      >
        <SummaryCard
          label="Total notifications"
          value={notifications.length}
          icon={Bell}
        />

        <SummaryCard
          label="Unread"
          value={unreadCount}
          icon={Info}
        />

        <SummaryCard
          label="Read"
          value={
            Math.max(
              notifications.length -
                unreadCount,
              0
            )
          }
          icon={CheckCircle2}
        />
      </div>

      {/* =================================================
          NOTIFICATION INBOX
      ================================================= */}

      <section
        className="
          overflow-hidden
          bg-white
          border border-slate-200 rounded-3xl
          shadow-sm
        "
      >

        {/* ===============================================
            TOOLBAR
        =============================================== */}

        <div
          className="
            p-4 sm:p-5
            border-slate-200 border-b
          "
        >

          <div
            className="
              flex flex-col lg:flex-row lg:justify-between lg:items-center
              gap-4
            "
          >

            {/* SEARCH */}

            <div
              className="
                relative
                w-full lg:max-w-md
              "
            >
              <Search
                size={17}
                className="
                  top-1/2 left-3 absolute
                  text-slate-400
                  -translate-y-1/2
                "
                /
              >

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search notifications..."
                className="bg-slate-50 focus:bg-white py-3 pr-10 pl-10 border border-slate-200 focus:border-slate-400 rounded-2xl outline-none focus:ring-2 focus:ring-slate-100 w-full text-slate-900 placeholder:text-slate-400 text-sm transition"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                  className="top-1/2 right-3 absolute text-slate-400 hover:text-slate-700 -translate-y-1/2"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* FILTERS */}

            <div
              className="
                flex flex-wrap items-center
                gap-2
              "
            >

              <FilterButton
                active={
                  statusFilter === "all"
                }
                onClick={() =>
                  setStatusFilter("all")
                }
              >
                All
              </FilterButton>

              <FilterButton
                active={
                  statusFilter === "unread"
                }
                onClick={() =>
                  setStatusFilter(
                    "unread"
                  )
                }
              >
                Unread
              </FilterButton>

              <FilterButton
                active={
                  statusFilter === "read"
                }
                onClick={() =>
                  setStatusFilter("read")
                }
              >
                Read
              </FilterButton>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value
                  )
                }
                className="bg-white px-3 py-2 border border-slate-200 focus:border-slate-400 rounded-xl outline-none font-medium text-slate-600 text-xs"
              >
                <option value="all">
                  All types
                </option>

                <option value="transaction">
                  Transactions
                </option>

                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expenses
                </option>

                <option value="budget">
                  Budgets
                </option>

                <option value="goal">
                  Goals
                </option>

                <option value="security">
                  Security
                </option>

                <option value="system">
                  System
                </option>
              </select>

            </div>
          </div>
        </div>

        {/* ===============================================
            BULK ACTION BAR
        =============================================== */}

        {notifications.length > 0 && (
          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-center
              px-4 sm:px-5 py-3
              bg-slate-50/60
              border-slate-100 border-b
              gap-3
            "
          >
            <p
              className="
                text-slate-500 text-xs
              "
            >
              Showing{" "}
              <span
                className="
                  font-semibold text-slate-700
                "
              >
                {filteredNotifications.length}
              </span>{" "}
              of{" "}
              <span
                className="
                  font-semibold text-slate-700
                "
              >
                {notifications.length}
              </span>{" "}
              notifications
            </p>

            <button
              type="button"
              onClick={readAllNotifications}
              disabled={unreadCount === 0}
              className="
                inline-flex items-center self-start sm:self-auto
                px-3 py-2
                font-medium text-blue-600 text-xs
                hover:bg-blue-50
                rounded-xl
                disabled:opacity-40 transition
                disabled:cursor-not-allowed
                gap-2
              "
            >
              <CheckCheck size={15} />
              Mark all as read
            </button>
          </div>
        )}

        {/* ===============================================
            CONTENT
        =============================================== */}

        {filteredNotifications.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              statusFilter !== "all" ||
              typeFilter !== "all"
            }
            onClearFilters={
              clearFilters
            }
          />
        ) : (
          <div>
            {filteredNotifications.map(
              (notification) => {
                const config =
                  getTypeConfig(
                    notification.type
                  );

                const Icon =
                  config.icon;

                const isDeleting =
                  deletingId ===
                  notification._id;

                return (
                  <article
                    key={
                      notification._id
                    }
                    className={`
                      group
                      border-b
                      border-slate-100
                      p-4
                      transition
                      last:border-b-0
                      sm:p-5
                      ${
                        !notification.isRead
                          ? "bg-blue-50/30"
                          : "bg-white"
                      }
                      hover:bg-slate-50
                    `}
                  >
                    <div
                      className="
                        flex items-start
                        gap-4
                      "
                    >

                      {/* ICON */}

                      <div
                        className={`
                          flex
                          h-11 w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          ${config.iconBackground}
                        `}
                      >
                        <Icon
                          size={19}
                          className={
                            config.iconClass
                          }
                        />
                      </div>

                      {/* CONTENT */}

                      <div
                        className="
                          flex-1
                          min-w-0
                        "
                      >

                        <div
                          className="
                            flex justify-between items-start
                            gap-3
                          "
                        >
                          <div
                            className="
                              min-w-0
                            "
                          >

                            <div
                              className="
                                flex items-center
                                gap-2
                              "
                            >
                              <h3
                                className={`
                                  truncate
                                  text-sm
                                  ${
                                    notification.isRead
                                      ? "font-medium text-slate-800"
                                      : "font-semibold text-slate-950"
                                  }
                                `}
                              >
                                {notification.title ||
                                  "Notification"}
                              </h3>

                              {!notification.isRead && (
                                <span
                                  className="
                                    w-2 h-2
                                    bg-blue-600
                                    rounded-full
                                    shrink-0
                                  "
                                  aria-label="Unread"
                                /
                                >
                              )}
                            </div>

                            <p
                              className="
                                mt-1
                                text-slate-500 text-xs leading-5
                              "
                            >
                              {notification.message}
                            </p>

                          </div>

                          <span
                            className="
                              hidden sm:block
                              text-[11px] text-slate-400
                              shrink-0
                            "
                            title={formatDate(
                              notification.createdAt
                            )}
                          >
                            {formatRelativeDate(
                              notification.createdAt
                            )}
                          </span>
                        </div>

                        {/* MOBILE DATE */}

                        <p
                          className="
                            sm:hidden
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
                            flex flex-wrap items-center
                            mt-3
                            gap-3
                          "
                        >

                          {notification.actionUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenNotification(
                                  notification
                                )
                              }
                              className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 text-xs hover:underline"
                            >
                              View
                              <ArrowRight
                                size={13}
                              />
                            </button>
                          )}

                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                readNotification(
                                  notification._id
                                )
                              }
                              className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 text-xs hover:underline"
                            >
                              <CheckCheck
                                size={13}
                              />
                              Mark read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                notification._id
                              )
                            }
                            disabled={
                              isDeleting
                            }
                            className="inline-flex items-center gap-1 disabled:opacity-50 font-medium text-rose-500 hover:text-rose-600 text-xs hover:underline disabled:cursor-not-allowed"
                          >
                            <Trash2
                              size={13}
                              className={
                                isDeleting
                                  ? "animate-pulse"
                                  : ""
                              }
                            />

                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
};

/* =========================================================
   PAGE HEADER
========================================================= */

const PageHeader = ({
  unreadCount = 0,
  totalCount = 0,
  refreshing = false,
  clearing = false,
  onRefresh,
  onClearAll,
}) => {
  return (
    <div
      className="
        flex flex-col lg:flex-row lg:justify-between lg:items-center
        gap-4
      "
    >
      <div>
        <div
          className="
            flex items-center
            gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-11 h-11
              text-white
              bg-slate-900
              rounded-2xl
              shadow-sm
            "
          >
            <Bell size={19} />
          </div>

          <div>
            <h1
              className="
                font-semibold text-slate-900 text-xl tracking-tight
              "
            >
              Notifications
            </h1>

            <p
              className="
                mt-1
                text-slate-500 text-xs
              "
            >
              Monitor important financial,
              security and account activity.
            </p>
          </div>
        </div>
      </div>

      <div
        className="
          flex flex-wrap items-center
          gap-2
        "
      >
        <div
          className="
            px-3 py-2
            text-slate-500 text-xs
            bg-white
            border border-slate-200 rounded-xl
          "
        >
          <span
            className="
              font-semibold text-slate-900
            "
          >
            {totalCount}
          </span>{" "}
          total
        </div>

        <div
          className="
            px-3 py-2
            text-blue-600 text-xs
            bg-blue-50
            border border-blue-100 rounded-xl
          "
        >
          <span
            className="
              font-semibold
            "
          >
            {unreadCount}
          </span>{" "}
          unread
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="
            inline-flex items-center
            px-3 py-2
            font-medium text-slate-700 text-xs
            bg-white hover:bg-slate-50
            border border-slate-200 rounded-xl
            disabled:opacity-50 transition
            disabled:cursor-not-allowed
            gap-2
          "
        >
          <RefreshCcw
            size={14}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />
          Refresh
        </button>

        {totalCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            disabled={clearing}
            className="
              inline-flex items-center
              px-3 py-2
              font-medium text-rose-600 text-xs
              bg-white hover:bg-rose-50
              border border-rose-200 rounded-xl
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              gap-2
            "
          >
            <Trash2 size={14} />

            {clearing
              ? "Clearing..."
              : "Clear all"}
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div
      className="
        flex justify-between items-center
        p-4
        bg-white
        border border-slate-200 rounded-2xl
        shadow-sm
      "
    >
      <div>
        <p
          className="
            text-slate-500 text-xs
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            font-semibold text-slate-900 text-xl
          "
        >
          {value}
        </p>
      </div>

      <div
        className="
          flex justify-center items-center
          w-10 h-10
          text-slate-600
          bg-slate-100
          rounded-xl
        "
      >
        <Icon size={18} />
      </div>
    </div>
  );
};

/* =========================================================
   FILTER BUTTON
========================================================= */

const FilterButton = ({
  active,
  onClick,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl
        px-3 py-2
        text-xs
        font-medium
        transition
        ${
          active
            ? "bg-slate-900 text-white"
            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
        }
      `}
    >
      {children}
    </button>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  hasFilters,
  onClearFilters,
}) => {
  return (
    <div
      className="
        flex flex-col justify-center items-center
        min-h-[360px]
        px-6
        text-center
      "
    >
      <div
        className="
          flex justify-center items-center
          w-14 h-14
          text-slate-500
          bg-slate-100
          rounded-2xl
        "
      >
        {hasFilters ? (
          <Search size={22} />
        ) : (
          <Bell size={22} />
        )}
      </div>

      <h3
        className="
          mt-4
          font-semibold text-slate-900 text-sm
        "
      >
        {hasFilters
          ? "No matching notifications"
          : "You're all caught up"}
      </h3>

      <p
        className="
          max-w-sm
          mt-1
          text-slate-500 text-xs leading-5
        "
      >
        {hasFilters
          ? "Try changing your search or filters to find other notifications."
          : "Important financial, security and account activity will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="
            mt-4 px-4 py-2
            font-medium text-white text-xs
            bg-slate-900 hover:bg-slate-800
            rounded-xl
            transition
          "
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default NotificationsPage;