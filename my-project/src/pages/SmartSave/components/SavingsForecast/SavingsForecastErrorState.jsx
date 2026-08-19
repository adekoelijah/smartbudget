import { memo } from "react";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_ERROR_MESSAGE =
  "We couldn't load your savings forecast right now.";

const DEFAULT_TITLE =
  "Forecast unavailable";

const DEFAULT_RETRY_LABEL =
  "Try again";

const DEFAULT_ARIA_LABEL =
  "Savings forecast error";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Safely extracts a usable error message from
 * common Axios, API, Error, and string formats.
 */
const normalizeErrorMessage = (
  error
) => {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE;
  }

  /* -----------------------------------------
     STRING ERROR
  ----------------------------------------- */

  if (typeof error === "string") {
    const message =
      error.trim();

    return (
      message ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  /* -----------------------------------------
     NATIVE ERROR
  ----------------------------------------- */

  if (error instanceof Error) {
    const message =
      typeof error.message ===
      "string"
        ? error.message.trim()
        : "";

    return (
      message ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  /* -----------------------------------------
     API / AXIOS ERROR
  ----------------------------------------- */

  if (
    typeof error === "object"
  ) {
    const candidates = [
      error?.response?.data?.message,
      error?.response?.data?.error,
      error?.data?.message,
      error?.data?.error,
      error?.message,
      error?.error,
    ];

    for (
      const candidate of candidates
    ) {
      if (
        typeof candidate ===
        "string"
      ) {
        const message =
          candidate.trim();

        if (message) {
          return message;
        }
      }
    }
  }

  return DEFAULT_ERROR_MESSAGE;
};

/**
 * Safely resolves display text.
 */
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

  return (
    trimmed ||
    fallback
  );
};

/**
 * Safely resolves className.
 */
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

const SavingsForecastErrorState = ({
  error = null,

  message = "",

  onRetry,

  retryLabel =
    DEFAULT_RETRY_LABEL,

  title =
    DEFAULT_TITLE,

  className = "",
}) => {
  /* =======================================================
     DISPLAY MESSAGE
  ======================================================= */

  const displayMessage =
    resolveText(
      message,
      normalizeErrorMessage(
        error
      )
    );

  /* =======================================================
     SAFE CONTENT
  ======================================================= */

  const safeTitle =
    resolveText(
      title,
      DEFAULT_TITLE
    );

  const safeRetryLabel =
    resolveText(
      retryLabel,
      DEFAULT_RETRY_LABEL
    );

  const safeClassName =
    resolveClassName(
      className
    );

  /* =======================================================
     RETRY
  ======================================================= */

  const canRetry =
    typeof onRetry ===
    "function";

  /* =======================================================
     CLASS NAME
  ======================================================= */

  const containerClassName = [
    "flex flex-col justify-center items-center",
    "px-5 sm:px-6 py-8 sm:py-10",
    "text-center",
    "bg-white",
    "border border-slate-200",
    "rounded-2xl",
    safeClassName,
  ]
    .filter(Boolean)
    .join(" ");

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={
        containerClassName
      }
      role="alert"
      aria-live="assertive"
      aria-label={
        DEFAULT_ARIA_LABEL
      }
    >
      {/* =================================================
          ERROR ICON
      ================================================= */}

      <div
        className="
          flex justify-center items-center
          w-11 h-11
          mb-4
          text-red-600
          bg-red-50
          border border-red-100 rounded-xl
          shrink-0
        "
        aria-hidden="true"
      >
        <AlertCircle
          size={21}
          strokeWidth={2}
        />
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
            text-slate-500 text-xs sm:text-sm break-words leading-5
          "
        >
          {displayMessage}
        </p>
      </div>

      {/* =================================================
          RETRY
      ================================================= */}

      {canRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="
            inline-flex justify-center items-center
            min-h-10
            mt-5 px-4
            font-medium text-blue-700 text-sm
            bg-blue-50 hover:bg-blue-100 active:bg-blue-200
            border border-blue-100 rounded-xl focus:outline-none
            shadow-sm transition-colors
            gap-2 focus-visible:ring-4 focus-visible:ring-blue-500/15
          "
          aria-label={
            safeRetryLabel
          }
        >
          <RefreshCw
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>
            {safeRetryLabel}
          </span>
        </button>
      )}
    </section>
  );
};

/* =========================================================
   COMPONENT CONTRACT
========================================================= */

SavingsForecastErrorState.displayName =
  "SavingsForecastErrorState";

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  SavingsForecastErrorState
);