
import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useMemo } from "react";

/* =========================================================
   DEFAULT MESSAGE
========================================================= */

const DEFAULT_ERROR_MESSAGE =
  "We couldn't load your savings forecast right now.";

/* =========================================================
   ERROR MESSAGE NORMALIZER
========================================================= */

const normalizeErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (typeof error === "string") {
    return error.trim() || DEFAULT_ERROR_MESSAGE;
  }

  if (error instanceof Error) {
    return (
      error.message?.trim() ||
      DEFAULT_ERROR_MESSAGE
    );
  }

  if (typeof error === "object") {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.data?.message ||
      error?.data?.error ||
      error?.message ||
      error?.error;

    if (typeof message === "string") {
      return (
        message.trim() ||
        DEFAULT_ERROR_MESSAGE
      );
    }
  }

  return DEFAULT_ERROR_MESSAGE;
};

/* =========================================================
   COMPONENT
========================================================= */

const SavingsForecastErrorState = ({
  error = null,
  message = "",
  onRetry,
  retryLabel = "Try again",
  title = "Forecast unavailable",
  className = "",
}) => {
  /* =======================================================
     DERIVED ERROR MESSAGE
  ======================================================= */

  const displayMessage = useMemo(() => {
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }

    return normalizeErrorMessage(error);
  }, [error, message]);

  /* =======================================================
     RETRY AVAILABILITY
  ======================================================= */

  const canRetry =
    typeof onRetry === "function";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex flex-col justify-center items-center
        px-5 sm:px-6 py-8 sm:py-10
        text-center
        bg-white
        border border-slate-200
        rounded-2xl
        ${className}
      `}
    >
      {/* =================================================
          ICON
      ================================================= */}

      <div
        className="
          flex justify-center items-center
          w-11 h-11
          mb-4
          text-red-600
          bg-red-50
          border border-red-100 rounded-xl
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
          max-w-md
        "
      >
        <h3
          className="
            font-semibold text-slate-900 text-sm sm:text-base
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1.5
            text-slate-500 text-xs sm:text-sm leading-5
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
            bg-blue-50 hover:bg-blue-100
            border border-blue-100 rounded-xl focus:outline-none
            focus:ring-4 focus:ring-blue-500/15
            transition
            gap-2
          "
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
          />

          {retryLabel}
        </button>
      )}
    </div>
  );
};

export default SavingsForecastErrorState;
