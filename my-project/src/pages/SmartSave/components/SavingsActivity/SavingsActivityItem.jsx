
import PropTypes from "prop-types";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Info,
  PauseCircle,
  XCircle,
} from "lucide-react";

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_CURRENCY = "NGN";

/* =========================================================
   SAFE HELPERS
========================================================= */

const isValidDate = (value) => {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

const formatDate = (value) => {
  if (!isValidDate(value)) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const formatTime = (value) => {
  if (!isValidDate(value)) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatCurrency = (
  amount,
  currency = DEFAULT_CURRENCY
) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return null;
  }

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount.toFixed(2)}`;
  }
};

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getActivityId = (activity) =>
  activity?.id ??
  activity?._id ??
  activity?.activityId ??
  activity?.reference ??
  null;

/* =========================================================
   ACTIVITY TYPE
========================================================= */

const getActivityType = (activity) => {
  const type = normalizeText(
    activity?.type ??
      activity?.activityType ??
      activity?.eventType ??
      activity?.category
  ).toLowerCase();

  if (
    type.includes("contribution") ||
    type.includes("deposit") ||
    type.includes("save")
  ) {
    return "contribution";
  }

  if (
    type.includes("withdraw") ||
    type.includes("withdrawal")
  ) {
    return "withdrawal";
  }

  if (type.includes("complete")) {
    return "completed";
  }

  if (type.includes("pause")) {
    return "paused";
  }

  if (
    type.includes("cancel") ||
    type.includes("failed") ||
    type.includes("fail")
  ) {
    return "failed";
  }

  if (
    type.includes("schedule") ||
    type.includes("execution")
  ) {
    return "execution";
  }

  return "default";
};

/* =========================================================
   VISUAL CONFIGURATION
========================================================= */

const ACTIVITY_CONFIG = {
  contribution: {
    icon: ArrowUpRight,
    label: "Contribution",
    iconWrapper:
      "bg-emerald-50 text-emerald-600",
    amount:
      "text-emerald-600",
  },

  withdrawal: {
    icon: ArrowDownLeft,
    label: "Withdrawal",
    iconWrapper:
      "bg-rose-50 text-rose-600",
    amount:
      "text-rose-600",
  },

  completed: {
    icon: CheckCircle2,
    label: "Completed",
    iconWrapper:
      "bg-emerald-50 text-emerald-600",
    amount:
      "text-slate-900",
  },

  paused: {
    icon: PauseCircle,
    label: "Paused",
    iconWrapper:
      "bg-amber-50 text-amber-600",
    amount:
      "text-slate-900",
  },

  failed: {
    icon: XCircle,
    label: "Failed",
    iconWrapper:
      "bg-red-50 text-red-600",
    amount:
      "text-slate-900",
  },

  execution: {
    icon: Clock3,
    label: "Saving execution",
    iconWrapper:
      "bg-blue-50 text-blue-600",
    amount:
      "text-slate-900",
  },

  default: {
    icon: Info,
    label: "Savings activity",
    iconWrapper:
      "bg-slate-100 text-slate-600",
    amount:
      "text-slate-900",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsActivityItem = ({
  activity,
  onClick,
  className = "",
  showDate = true,
  showAmount = true,
  compact = false,
}) => {
  if (!activity || typeof activity !== "object") {
    return null;
  }

  const id = getActivityId(activity);

  const activityType = getActivityType(activity);

  const config =
    ACTIVITY_CONFIG[activityType] ??
    ACTIVITY_CONFIG.default;

  const Icon = config.icon;

  const title =
    normalizeText(
      activity?.title ??
        activity?.name ??
        activity?.description
    ) ||
    config.label;

  const description =
    normalizeText(
      activity?.description ??
        activity?.message ??
        activity?.note
    );

  const date =
    activity?.date ??
    activity?.createdAt ??
    activity?.occurredAt ??
    activity?.executedAt ??
    activity?.updatedAt;

  const currency =
    normalizeText(
      activity?.currency ??
        activity?.amount?.currency
    ) ||
    DEFAULT_CURRENCY;

  const rawAmount =
    typeof activity?.amount === "object"
      ? activity.amount?.value
      : activity?.amount;

  const formattedAmount = formatCurrency(
    rawAmount,
    currency
  );

  const status =
    normalizeText(activity?.status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  const goalName =
    normalizeText(
      activity?.goalName ??
        activity?.savingGoal?.name ??
        activity?.goal?.name
    );

  const handleClick = () => {
    if (typeof onClick !== "function") {
      return;
    }

    onClick(activity);
  };

  const interactive =
    typeof onClick === "function";

  return (
    <article
      data-activity-id={id || undefined}
      className={[
        "group flex w-full items-center gap-3",
        "rounded-xl border border-slate-100",
        "bg-white p-3",
        "transition-all duration-200",
        interactive
          ? "cursor-pointer hover:border-slate-200 hover:shadow-sm"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {/* =================================================
          ICON
      ================================================= */}

      <div
        className={[
          "flex shrink-0 items-center justify-center",
          "rounded-full",
          compact
            ? "h-9 w-9"
            : "h-10 w-10",
          config.iconWrapper,
        ].join(" ")}
        aria-hidden="true"
      >
        <Icon
          size={compact ? 16 : 18}
          strokeWidth={2}
        />
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

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
            <p
              className="
                font-semibold text-slate-900 text-sm truncate
              "
            >
              {title}
            </p>

            {description && (
              <p
                className="
                  mt-0.5
                  text-slate-500 text-xs line-clamp-1
                "
              >
                {description}
              </p>
            )}

            {goalName && (
              <p
                className="
                  mt-1
                  text-slate-400 text-xs truncate
                "
              >
                {goalName}
              </p>
            )}
          </div>

          {/* =================================================
              AMOUNT
          ================================================= */}

          {showAmount && formattedAmount && (
            <p
              className={[
                "shrink-0 text-sm font-bold",
                config.amount,
              ].join(" ")}
            >
              {formattedAmount}
            </p>
          )}
        </div>

        {/* =================================================
            META
        ================================================= */}

        {(showDate || status) && (
          <div
            className="
              flex flex-wrap items-center
              mt-2
              gap-x-3 gap-y-1
            "
          >
            {showDate && date && (
              <span
                className="
                  inline-flex items-center
                  text-[11px] text-slate-400
                  gap-1
                "
              >
                <CalendarDays
                  size={12}
                  aria-hidden="true"
                />

                <span>
                  {formatDate(date)}

                  {formatTime(date) &&
                    ` · ${formatTime(date)}`}
                </span>
              </span>
            )}

            {status && (
              <span
                className={[
                  "inline-flex items-center rounded-full",
                  "bg-slate-100 px-2 py-0.5",
                  "text-[10px] font-medium text-slate-600",
                ].join(" ")}
              >
                {status}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

/* =========================================================
   PROP TYPES
========================================================= */

SavingsActivityItem.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    _id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    activityId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    type: PropTypes.string,
    activityType: PropTypes.string,
    eventType: PropTypes.string,
    category: PropTypes.string,
    title: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    message: PropTypes.string,
    note: PropTypes.string,
    amount: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.string,
        ]),
        currency: PropTypes.string,
      }),
    ]),
    currency: PropTypes.string,
    status: PropTypes.string,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    occurredAt: PropTypes.string,
    executedAt: PropTypes.string,
    updatedAt: PropTypes.string,
    goalName: PropTypes.string,
    savingGoal: PropTypes.shape({
      name: PropTypes.string,
    }),
    goal: PropTypes.shape({
      name: PropTypes.string,
    }),
  }),

  onClick: PropTypes.func,

  className: PropTypes.string,

  showDate: PropTypes.bool,

  showAmount: PropTypes.bool,

  compact: PropTypes.bool,
};

SavingsActivityItem.defaultProps = {
  activity: null,
  onClick: undefined,
  className: "",
  showDate: true,
  showAmount: true,
  compact: false,
};

export default SavingsActivityItem;
