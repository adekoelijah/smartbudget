// :::writing{variant="document" id="73142" title="ChallengeDetailsModal.jsx"}
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Flame,
  Pause,
  Play,
  Target,
  Trophy,
  X,
  XCircle,
} from "lucide-react";

import useSavingsChallenges from "../../../../hooks/useSavingsChallenges";

import {
  CHALLENGE_STATUS,
  CHALLENGE_STATUS_LABELS,
} from "../../../../constants/smartSaveConstants";

import {
  formatCurrency,
  formatDate,
} from "../../../../utils/smartSave/savingsFormatters";

/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value.trim() || null;
  }

  return (
    value.id ||
    value._id ||
    value.challengeId ||
    null
  );
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

const getStatusLabel = (status) => {
  if (
    status &&
    CHALLENGE_STATUS_LABELS?.[status]
  ) {
    return CHALLENGE_STATUS_LABELS[status];
  }

  if (!status) {
    return "Unknown";
  }

  return String(status)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const getChallengeStatus = (challenge) =>
  challenge?.status ||
  challenge?.state ||
  "unknown";

/* =========================================================
   STATUS CONFIG
========================================================= */

const getStatusConfig = (status) => {
  switch (status) {
    case CHALLENGE_STATUS?.ACTIVE:
    case "active":
      return {
        icon: Play,
        wrapper:
          "border-emerald-200 bg-emerald-50",
        badge:
          "bg-emerald-100 text-emerald-700",
        iconClass:
          "text-emerald-600",
      };

    case CHALLENGE_STATUS?.PAUSED:
    case "paused":
      return {
        icon: Pause,
        wrapper:
          "border-amber-200 bg-amber-50",
        badge:
          "bg-amber-100 text-amber-700",
        iconClass:
          "text-amber-600",
      };

    case CHALLENGE_STATUS?.COMPLETED:
    case "completed":
      return {
        icon: Trophy,
        wrapper:
          "border-blue-200 bg-blue-50",
        badge:
          "bg-blue-100 text-blue-700",
        iconClass:
          "text-blue-600",
      };

    case CHALLENGE_STATUS?.CANCELLED:
    case "cancelled":
      return {
        icon: XCircle,
        wrapper:
          "border-slate-200 bg-slate-50",
        badge:
          "bg-slate-100 text-slate-600",
        iconClass:
          "text-slate-500",
      };

    case CHALLENGE_STATUS?.FAILED:
    case "failed":
      return {
        icon: AlertTriangle,
        wrapper:
          "border-red-200 bg-red-50",
        badge:
          "bg-red-100 text-red-700",
        iconClass:
          "text-red-600",
      };

    case CHALLENGE_STATUS?.EXPIRED:
    case "expired":
      return {
        icon: Clock3,
        wrapper:
          "border-slate-200 bg-slate-50",
        badge:
          "bg-slate-100 text-slate-600",
        iconClass:
          "text-slate-500",
      };

    default:
      return {
        icon: Target,
        wrapper:
          "border-slate-200 bg-slate-50",
        badge:
          "bg-slate-100 text-slate-600",
        iconClass:
          "text-slate-500",
      };
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const ChallengeDetailsModal = ({
  challenge,
  isOpen,
  onClose,
  onUpdated,

  /*
   * Optional custom actions.
   */
  showLifecycleActions = true,
}) => {
  const challengeId = useMemo(
    () => getId(challenge),
    [challenge]
  );

  /* =======================================================
     CHALLENGE HOOK
  ======================================================= */

  const {
    snapshot,
    loading,
    error,

    /*
     * Lifecycle operations are intentionally consumed
     * from the hook rather than calling the service directly.
     */
    getChallengeSnapshot,

    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,

    refreshChallenges,
  } = useSavingsChallenges();

  /* =======================================================
     LOCAL UI STATE
  ======================================================= */

  const [action, setAction] =
    useState(null);

  const [actionError, setActionError] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =======================================================
     RESET MODAL STATE
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      setAction(null);
      setActionError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  /* =======================================================
     LOAD SNAPSHOT
  ======================================================= */

  useEffect(() => {
    if (
      !isOpen ||
      !challengeId ||
      typeof getChallengeSnapshot !==
        "function"
    ) {
      return undefined;
    }

    /*
     * Async work begins inside an effect rather than
     * synchronously during render.
     */
    let cancelled = false;

    const loadSnapshot = async () => {
      try {
        await getChallengeSnapshot(
          challengeId
        );
      } catch (requestError) {
        if (!cancelled) {
          setActionError(
            requestError?.message ||
              "Unable to load challenge progress."
          );
        }
      }
    };

    loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    challengeId,
    getChallengeSnapshot,
  ]);

  /* =======================================================
     DERIVED CHALLENGE DATA
  ======================================================= */

  const status = useMemo(
    () => getChallengeStatus(challenge),
    [challenge]
  );

  const statusConfig = useMemo(
    () => getStatusConfig(status),
    [status]
  );

  const StatusIcon = statusConfig.icon;

  const currentSnapshot =
    snapshot ||
    challenge?.snapshot ||
    {};

  const currentAmount = toNumber(
    currentSnapshot?.currentAmount ??
      currentSnapshot?.savedAmount ??
      challenge?.currentAmount ??
      challenge?.progress?.currentAmount
  );

  const targetAmount = toNumber(
    currentSnapshot?.targetAmount ??
      challenge?.targetAmount ??
      challenge?.goalAmount
  );

  const calculatedProgress = useMemo(() => {
    if (targetAmount <= 0) {
      return 0;
    }

    return clamp(
      (currentAmount / targetAmount) * 100,
      0,
      100
    );
  }, [
    currentAmount,
    targetAmount,
  ]);

  const progressPercentage = toNumber(
    currentSnapshot?.progressPercentage ??
      currentSnapshot?.percentage ??
      challenge?.progress?.percentage,
    calculatedProgress
  );

  const remainingAmount = Math.max(
    targetAmount - currentAmount,
    0
  );

  const startDate =
    challenge?.startDate ||
    challenge?.startsAt;

  const endDate =
    challenge?.endDate ||
    challenge?.endsAt;

  /* =======================================================
     LIFECYCLE PERMISSIONS
  ======================================================= */

  const canActivate =
    status ===
      (CHALLENGE_STATUS?.DRAFT || "draft") ||
    status === "paused";

  const canPause =
    status ===
    (CHALLENGE_STATUS?.ACTIVE || "active");

  const canResume =
    status ===
    (CHALLENGE_STATUS?.PAUSED || "paused");

  const canComplete =
    status ===
    (CHALLENGE_STATUS?.ACTIVE || "active");

  const canCancel =
    [
      "draft",
      "active",
      "paused",
    ].includes(status);

  /* =======================================================
     ACTION EXECUTION
  ======================================================= */

  const executeAction = useCallback(
    async (actionName) => {
      if (
        !challengeId ||
        isSubmitting
      ) {
        return;
      }

      const actionMap = {
        activate: activateChallenge,
        pause: pauseChallenge,
        resume: resumeChallenge,
        complete: completeChallenge,
        cancel: cancelChallenge,
      };

      const handler =
        actionMap[actionName];

      if (typeof handler !== "function") {
        setActionError(
          `The ${actionName} challenge action is unavailable.`
        );
        return;
      }

      setIsSubmitting(true);
      setActionError(null);

      try {
        await handler(challengeId);

        /*
         * Refresh through the hook/service abstraction.
         */
        if (
          typeof refreshChallenges ===
          "function"
        ) {
          await refreshChallenges();
        }

        if (
          typeof onUpdated === "function"
        ) {
          await onUpdated();
        }

        setAction(null);
      } catch (requestError) {
        setActionError(
          requestError?.message ||
            `Unable to ${actionName} this challenge.`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      challengeId,
      isSubmitting,
      activateChallenge,
      pauseChallenge,
      resumeChallenge,
      completeChallenge,
      cancelChallenge,
      refreshChallenges,
      onUpdated,
    ]
  );

  /* =======================================================
     ACTION LABEL
  ======================================================= */

  const actionLabel = useMemo(() => {
    switch (action) {
      case "activate":
        return "Activate";

      case "pause":
        return "Pause";

      case "resume":
        return "Resume";

      case "complete":
        return "Complete";

      case "cancel":
        return "Cancel";

      default:
        return null;
    }
  }, [action]);

  /* =======================================================
     MODAL VISIBILITY
  ======================================================= */

  if (!isOpen || !challenge) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */


  const handleBackdropMouseDown = (event) => {
  if (isSubmitting) {
    return;
  }

  if (event.target !== event.currentTarget) {
    return;
  }

  onClose?.();
};

  return (
    <div
      className="
        z-50 fixed inset-0 flex justify-center items-end sm:items-center
        p-0 sm:p-4
        bg-slate-950/50
        backdrop-blur-sm
      "
      role="presentation"
  onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-details-title"
        className="
          flex flex-col overflow-hidden
          w-full max-h-[92vh] sm:max-w-2xl
          bg-white
          rounded-t-3xl sm:rounded-3xl
          shadow-2xl
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            flex justify-between items-start
            px-5 sm:px-6 py-4
            border-slate-100 border-b
            gap-4
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
                mb-2
                gap-2
              "
            >
              <span
                className={`
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5 py-1
                  text-xs
                  font-semibold
                  ${statusConfig.badge}
                `}
              >
                <StatusIcon
                  size={13}
                  aria-hidden="true"
                />

                {getStatusLabel(status)}
              </span>
            </div>

            <h2
              id="challenge-details-title"
              className="
                font-bold text-slate-900 text-lg sm:text-xl tracking-tight
              "
            >
              {challenge?.name ||
                challenge?.title ||
                "Savings Challenge"}
            </h2>

            {challenge?.description && (
              <p
                className="
                  mt-1
                  text-slate-500 text-sm leading-5
                "
              >
                {challenge.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close challenge details"
            className="
              inline-flex justify-center items-center
              w-10 h-10
              text-slate-500 hover:text-slate-700
              hover:bg-slate-100
              rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
            "
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            flex-1 overflow-y-auto
            min-h-0
            px-5 sm:px-6 py-5
          "
        >
          {/* =================================================
              ERROR
          ================================================= */}

          {(error || actionError) && (
            <div
              role="alert"
              className="
                mb-5 px-4 py-3
                text-red-700 text-sm
                bg-red-50
                border border-red-200 rounded-2xl
              "
            >
              {actionError ||
                error?.message ||
                error ||
                "Unable to load challenge information."}
            </div>
          )}

          {/* =================================================
              PROGRESS
          ================================================= */}

          <div
            className="
              p-4
              bg-slate-50
              border border-slate-200 rounded-2xl
            "
          >
            <div
              className="
                flex justify-between items-start
                gap-4
              "
            >
              <div>
                <p
                  className="
                    font-medium text-slate-500 text-xs uppercase tracking-wide
                  "
                >
                  Progress
                </p>

                <p
                  className="
                    mt-1
                    font-bold text-slate-900 text-2xl tracking-tight
                  "
                >
                  {formatCurrency(
                    currentAmount
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
                    text-slate-500 text-xs
                  "
                >
                  Target
                </p>

                <p
                  className="
                    mt-1
                    font-semibold text-slate-800
                  "
                >
                  {formatCurrency(
                    targetAmount
                  )}
                </p>
              </div>
            </div>

            <div
              className="
                mt-4
              "
            >
              <div
                className="
                  overflow-hidden
                  h-2.5
                  bg-slate-200
                  rounded-full
                "
              >
                <div
                  className="
                    h-full
                    bg-slate-900
                    rounded-full
                    transition-all duration-500
                  "
                  style={{
                    width: `${clamp(
                      progressPercentage,
                      0,
                      100
                    )}%`,
                  }}
                /
                >
              </div>

              <div
                className="
                  flex justify-between items-center
                  mt-2
                  text-slate-500 text-xs
                "
              >
                <span>
                  {Math.round(
                    clamp(
                      progressPercentage,
                      0,
                      100
                    )
                  )}
                  % complete
                </span>

                <span>
                  {formatCurrency(
                    remainingAmount
                  )}{" "}
                  remaining
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              METRICS
          ================================================= */}

          <div
            className="
              grid grid-cols-2 sm:grid-cols-4
              mt-4
              gap-3
            "
          >
            <Metric
              icon={Coins}
              label="Saved"
              value={formatCurrency(
                currentAmount
              )}
            />

            <Metric
              icon={Target}
              label="Target"
              value={formatCurrency(
                targetAmount
              )}
            />

            <Metric
              icon={Flame}
              label="Streak"
              value={
                currentSnapshot?.streak ??
                challenge?.streak ??
                0
              }
            />

            <Metric
              icon={CalendarDays}
              label="Periods"
              value={
                currentSnapshot
                  ?.successfulPeriods ??
                challenge?.successfulPeriods ??
                0
              }
            />
          </div>

          {/* =================================================
              DATES
          ================================================= */}

          {(startDate || endDate) && (
            <div
              className="
                grid grid-cols-1 sm:grid-cols-2
                mt-5
                gap-3
              "
            >
              {startDate && (
                <InfoRow
                  icon={CalendarDays}
                  label="Start date"
                  value={formatDate(
                    startDate
                  )}
                />
              )}

              {endDate && (
                <InfoRow
                  icon={CalendarDays}
                  label="End date"
                  value={formatDate(
                    endDate
                  )}
                />
              )}
            </div>
          )}

          {/* =================================================
              LOADING SNAPSHOT
          ================================================= */}

          {loading && (
            <div
              className="
                flex items-center
                mt-4
                text-slate-500 text-xs
                gap-2
              "
              role="status"
              aria-live="polite"
            >
              <span
                className="
                  w-3.5 h-3.5
                  border-2 border-slate-300 border-t-slate-700 rounded-full
                  animate-spin
                "
                aria-hidden="true"
              /
              >

              Updating challenge progress…
            </div>
          )}
        </div>

        {/* =================================================
            ACTION FOOTER
        ================================================= */}

        {showLifecycleActions && (
          <footer
            className="
              px-5 sm:px-6 py-4
              bg-white
              border-slate-100 border-t
            "
          >
            {action ? (
              <div
                className="
                  p-4
                  bg-slate-50
                  border border-slate-200 rounded-2xl
                "
              >
                <p
                  className="
                    font-semibold text-slate-900 text-sm
                  "
                >
                  {actionLabel} this challenge?
                </p>

                <p
                  className="
                    mt-1
                    text-slate-500 text-xs leading-5
                  "
                >
                  This action will update the
                  challenge lifecycle state.
                </p>

                <div
                  className="
                    flex flex-col-reverse sm:flex-row sm:justify-end
                    mt-4
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setAction(null)
                    }
                    disabled={isSubmitting}
                    className="bg-white hover:bg-slate-100 disabled:opacity-50 px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm"
                  >
                    Go back
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      executeAction(action)
                    }
                    disabled={isSubmitting}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-semibold text-white text-sm transition disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Updating…"
                      : actionLabel}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="
                  flex flex-wrap
                  gap-2
                "
              >
                {canActivate && (
                  <ActionButton
                    label="Activate"
                    icon={Play}
                    onClick={() =>
                      setAction(
                        "activate"
                      )
                    }
                  />
                )}

                {canPause && (
                  <ActionButton
                    label="Pause"
                    icon={Pause}
                    onClick={() =>
                      setAction("pause")
                    }
                  />
                )}

                {canResume && (
                  <ActionButton
                    label="Resume"
                    icon={Play}
                    onClick={() =>
                      setAction("resume")
                    }
                  />
                )}

                {canComplete && (
                  <ActionButton
                    label="Complete"
                    icon={CheckCircle2}
                    onClick={() =>
                      setAction(
                        "complete"
                      )
                  }
                  />
                )}

                {canCancel && (
                  <ActionButton
                    label="Cancel"
                    icon={XCircle}
                    danger
                    onClick={() =>
                      setAction("cancel")
                    }
                  />
                )}
              </div>
            )}
          </footer>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   METRIC
========================================================= */

const Metric = memo(
  ({
    icon: Icon,
    label,
    value,
  }) => (
    <div
      className="
        p-3
        bg-white
        border border-slate-200 rounded-2xl
      "
    >
      <Icon
        size={17}
        className="
          text-slate-500
        "
        aria-hidden="true"
      /
      >

      <p
        className="
          mt-2
          font-medium text-[11px] text-slate-400 uppercase tracking-wide
        "
      >
        {label}
      </p>

      <p
        className="
          mt-0.5
          font-bold text-slate-900 text-sm truncate
        "
      >
        {value}
      </p>
    </div>
  )
);

/* =========================================================
   INFO ROW
========================================================= */

const InfoRow = memo(
  ({
    icon: Icon,
    label,
    value,
  }) => (
    <div
      className="
        flex items-center
        px-4 py-3
        bg-white
        border border-slate-200 rounded-2xl
        gap-3
      "
    >
      <Icon
        size={18}
        className="
          text-slate-500
          shrink-0
        "
        aria-hidden="true"
      /
      >

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            text-slate-400 text-xs
          "
        >
          {label}
        </p>

        <p
          className="
            font-semibold text-slate-800 text-sm truncate
          "
        >
          {value}
        </p>
      </div>
    </div>
  )
);

/* =========================================================
   ACTION BUTTON
========================================================= */

const ActionButton = memo(
  ({
    label,
    icon: Icon,
    onClick,
    danger = false,
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        min-h-10
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4 py-2.5
        text-sm
        font-semibold
        transition
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        ${
          danger
            ? `
              border border-red-200
              bg-red-50
              text-red-700
              hover:bg-red-100
              focus:ring-red-400
            `
            : `
              bg-slate-900
              text-white
              hover:bg-slate-800
              focus:ring-slate-500
            `
        }
      `}
    >
      <Icon
        size={16}
        aria-hidden="true"
      />

      {label}
    </button>
  )
);

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  ChallengeDetailsModal
);
