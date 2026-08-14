
import {
  ArrowRight,
  CalendarDays,
  Target,
} from "lucide-react";

/* =========================================================
   DEFAULT CONTENT
========================================================= */

const DEFAULT_TITLE =
  "Your savings forecast is not ready yet.";

const DEFAULT_MESSAGE =
  "Keep saving consistently and we'll use your progress to build a more accurate forecast.";

const DEFAULT_ACTION_LABEL =
  "Start saving";

/* =========================================================
   COMPONENT
========================================================= */

const SavingsForecastEmptyState = ({
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,

  onAction = null,
  actionLabel = DEFAULT_ACTION_LABEL,

  onSecondaryAction = null,
  secondaryActionLabel = "",

  icon: Icon = CalendarDays,

  className = "",
}) => {
  /* =======================================================
     SAFE CONTENT
  ======================================================= */

  const safeTitle =
    typeof title === "string" &&
    title.trim()
      ? title.trim()
      : DEFAULT_TITLE;

  const safeMessage =
    typeof message === "string" &&
    message.trim()
      ? message.trim()
      : DEFAULT_MESSAGE;

  const safeActionLabel =
    typeof actionLabel === "string" &&
    actionLabel.trim()
      ? actionLabel.trim()
      : DEFAULT_ACTION_LABEL;

  const safeSecondaryActionLabel =
    typeof secondaryActionLabel === "string"
      ? secondaryActionLabel.trim()
      : "";

  /* =======================================================
     ACTION AVAILABILITY
  ======================================================= */

  const hasPrimaryAction =
    typeof onAction === "function";

  const hasSecondaryAction =
    typeof onSecondaryAction === "function" &&
    Boolean(safeSecondaryActionLabel);

  /* =======================================================
     ICON SAFETY
  ======================================================= */

  const SafeIcon =
    typeof Icon === "function"
      ? Icon
      : CalendarDays;

  /* =======================================================
     CLASS SAFETY
  ======================================================= */

  const safeClassName =
    typeof className === "string"
      ? className.trim()
      : "";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={[
        "flex flex-col items-center justify-center",
        "px-5 py-8 sm:px-6 sm:py-10",
        "text-center",
        "bg-white",
        "border border-slate-200",
        "rounded-2xl",
        safeClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-label="Savings forecast status"
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
        "
        aria-hidden="true"
      >
        <SafeIcon
          size={22}
          strokeWidth={2}
          aria-hidden="true"
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

      {(hasPrimaryAction || hasSecondaryAction) && (
        <div
          className="
            flex flex-col sm:flex-row justify-center items-center
            w-full sm:w-auto
            mt-5
            gap-2.5
          "
        >
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
              aria-label={safeActionLabel}
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

          {hasSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
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

export default SavingsForecastEmptyState;
