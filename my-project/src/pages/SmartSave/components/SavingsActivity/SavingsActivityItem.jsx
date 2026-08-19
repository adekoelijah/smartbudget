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
import { memo } from "react";

import { DEFAULT_CURRENCY } from "../../../../constants/smartSaveConstants";

/* =========================================================
   CONSTANTS
========================================================= */

const DATE_LOCALE = "en-NG";

const DATE_FORMATTER = new Intl.DateTimeFormat(
  DATE_LOCALE,
  {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
);

const TIME_FORMATTER = new Intl.DateTimeFormat(
  DATE_LOCALE,
  {
    hour: "numeric",
    minute: "2-digit",
  }
);

/* =========================================================
   SAFE HELPERS
========================================================= */

/**
 * Converts an arbitrary date-like value into a valid Date.
 *
 * Returns null instead of throwing when the value cannot
 * be interpreted as a valid date.
 */
const toValidDate = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

/**
 * Formats a date for SmartSave activity display.
 */
const formatDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  try {
    return DATE_FORMATTER.format(date);
  } catch {
    return "Date unavailable";
  }
};

/**
 * Formats a time for SmartSave activity display.
 */
const formatTime = (date) => {
  if (!date) {
    return "";
  }

  try {
    return TIME_FORMATTER.format(date);
  } catch {
    return "";
  }
};

/**
 * Formats a financial amount safely.
 *
 * Returns null when the amount cannot be represented as a
 * finite number.
 */
const formatCurrency = (
  amount,
  currency = DEFAULT_CURRENCY
) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return null;
  }

  const normalizedCurrency =
    typeof currency === "string" &&
    currency.trim()
      ? currency.trim().toUpperCase()
      : DEFAULT_CURRENCY;

  try {
    return new Intl.NumberFormat(DATE_LOCALE, {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${normalizedCurrency} ${numericAmount.toFixed(2)}`;
  }
};

/**
 * Safely normalizes display text.
 */
const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

/**
 * Returns a stable activity identifier when one exists.
 */
const getActivityId = (activity) =>
  activity?.id ??
  activity?._id ??
  activity?.activityId ??
  activity?.reference ??
  null;

/**
 * Extracts an amount from both primitive and object-based
 * API response shapes.
 */
const getRawAmount = (activity) => {
  if (
    activity?.amount !== null &&
    typeof activity?.amount === "object"
  ) {
    return activity.amount?.value;
  }

  return activity?.amount;
};

/**
 * Resolves the activity date from the supported API fields.
 */
const getActivityDate = (activity) =>
  activity?.date ??
  activity?.createdAt ??
  activity?.occurredAt ??
  activity?.executedAt ??
  activity?.updatedAt ??
  null;

/**
 * Formats API statuses for human-readable presentation.
 */
const formatStatus = (value) => {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
};

/* =========================================================
   ACTIVITY TYPE
========================================================= */

/**
 * Resolves an activity into a small, presentation-oriented
 * type vocabulary.
 *
 * The backend remains the source of truth. These aliases are
 * only compatibility handling for supported response shapes.
 */
const getActivityType = (activity) => {
  const rawType = normalizeText(
    activity?.type ??
      activity?.activityType ??
      activity?.eventType ??
      activity?.category
  );

  if (!rawType) {
    return "default";
  }

  const type = rawType.toLowerCase();

  /*
   * More specific lifecycle states are checked first so that
   * values such as "saving_execution_completed" are not
   * accidentally classified only as generic saving activity.
   */

  if (
    type.includes("failed") ||
    type.includes("failure") ||
    type.includes("cancel") ||
    type.includes("cancelled")
  ) {
    return "failed";
  }

  if (
    type.includes("pause") ||
    type.includes("paused")
  ) {
    return "paused";
  }

  if (
    type.includes("complete") ||
    type.includes("completed")
  ) {
    return "completed";
  }

  if (
    type.includes("execution") ||
    type.includes("executed")
  ) {
    return "execution";
  }

  if (
    type.includes("withdraw") ||
    type.includes("withdrawal")
  ) {
    return "withdrawal";
  }

  if (
    type.includes("contribution") ||
    type.includes("deposit") ||
    type.includes("saving") ||
    type === "save"
  ) {
    return "contribution";
  }

  return "default";
};

/* =========================================================
   VISUAL CONFIGURATION
========================================================= */

const ACTIVITY_CONFIG = Object.freeze({
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
});

/* =========================================================
   CLASS HELPERS
========================================================= */

const getContainerClasses = ({
  interactive,
  className,
}) =>
  [
    "group flex w-full items-center gap-3",
    "rounded-xl border border-slate-100",
    "bg-white p-3",
    "transition-all duration-200",
    interactive
      ? [
          "cursor-pointer",
          "hover:border-slate-200",
          "hover:shadow-sm",
          "focus:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-slate-900",
          "focus-visible:ring-offset-2",
        ].join(" ")
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

const getIconWrapperClasses = (compact, iconWrapper) =>
  [
    "flex shrink-0 items-center justify-center",
    "rounded-full",
    compact
      ? "h-9 w-9"
      : "h-10 w-10",
    iconWrapper,
  ].join(" ");

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
  /*
   * Invalid activity data should never crash the activity
   * list. The parent can simply render the next item.
   */
  if (
    !activity ||
    typeof activity !== "object" ||
    Array.isArray(activity)
  ) {
    return null;
  }

  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const id = getActivityId(activity);

  const activityType =
    getActivityType(activity);

  const config =
    ACTIVITY_CONFIG[activityType] ??
    ACTIVITY_CONFIG.default;

  const Icon = config.icon;

  const title =
    normalizeText(
      activity.title ??
        activity.name ??
        activity.description
    ) || config.label;

  const description =
    normalizeText(
      activity.description ??
        activity.message ??
        activity.note
    );

  const goalName =
    normalizeText(
      activity.goalName ??
        activity.savingGoal?.name ??
        activity.goal?.name
    );

  const activityDate =
    toValidDate(
      getActivityDate(activity)
    );

  const formattedDate =
    activityDate
      ? formatDate(activityDate)
      : "";

  const formattedTime =
    activityDate
      ? formatTime(activityDate)
      : "";

  const currency =
    normalizeText(
      activity.currency ??
        (
          activity.amount &&
          typeof activity.amount ===
            "object"
            ? activity.amount.currency
            : ""
        )
    ) || DEFAULT_CURRENCY;

  const rawAmount =
    getRawAmount(activity);

  const formattedAmount =
    formatCurrency(
      rawAmount,
      currency
    );

  const status =
    formatStatus(activity.status);

  /* =======================================================
     INTERACTION
  ======================================================= */

  const interactive =
    typeof onClick === "function";

  const handleClick = () => {
    if (!interactive) {
      return;
    }

    onClick(activity);
  };

  const handleKeyDown = (event) => {
    if (!interactive) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleClick();
    }
  };

  /* =======================================================
     SHARED CONTENT
  ======================================================= */

  const content = (
    <>
      {/* =================================================
          ICON
      ================================================= */}

      <div
        aria-hidden="true"
        className={getIconWrapperClasses(
          compact,
          config.iconWrapper
        )}
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

          {/* =============================================
              AMOUNT
          ============================================= */}

          {showAmount &&
            formattedAmount && (
              <p
                className={[
                  "shrink-0",
                  "font-bold",
                  "text-sm",
                  config.amount,
                ].join(" ")}
                aria-label={`Amount ${formattedAmount}`}
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
            {showDate && activityDate && (
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
                  {formattedDate}

                  {formattedTime &&
                    ` · ${formattedTime}`}
                </span>
              </span>
            )}

            {status && (
              <span
                className="
                  inline-flex items-center
                  px-2 py-0.5
                  font-medium text-[10px] text-slate-600
                  bg-slate-100
                  rounded-full
                "
              >
                {status}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  /*
   * Native button semantics are preferable when the entire
   * activity item is interactive.
   *
   * Non-interactive items remain semantic <article> elements.
   */
  if (interactive) {
    return (
      <button
        type="button"
        data-activity-id={
          id !== null &&
          id !== undefined
            ? String(id)
            : undefined
        }
        className={getContainerClasses({
          interactive: true,
          className,
        })}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {content}
      </button>
    );
  }

  return (
    <article
      data-activity-id={
        id !== null &&
        id !== undefined
          ? String(id)
          : undefined
      }
      className={getContainerClasses({
        interactive: false,
        className,
      })}
    >
      {content}
    </article>
  );
};

/* =========================================================
   PROP TYPES
========================================================= */

const amountPropType =
  PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
      currency: PropTypes.string,
    }),
  ]);

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

    reference: PropTypes.oneOfType([
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

    amount: amountPropType,

    currency: PropTypes.string,

    status: PropTypes.string,

    date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    occurredAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    executedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

    updatedAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),

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

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsActivityItem
);