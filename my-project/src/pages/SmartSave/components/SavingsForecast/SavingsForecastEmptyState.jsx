import {
  createElement,
  memo,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Target,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE =
  "Your savings forecast is not ready yet.";

const DEFAULT_MESSAGE =
  "Keep saving consistently and we'll use your progress to build a more accurate forecast.";

const DEFAULT_ACTION_LABEL =
  "Start saving";

const DEFAULT_ARIA_LABEL =
  "Savings forecast status";

/* =========================================================
   HELPERS
========================================================= */

const resolveText = (
  value,
  fallback
) => {
  if (
    typeof value !== "string"
  ) {
    return fallback;
  }

  const trimmed =
    value.trim();

  return trimmed || fallback;
};

const resolveOptionalText = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
};

const resolveClassName = (
  value
) => {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsForecastEmptyState = ({
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,

  onAction,
  actionLabel = DEFAULT_ACTION_LABEL,

  onSecondaryAction,
  secondaryActionLabel = "",

  icon,
  className = "",
}) => {
  /* =======================================================
     CONTENT
  ======================================================= */

  const safeTitle =
    resolveText(
      title,
      DEFAULT_TITLE
    );

  const safeMessage =
    resolveText(
      message,
      DEFAULT_MESSAGE
    );

  const safeActionLabel =
    resolveText(
      actionLabel,
      DEFAULT_ACTION_LABEL
    );

  const safeSecondaryActionLabel =
    resolveOptionalText(
      secondaryActionLabel
    );

  /* =======================================================
     ACTIONS
  ======================================================= */

  const hasPrimaryAction =
    typeof onAction ===
    "function";

  const hasSecondaryAction =
    typeof onSecondaryAction ===
      "function" &&
    Boolean(
      safeSecondaryActionLabel
    );

  /* =======================================================
     ICON
  ======================================================= */

  const IconComponent =
    typeof icon === "function"
      ? icon
      : CalendarDays;

  /* =======================================================
     CLASS NAME
  ======================================================= */

  const safeClassName =
    resolveClassName(
      className
    );

  const containerClassName = [
    "flex flex-col items-center justify-center",
    "px-5 py-8 sm:px-6 sm:py-10",
    "text-center",
    "bg-white",
    "border border-slate-200",
    "rounded-2xl",
    safeClassName,
  ]
    .filter(Boolean)
    .join(" ");

  /* =======================================================
     ICON ELEMENT
  ======================================================= */

  const iconElement =
    createElement(
      IconComponent,
      {
        size: 22,
        strokeWidth: 2,
        "aria-hidden": true,
      }
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={
        containerClassName
      }
      role="status"
      aria-live="polite"
      aria-label={
        DEFAULT_ARIA_LABEL
      }
    >
      {/* =================================================
          ICON
      ================================================= */}

      <div
        className="
          flex justify-center items-center
          w-12 h-12
          mb-4
          text-blue-600
          bg-blue-50
          border border-blue-100 rounded-2xl
          shrink-0
        "
        aria-hidden="true"
      >
        {iconElement}
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          min-w-0 max-w-md
        "
      >
        <h3
          className="
            font-semibold text-slate-900 text-sm sm:text-base
          "
        >
          {safeTitle}
        </h3>

        <p
          className="
            mt-1.5
            text-slate-500 text-xs sm:text-sm leading-5
          "
        >
          {safeMessage}
        </p>
      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      {(hasPrimaryAction ||
        hasSecondaryAction) && (
        <div
          className="
            flex flex-col sm:flex-row justify-center items-center
            w-full sm:w-auto
            mt-5
            gap-2.5
          "
        >
          {/* =============================================
              PRIMARY ACTION
          ============================================= */}

          {hasPrimaryAction && (
            <button
              type="button"
              onClick={onAction}
              className="
                inline-flex justify-center items-center
                w-full sm:w-auto min-h-10
                px-4
                font-semibold text-white text-sm
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                rounded-xl focus:outline-none
                shadow-sm transition-colors
                gap-2 focus-visible:ring-4 focus-visible:ring-blue-500/20
              "
              aria-label={
                safeActionLabel
              }
            >
              <Target
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span>
                {safeActionLabel}
              </span>

              <ArrowRight
                size={15}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>
          )}

          {/* =============================================
              SECONDARY ACTION
          ============================================= */}

          {hasSecondaryAction && (
            <button
              type="button"
              onClick={
                onSecondaryAction
              }
              className="
                inline-flex justify-center items-center
                w-full sm:w-auto min-h-10
                px-4
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-50 active:bg-slate-100
                border border-slate-300 rounded-xl focus:outline-none
                transition-colors
                focus-visible:ring-4 focus-visible:ring-slate-500/15
              "
            >
              {safeSecondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

SavingsForecastEmptyState.displayName =
  "SavingsForecastEmptyState";

export default memo(
  SavingsForecastEmptyState
);