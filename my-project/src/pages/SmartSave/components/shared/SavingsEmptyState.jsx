
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Plus,
  PiggyBank,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";

/* =========================================================
   SMARTSAVE CONSTANTS
========================================================= */

import {
  DEFAULT_CURRENCY,
  SAVINGS_STRATEGIES,
} from "../../../../constants/smartSaveConstants";

/* =========================================================
   SMARTSAVE CONFIGURATION
========================================================= */

import {
  SMART_SAVE_STRATEGY_CONFIG,
} from "../../../../config/smartSaveConfig";

/* =========================================================
   SMARTSAVE UTILITIES
========================================================= */

import {
  formatCurrency,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

const normalizeText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

const normalizeCurrency = (
  currency
) => {
  const value =
    normalizeText(currency);

  return value
    ? value.toUpperCase()
    : DEFAULT_CURRENCY ?? "NGN";
};

const toFiniteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const getFormattedAmount = (
  amount,
  currency
) => {
  try {
    return formatCurrency(
      amount,
      currency
    );
  } catch {
    try {
      return new Intl.NumberFormat(
        undefined,
        {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        }
      ).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  }
};

/* =========================================================
   STRATEGY LABELS
========================================================= */

const STRATEGY_LABELS = {
  [SAVINGS_STRATEGIES?.FIXED_AMOUNT ??
    "fixed_amount"]:
    "Fixed amount",

  [SAVINGS_STRATEGIES?.PERCENTAGE ??
    "percentage"]:
    "Percentage based",

  [SAVINGS_STRATEGIES?.INCOME_BASED ??
    "income_based"]:
    "Income based",

  [SAVINGS_STRATEGIES?.ROUND_UP ??
    "round_up"]:
    "Round-up savings",

  [SAVINGS_STRATEGIES?.CUSTOM ??
    "custom"]:
    "Custom strategy",
};

/* =========================================================
   DEFAULT COPY
========================================================= */

const DEFAULT_TITLE =
  "Start building your savings";

const DEFAULT_DESCRIPTION =
  "Create your first savings goal or strategy and start turning small, consistent contributions into meaningful progress.";

const DEFAULT_ACTION_LABEL =
  "Create savings goal";

/* =========================================================
   MAIN COMPONENT
========================================================= */

const SavingsEmptyState = ({
  /* =======================================================
     PRIMARY ACTION
  ======================================================= */

  onCreate,

  actionLabel =
    DEFAULT_ACTION_LABEL,

  showAction = true,

  /* =======================================================
     CONTENT
  ======================================================= */

  title =
    DEFAULT_TITLE,

  description =
    DEFAULT_DESCRIPTION,

  /* =======================================================
     CONTEXT
  ======================================================= */

  type = "general",

  /* =======================================================
     OPTIONAL SAVINGS CONTEXT
  ======================================================= */

  suggestedAmount,
  currency,

  strategyType,

  /* =======================================================
     OPTIONAL SECONDARY ACTION
  ======================================================= */

  onSecondaryAction,
  secondaryActionLabel,

  /* =======================================================
     VISUAL OPTIONS
  ======================================================= */

  icon,

  compact = false,

  bordered = true,

  className = "",
}) => {
  /* =======================================================
     NORMALIZED VALUES
  ======================================================= */

  const normalizedCurrency =
    normalizeCurrency(
      currency
    );

  const numericSuggestedAmount =
    toFiniteNumber(
      suggestedAmount
    );

  const formattedSuggestedAmount =
    numericSuggestedAmount > 0
      ? getFormattedAmount(
          numericSuggestedAmount,
          normalizedCurrency
        )
      : null;

  const normalizedStrategyType =
    normalizeText(
      strategyType
    )
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_"
      );

  const strategyLabel =
    STRATEGY_LABELS[
      normalizedStrategyType
    ] ?? null;

  /* =======================================================
     ICON RESOLUTION
  ======================================================= */

  const Icon =
    icon ??
    (type === "goal"
      ? Target
      : type === "strategy"
        ? Sparkles
        : type === "account"
          ? WalletCards
          : type === "activity"
            ? CircleDollarSign
            : PiggyBank);

  /* =======================================================
     SAFE CALLBACKS
  ======================================================= */

  const canCreate =
    showAction &&
    typeof onCreate ===
      "function";

  const canUseSecondaryAction =
    typeof onSecondaryAction ===
      "function" &&
    Boolean(
      secondaryActionLabel
    );

  /* =======================================================
     CONFIGURATION FALLBACKS
  ======================================================= */

  const configuredTitle =
    title ||
    SMART_SAVE_STRATEGY_CONFIG
      ?.emptyStateTitle ||
    DEFAULT_TITLE;

  const configuredDescription =
    description ||
    SMART_SAVE_STRATEGY_CONFIG
      ?.emptyStateDescription ||
    DEFAULT_DESCRIPTION;

  /* =======================================================
     COMPACT MODE
  ======================================================= */

  if (compact) {
    return (
      <div
        className={`
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-8
          text-center
          ${bordered
            ? `
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
            `
            : ""}
          ${className}
        `}
      >
        <div
          className="
            flex justify-center items-center
            w-11 h-11
            text-slate-700
            bg-slate-100
            rounded-xl
          "
          aria-hidden="true"
        >
          <Icon
            size={20}
          />
        </div>

        <h3
          className="
            mt-3
            font-semibold text-slate-900 text-sm
          "
        >
          {configuredTitle}
        </h3>

        <p
          className="
            max-w-sm
            mt-1.5
            text-slate-500 text-xs leading-5
          "
        >
          {configuredDescription}
        </p>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="
              inline-flex justify-center items-center
              min-h-9
              mt-4 px-3.5 py-2
              font-semibold text-white text-xs
              bg-slate-900 hover:bg-slate-800
              rounded-lg focus:outline-none
              focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
              transition
              gap-2
            "
          >
            <Plus
              size={14}
            />

            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  /* =======================================================
     FULL EMPTY STATE
  ======================================================= */

  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-2xl
        bg-white
        ${bordered
          ? "border border-slate-200"
          : ""}
        ${className}
      `}
    >
      {/* ===================================================
          DECORATIVE BACKGROUND
      =================================================== */}

      <div
        className="
          absolute
          w-40 h-40
          bg-slate-100
          rounded-full
          opacity-60 blur-3xl
          pointer-events-none
          -top-16 -right-16
        "
        aria-hidden="true"
      /
      >

      <div
        className="
          absolute
          w-40 h-40
          bg-slate-100
          rounded-full
          opacity-50 blur-3xl
          pointer-events-none
          -bottom-20 -left-16
        "
        aria-hidden="true"
      /
      >

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative flex flex-col items-center
          px-6 sm:px-10 py-12 sm:py-14
          text-center
        "
      >
        {/* =================================================
            ICON
        ================================================= */}

        <div
          className="
            flex justify-center items-center
            w-16 h-16
            text-slate-700
            bg-slate-50
            border border-slate-200 rounded-2xl
            shadow-sm
          "
          aria-hidden="true"
        >
          <Icon
            size={28}
            strokeWidth={1.8}
          />
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <h3
          className="
            max-w-lg
            mt-5
            font-bold text-slate-900 text-lg sm:text-xl tracking-tight
          "
        >
          {configuredTitle}
        </h3>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p
          className="
            max-w-xl
            mt-2
            text-slate-500 text-sm leading-6
          "
        >
          {configuredDescription}
        </p>

        {/* =================================================
            SUGGESTED AMOUNT
        ================================================= */}

        {formattedSuggestedAmount && (
          <div
            className="
              inline-flex items-center
              mt-5 px-3.5 py-2.5
              bg-slate-50
              border border-slate-200 rounded-xl
              gap-2
            "
          >
            <CheckCircle2
              size={15}
              className="
                text-emerald-600
              "
              aria-hidden="true"
            /
            >

            <span
              className="
                text-slate-500 text-xs
              "
            >
              Suggested starting amount
            </span>

            <span
              className="
                font-bold text-slate-900 text-sm
              "
            >
              {formattedSuggestedAmount}
            </span>
          </div>
        )}

        {/* =================================================
            STRATEGY CONTEXT
        ================================================= */}

        {strategyLabel && (
          <div
            className="
              inline-flex items-center
              mt-3
              font-medium text-slate-500 text-xs
              gap-1.5
            "
          >
            <Sparkles
              size={13}
              aria-hidden="true"
            />

            <span>
              {strategyLabel}
            </span>
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        {(canCreate ||
          canUseSecondaryAction) && (
          <div
            className="
              flex flex-col sm:flex-row justify-center items-center
              w-full sm:w-auto
              mt-7
              gap-2.5
            "
          >
            {canCreate && (
              <button
                type="button"
                onClick={onCreate}
                className="
                  inline-flex justify-center items-center
                  w-full sm:w-auto min-h-11
                  px-5 py-2.5
                  font-semibold text-white text-sm
                  bg-slate-900 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                  shadow-sm transition
                  gap-2
                "
              >
                <Plus
                  size={17}
                  aria-hidden="true"
                />

                {actionLabel}
              </button>
            )}

            {canUseSecondaryAction && (
              <button
                type="button"
                onClick={
                  onSecondaryAction
                }
                className="
                  inline-flex justify-center items-center
                  w-full sm:w-auto min-h-11
                  px-5 py-2.5
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                  transition
                  gap-2
                "
              >
                {secondaryActionLabel}

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        )}

        {/* =================================================
            SUPPORTING MESSAGE
        ================================================= */}

        <div
          className="
            flex items-start
            max-w-lg
            mt-7
            text-left
            gap-2
          "
        >
          <CheckCircle2
            size={15}
            className="
              mt-0.5
              text-emerald-600
              shrink-0
            "
            aria-hidden="true"
          /
          >

          <p
            className="
              text-slate-500 text-xs leading-5
            "
          >
            Start with an amount that fits
            comfortably within your budget.
            Consistency matters more than
            starting big.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsEmptyState;