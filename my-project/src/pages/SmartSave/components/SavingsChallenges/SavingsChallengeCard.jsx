
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  CHALLENGE_STATUS,
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_TYPES,
} from "../../../../constants/smartSaveConstants";

import {
  formatCurrency,
  formatDate,
} from "../../../../utils/smartSave/savingsFormatters";

import {
  calculateSavingsProgress,
} from "../../../../utils/smartSave/savingsProgress";


/* =========================================================
   SAFE HELPERS
========================================================= */

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value?._id || value?.id || "";
};


const getLabel = (collection, value, fallback) => {
  if (!value) return fallback;

  if (Array.isArray(collection)) {
    const match = collection.find(
      (item) =>
        (item?.value ?? item) === value
    );

    if (match) {
      return match?.label ?? match;
    }
  }

  if (
    collection &&
    typeof collection === "object" &&
    !Array.isArray(collection)
  ) {
    return (
      collection[value] ??
      fallback
    );
  }

  return fallback;
};


const capitalize = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );


/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: PlayCircle,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  paused: {
    label: "Paused",
    icon: PauseCircle,
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },

  failed: {
    label: "Failed",
    icon: XCircle,
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  expired: {
    label: "Expired",
    icon: Clock3,
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },

  draft: {
    label: "Draft",
    icon: Target,
    className:
      "bg-slate-50 text-slate-600 border-slate-200",
  },
};


/* =========================================================
   PROGRESS FALLBACK
========================================================= */

const resolveProgress = (challenge) => {
  const target =
    Number(
      challenge?.targetAmount ??
      challenge?.target ??
      challenge?.goalAmount ??
      0
    );

  const saved =
    Number(
      challenge?.currentAmount ??
      challenge?.savedAmount ??
      challenge?.amountSaved ??
      challenge?.progress?.currentAmount ??
      challenge?.progress?.savedAmount ??
      0
    );

  if (
    challenge?.progress &&
    typeof challenge.progress === "object"
  ) {
    const progress =
      challenge.progress;

    if (
      Number.isFinite(
        Number(progress.percentage)
      )
    ) {
      return {
        current: saved,
        target,
        percentage: Math.min(
          100,
          Math.max(
            0,
            Number(progress.percentage)
          )
        ),
      };
    }
  }

  try {
    const result =
      calculateSavingsProgress({
        currentAmount: saved,
        targetAmount: target,
      });

    if (
      result &&
      typeof result === "object"
    ) {
      return {
        current: saved,
        target,
        percentage: Math.min(
          100,
          Math.max(
            0,
            Number(
              result.percentage ??
              result.progress ??
              0
            )
          ),
        ),
      };
    }
  } catch {
    // Safe fallback below.
  }

  return {
    current: saved,
    target,
    percentage:
      target > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (saved / target) * 100
            )
          )
        : 0,
  };
};


/* =========================================================
   COMPONENT
========================================================= */

const SavingsChallengeCard = ({
  challenge,

  onClick,
  onView,
  onActivate,
  onPause,
  onResume,
//   onComplete,
//   onCancel,

  showActions = true,
  compact = false,
  currency = "NGN",

  className = "",
}) => {
  if (!challenge) {
    return null;
  }


  /* =======================================================
     NORMALIZED DATA
  ======================================================= */

  const challengeId =
    getId(challenge);

  const name =
    challenge?.name ||
    challenge?.title ||
    "Savings Challenge";

  const description =
    challenge?.description ||
    "";

  const status =
    String(
      challenge?.status ||
      "draft"
    ).toLowerCase();

  const challengeType =
    challenge?.challengeType ||
    challenge?.type ||
    "";

  const difficulty =
    challenge?.difficulty ||
    "";

  const progress =
    resolveProgress(challenge);

  const startDate =
    challenge?.startDate ||
    challenge?.period?.startDate;

  const endDate =
    challenge?.endDate ||
    challenge?.period?.endDate;

  const statusConfig =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.draft;

  const StatusIcon =
    statusConfig.icon;


  /* =======================================================
     LABELS
  ======================================================= */

  const typeLabel =
    getLabel(
      CHALLENGE_TYPES,
      challengeType,
      capitalize(challengeType)
    );

  const difficultyLabel =
    getLabel(
      CHALLENGE_DIFFICULTIES,
      difficulty,
      capitalize(difficulty)
    );


  /* =======================================================
     COMPLETION
  ======================================================= */

  const isCompleted =
    status === "completed" ||
    progress.percentage >= 100;

  const isActive =
    status === "active";

  const isPaused =
    status === "paused";


  /* =======================================================
     ACTION HANDLERS
  ======================================================= */

  const handleView =
    onView ||
    onClick;

  const handleCardClick = () => {
    handleView?.(challenge);
  };


  /* =======================================================
     KEYBOARD
  ======================================================= */

  const handleKeyDown = (event) => {
    if (
      !handleView ||
      (event.key !== "Enter" &&
        event.key !== " ")
    ) {
      return;
    }

    event.preventDefault();

    handleCardClick();
  };


  /* =======================================================
     ACTION BUTTON
  ======================================================= */

  const actionButton = (() => {
    if (isCompleted) {
      return null;
    }

    if (isActive && onPause) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onPause(challenge);
          }}
          className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 px-3 py-2 border border-amber-200 rounded-lg font-semibold text-amber-700 text-xs transition"
        >
          <PauseCircle size={15} />
          Pause
        </button>
      );
    }

    if (isPaused && onResume) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onResume(challenge);
          }}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg font-semibold text-white text-xs transition"
        >
          <PlayCircle size={15} />
          Resume
        </button>
      );
    }

    if (
      status === "draft" &&
      onActivate
    ) {
      return (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onActivate(challenge);
          }}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-lg font-semibold text-white text-xs transition"
        >
          <PlayCircle size={15} />
          Activate
        </button>
      );
    }

    return null;
  })();


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article
      className={`
        group
        rounded-2xl
        border border-slate-200
        bg-white
        p-4
        shadow-sm
        transition
        hover:border-slate-300
        hover:shadow-md
        ${
          handleView
            ? "cursor-pointer"
            : ""
        }
        ${className}
      `}
      onClick={
        handleView
          ? handleCardClick
          : undefined
      }
      onKeyDown={
        handleView
          ? handleKeyDown
          : undefined
      }
      tabIndex={
        handleView
          ? 0
          : undefined
      }
      role={
        handleView
          ? "button"
          : undefined
      }
      aria-label={
        handleView
          ? `View ${name}`
          : undefined
      }
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          flex justify-between items-start
          gap-3
        "
      >
        <div
          className="
            flex items-start
            min-w-0
            gap-3
          "
        >
          <div
            className="
              flex justify-center items-center
              w-11 h-11
              text-blue-600
              bg-blue-50
              rounded-xl
              shrink-0
            "
          >
            <Trophy
              size={21}
              aria-hidden="true"
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <h3
              className="
                font-semibold text-slate-900 text-sm truncate
              "
              title={name}
            >
              {name}
            </h3>

            {!compact && description && (
              <p
                className="
                  mt-1
                  text-slate-500 text-xs line-clamp-2 leading-5
                "
              >
                {description}
              </p>
            )}
          </div>
        </div>


        {showActions && (
          <button
            type="button"
            aria-label={`More actions for ${name}`}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="hover:bg-slate-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition shrink-0"
          >
            <MoreVertical
              size={18}
              aria-hidden="true"
            />
          </button>
        )}
      </div>


      {/* =================================================
          BADGES
      ================================================= */}

      <div
        className="
          flex flex-wrap items-center
          mt-4
          gap-2
        "
      >
        <span
          className={`
            inline-flex items-center gap-1.5
            rounded-full
            border
            px-2.5 py-1
            text-[11px] font-semibold
            ${statusConfig.className}
          `}
        >
          <StatusIcon
            size={13}
            aria-hidden="true"
          />

          {statusConfig.label}
        </span>

        {typeLabel && (
          <span
            className="
              px-2.5 py-1
              font-medium text-[11px] text-slate-600
              bg-slate-100
              rounded-full
            "
          >
            {typeLabel}
          </span>
        )}

        {difficultyLabel && (
          <span
            className="
              px-2.5 py-1
              font-medium text-[11px] text-slate-600
              bg-slate-100
              rounded-full
            "
          >
            {difficultyLabel}
          </span>
        )}
      </div>


      {/* =================================================
          PROGRESS
      ================================================= */}

      <div
        className="
          mt-5
        "
      >
        <div
          className="
            flex justify-between items-end
            gap-3
          "
        >
          <div>
            <p
              className="
                font-medium text-slate-500 text-xs
              "
            >
              Saved
            </p>

            <p
              className="
                mt-0.5
                font-bold text-slate-900 text-base
              "
            >
              {formatCurrency(
                progress.current,
                currency
              )}
            </p>
          </div>

          <div
            className="
              text-right
            "
          >
            <p
              className="
                font-medium text-slate-500 text-xs
              "
            >
              Target
            </p>

            <p
              className="
                mt-0.5
                font-semibold text-slate-700 text-sm
              "
            >
              {formatCurrency(
                progress.target,
                currency
              )}
            </p>
          </div>
        </div>


        <div
          className="
            overflow-hidden
            h-2
            mt-3
            bg-slate-100
            rounded-full
          "
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(
            progress.percentage
          )}
          aria-label={`${Math.round(
            progress.percentage
          )}% complete`}
        >
          <div
            className={`
              h-full
              rounded-full
              transition-all
              duration-500
              ${
                isCompleted
                  ? "bg-emerald-500"
                  : "bg-blue-600"
              }
            `}
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  progress.percentage
                )
              )}%`,
            }}
          />
        </div>

        <div
          className="
            flex justify-between
            mt-2
          "
        >
          <span
            className="
              font-medium text-[11px] text-slate-500
            "
          >
            {Math.round(
              progress.percentage
            )}% complete
          </span>

          {isCompleted && (
            <span
              className="
                font-semibold text-[11px] text-emerald-600
              "
            >
              Goal reached
            </span>
          )}
        </div>
      </div>


      {/* =================================================
          DATES
      ================================================= */}

      {!compact &&
        (startDate || endDate) && (
          <div
            className="
              flex justify-between items-center
              mt-4 pt-4
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
              <CalendarDays
                size={15}
                className="
                  text-slate-400
                "
                aria-hidden="true"
              /
              >

              <div>
                <p
                  className="
                    font-medium text-[10px] text-slate-400 uppercase
                    tracking-wide
                  "
                >
                  Duration
                </p>

                <p
                  className="
                    mt-0.5
                    font-medium text-slate-600 text-xs
                  "
                >
                  {startDate
                    ? formatDate(startDate)
                    : "—"}

                  {" – "}

                  {endDate
                    ? formatDate(endDate)
                    : "—"}
                </p>
              </div>
            </div>

            {handleView && (
              <ChevronRight
                size={18}
                className="
                  text-slate-300
                  transition
                  group-hover:text-slate-500 group-hover:translate-x-0.5
                  shrink-0
                "
                aria-hidden="true"
              /
              >
            )}
          </div>
        )}


      {/* =================================================
          ACTION
      ================================================= */}

      {showActions &&
        actionButton && (
          <div
            className="
              flex justify-end
              mt-4 pt-4
              border-slate-100 border-t
            "
          >
            {actionButton}
          </div>
        )}
    </article>
  );
};


export default SavingsChallengeCard;