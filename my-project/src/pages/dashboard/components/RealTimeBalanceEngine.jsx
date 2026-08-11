
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Activity,
  Wallet,
} from "lucide-react";

import { useMemo } from "react";

import {
  computeFinancials,
} from "../engine/FinancialEngine";

/* =========================================================
   FORMATTERS
========================================================= */

const formatCurrency = (
  value = 0,
  currency = "NGN"
) => {
  const amount = Number(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(
    Number.isFinite(amount)
      ? amount
      : 0
  );
};

const formatNumber = (
  value = 0
) => {
  const number = Number(value);

  return new Intl.NumberFormat(
    "en-NG"
  ).format(
    Number.isFinite(number)
      ? number
      : 0
  );
};

/* =========================================================
   SAFE NUMBER
========================================================= */

const safeNumber = (
  value
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

/* =========================================================
   DATE FORMATTER
========================================================= */

const formatTransactionDate = (
  value
) => {
  if (!value) {
    return "No recent activity";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recent activity";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
};

/* =========================================================
   TRANSACTION DATE RESOLVER
========================================================= */

const getTransactionDate = (
  transaction
) => {
  if (!transaction) {
    return null;
  }

  return (
    transaction.date ||
    transaction.transactionDate ||
    transaction.createdAt ||
    transaction.updatedAt ||
    null
  );
};

/* =========================================================
   BALANCE STATUS
========================================================= */

const getBalanceStatus = (
  balance,
  income,
  expense
) => {
  const safeBalance =
    safeNumber(balance);

  const safeIncome =
    safeNumber(income);

  const safeExpense =
    safeNumber(expense);

  if (
    safeIncome === 0 &&
    safeExpense === 0
  ) {
    return {
      label: "No activity yet",
      description:
        "Add your first transaction to start tracking your balance.",
      tone: "neutral",
      icon: Minus,
    };
  }

  if (safeBalance > 0) {
    return {
      label: "Positive balance",
      description:
        "Your recorded income currently exceeds your expenses.",
      tone: "positive",
      icon: ArrowUpRight,
    };
  }

  if (safeBalance < 0) {
    return {
      label: "Negative balance",
      description:
        "Your recorded expenses currently exceed your income.",
      tone: "negative",
      icon: ArrowDownRight,
    };
  }

  return {
    label: "Balanced",
    description:
      "Your recorded income and expenses are currently equal.",
    tone: "neutral",
    icon: Minus,
  };
};

/* =========================================================
   STATUS STYLES
========================================================= */

const STATUS_STYLES = {
  positive: {
    badge:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    icon:
      "bg-emerald-50 text-emerald-600",
    accent:
      "bg-emerald-500",
  },

  negative: {
    badge:
      "border-rose-100 bg-rose-50 text-rose-700",
    icon:
      "bg-rose-50 text-rose-600",
    accent:
      "bg-rose-500",
  },

  neutral: {
    badge:
      "border-slate-200 bg-slate-50 text-slate-600",
    icon:
      "bg-slate-100 text-slate-500",
    accent:
      "bg-slate-400",
  },
};

/* =========================================================
   FLOW ROW
========================================================= */

const FlowRow = ({
  label,
  value,
  icon: Icon,
  tone,
}) => {
  const styles =
    tone === "positive"
      ? {
          icon:
            "bg-emerald-50 text-emerald-600",
          value:
            "text-emerald-700",
        }
      : {
          icon:
            "bg-rose-50 text-rose-600",
          value:
            "text-rose-700",
        };

  return (
    <div
      className="
        flex justify-between items-center
        gap-4
      "
    >
      <div
        className="
          flex items-center
          min-w-0
          gap-3
        "
      >
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${styles.icon}
          `}
        >
          <Icon
            size={16}
            strokeWidth={2}
          />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              font-medium text-slate-700 text-xs
            "
          >
            {label}
          </p>

          <p
            className="
              mt-0.5
              text-[11px] text-slate-400
            "
          >
            Today
          </p>
        </div>
      </div>

      <p
        className={`
          shrink-0
          text-sm
          font-bold
          ${styles.value}
        `}
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   REAL-TIME BALANCE ENGINE
========================================================= */

const RealTimeBalanceEngine = ({
  transactions = [],
  currency = "NGN",
}) => {
  /* =======================================================
     NORMALIZE INPUT
  ======================================================= */

  const safeTransactions =
    Array.isArray(transactions)
      ? transactions
      : [];

  /* =======================================================
     FINANCIAL ENGINE
     
     This remains the single source
     of truth for financial calculations.
  ======================================================= */

  const financials = useMemo(() => {
    return computeFinancials(
      safeTransactions
    );
  }, [safeTransactions]);

  const {
    income = 0,
    expense = 0,
    balance = 0,

    todayIncome = 0,
    todayExpense = 0,

    transactionCount = 0,
  } = financials || {};

  /* =======================================================
     CURRENT CASH MOVEMENT
  ======================================================= */

  const todayCashFlow =
    safeNumber(todayIncome) -
    safeNumber(todayExpense);

  /* =======================================================
     BALANCE STATUS
  ======================================================= */

  const status =
    getBalanceStatus(
      balance,
      income,
      expense
    );

  const statusStyles =
    STATUS_STYLES[
      status.tone
    ] || STATUS_STYLES.neutral;

  const StatusIcon =
    status.icon;

  /* =======================================================
     LAST TRANSACTION
  ======================================================= */

  const latestTransaction =
    useMemo(() => {
      if (
        safeTransactions.length === 0
      ) {
        return null;
      }

      return safeTransactions.reduce(
        (latest, current) => {
          if (!latest) {
            return current;
          }

          const latestDate =
            new Date(
              getTransactionDate(
                latest
              )
            ).getTime();

          const currentDate =
            new Date(
              getTransactionDate(
                current
              )
            ).getTime();

          if (
            !Number.isFinite(
              latestDate
            )
          ) {
            return current;
          }

          if (
            !Number.isFinite(
              currentDate
            )
          ) {
            return latest;
          }

          return currentDate >
            latestDate
            ? current
            : latest;
        },
        null
      );
    }, [safeTransactions]);

  const latestTransactionDate =
    latestTransaction
      ? getTransactionDate(
          latestTransaction
        )
      : null;

  /* =======================================================
     LIVE STATE
  ======================================================= */

  const hasActivity =
    safeTransactions.length > 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      aria-label="Real-time balance"
      className="
        relative overflow-hidden
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >
      {/* =================================================
          TOP ACCENT
      ================================================= */}

      <div
        className={`
          absolute
          inset-x-0
          top-0
          h-1
          ${statusStyles.accent}
        `}
      />

      <div
        className="
          p-5 sm:p-6
        "
      >
        {/* ===============================================
            HEADER
        =============================================== */}

        <div
          className="
            flex justify-between items-start
            gap-4
          "
        >
          <div
            className="
              flex items-center
              min-w-0
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-10 h-10
                text-white
                bg-slate-900
                rounded-xl
                shrink-0
              "
            >
              <Wallet
                size={18}
                strokeWidth={2}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <h2
                className="
                  font-bold text-slate-900 text-sm
                "
              >
                Current balance
              </h2>

              <p
                className="
                  mt-0.5
                  text-[11px] text-slate-500
                "
              >
                Live financial position
              </p>
            </div>
          </div>

          {/* Live indicator */}

          <div
            className="
              inline-flex items-center
              px-2.5 py-1
              font-semibold text-[10px] text-emerald-700
              bg-emerald-50
              border border-emerald-100 rounded-full
              gap-1.5 shrink-0
            "
          >
            <span
              className="
                w-1.5 h-1.5
                bg-emerald-500
                rounded-full
              "
              aria-hidden="true"
            /
            >

            Live
          </div>
        </div>

        {/* ===============================================
            PRIMARY BALANCE
        =============================================== */}

        <div
          className="
            mt-7
          "
        >
          <p
            className="
              font-semibold text-[11px] text-slate-400 uppercase
              tracking-[0.08em]
            "
          >
            Net balance
          </p>

          <div
            className="
              flex flex-wrap items-end
              mt-1
              gap-3
            "
          >
            <h1
              className={`
                min-w-0
                break-words
                text-3xl
                font-bold
                tracking-tight
                sm:text-4xl
                ${
                  safeNumber(
                    balance
                  ) >= 0
                    ? "text-slate-950"
                    : "text-rose-600"
                }
              `}
            >
              {formatCurrency(
                balance,
                currency
              )}
            </h1>
          </div>

          {/* Status */}

          <div
            className="
              flex flex-wrap items-center
              mt-3
              gap-2
            "
          >
            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-[11px]
                font-semibold
                ${statusStyles.badge}
              `}
            >
              <StatusIcon
                size={13}
                strokeWidth={2.5}
              />

              {status.label}
            </span>

            <p
              className="
                text-slate-500 text-xs
              "
            >
              {status.description}
            </p>
          </div>
        </div>

        {/* ===============================================
            TODAY'S CASH FLOW
        =============================================== */}

        <div
          className="
            mt-6 p-4
            bg-slate-50/70
            border border-slate-100 rounded-2xl
          "
        >
          <div
            className="
              flex justify-between items-center
              gap-3
            "
          >
            <div>
              <p
                className="
                  font-semibold text-slate-800 text-xs
                "
              >
                Today
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px] text-slate-400
                "
              >
                Cash movement
              </p>
            </div>

            <div
              className={`
                inline-flex
                items-center
                gap-1
                text-xs
                font-bold
                ${
                  todayCashFlow >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              `}
            >
              {todayCashFlow >= 0 ? (
                <ArrowUpRight
                  size={14}
                />
              ) : (
                <ArrowDownRight
                  size={14}
                />
              )}

              {formatCurrency(
                Math.abs(
                  todayCashFlow
                ),
                currency
              )}
            </div>
          </div>

          <div
            className="
              space-y-4 mt-4
            "
          >
            <FlowRow
              label="Money received"
              value={formatCurrency(
                todayIncome,
                currency
              )}
              icon={ArrowUpRight}
              tone="positive"
            />

            <FlowRow
              label="Money spent"
              value={formatCurrency(
                todayExpense,
                currency
              )}
              icon={ArrowDownRight}
              tone="negative"
            />
          </div>
        </div>

        {/* ===============================================
            ACTIVITY FOOTER
        =============================================== */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-5 pt-4
            border-slate-100 border-t
            gap-3
          "
        >
          <div
            className="
              flex items-center
              gap-2
            "
          >
            <div
              className="
                flex justify-center items-center
                w-8 h-8
                text-slate-500
                bg-slate-50
                rounded-lg
              "
            >
              <Activity
                size={15}
              />
            </div>

            <div>
              <p
                className="
                  font-medium text-[11px] text-slate-400
                "
              >
                Recorded activity
              </p>

              <p
                className="
                  font-semibold text-slate-700 text-xs
                "
              >
                {formatNumber(
                  transactionCount
                )}{" "}
                transaction
                {safeNumber(
                  transactionCount
                ) === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          <div
            className="
              text-left sm:text-right
            "
          >
            <p
              className="
                font-medium text-[11px] text-slate-400
              "
            >
              Last activity
            </p>

            <p
              className="
                mt-0.5
                font-semibold text-slate-600 text-xs
              "
            >
              {hasActivity
                ? formatTransactionDate(
                    latestTransactionDate
                  )
                : "No activity yet"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealTimeBalanceEngine;
