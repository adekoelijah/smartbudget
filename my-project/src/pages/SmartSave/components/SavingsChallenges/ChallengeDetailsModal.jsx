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
   CONSTANTS
========================================================= */

const ACTIONS = Object.freeze({
  ACTIVATE: "activate",
  PAUSE: "pause",
  RESUME: "resume",
  COMPLETE: "complete",
  CANCEL: "cancel",
});

const ACTION_LABELS = Object.freeze({
  [ACTIONS.ACTIVATE]: "Activate",
  [ACTIONS.PAUSE]: "Pause",
  [ACTIONS.RESUME]: "Resume",
  [ACTIONS.COMPLETE]: "Complete",
  [ACTIONS.CANCEL]: "Cancel",
});

const DEFAULT_STATUS = "unknown";

/* =========================================================
   HELPERS
========================================================= */

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    return normalized || null;
  }

  return (
    value.id ??
    value._id ??
    value.challengeId ??
    null
  );
};

const toNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const clamp = (
  value,
  min = 0,
  max = 100
) => {
  return Math.min(
    Math.max(
      toNumber(value, min),
      min
    ),
    max
  );
};

const getChallengeStatus = (
  challenge
) => {
  return (
    challenge?.status ??
    challenge?.state ??
    DEFAULT_STATUS
  );
};

const getStatusLabel = (
  status
) => {
  if (
    status &&
    CHALLENGE_STATUS_LABELS?.[status]
  ) {
    return CHALLENGE_STATUS_LABELS[
      status
    ];
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

const getStatusConfig = (
  status
) => {
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

const getErrorMessage = (
  error,
  fallback
) => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error.message ||
    fallback
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ChallengeDetailsModal = ({
  challenge,
  isOpen,
  onClose,
  onUpdated,
  showLifecycleActions = true,
}) => {
  /* =======================================================
     IDENTIFIER
  ======================================================= */

  const challengeId = getId(
    challenge
  );

  /* =======================================================
     CHALLENGE HOOK
  ======================================================= */

  /*
   * IMPORTANT:
   *
   * The modal must not automatically fetch the complete
   * challenge collection.
   *
   * The parent/page owns collection fetching.
   *
   * The modal only requests the selected challenge snapshot
   * and performs lifecycle mutations.
   */
  const {
    snapshot,
    loadingSnapshot,
    mutationError,

    fetchSnapshot,

    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,

    clearError,
  } = useSavingsChallenges({
    autoFetch: false,
  });

  /* =======================================================
     LOCAL STATE
  ======================================================= */

  const [selectedAction, setSelectedAction] =
    useState(null);

  const [actionError, setActionError] =
    useState(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =======================================================
     EFFECT: RESET WHEN CLOSED
  ======================================================= */

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setSelectedAction(null);
    setActionError(null);
    setIsSubmitting(false);
  }, [isOpen]);

  /* =======================================================
     EFFECT: BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  /* =======================================================
     EFFECT: ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key !== "Escape" ||
        isSubmitting
      ) {
        return;
      }

      onClose?.();
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isOpen,
    isSubmitting,
    onClose,
  ]);

  /* =======================================================
     EFFECT: LOAD SNAPSHOT
  ======================================================= */

  useEffect(() => {
    if (
      !isOpen ||
      !challengeId
    ) {
      return undefined;
    }

    let cancelled = false;

    const loadSnapshot = async () => {
      clearError();
      setActionError(null);

      try {
        await fetchSnapshot(
          challengeId
        );
      } catch (requestError) {
        /*
         * The hook owns the normalized error state.
         *
         * We only create a local modal-level message if
         * the request is still relevant.
         */
        if (!cancelled) {
          setActionError(
            getErrorMessage(
              requestError,
              "Unable to load challenge progress."
            )
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
    fetchSnapshot,
    clearError,
  ]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const status = useMemo(
    () =>
      getChallengeStatus(
        challenge
      ),
    [challenge]
  );

  const statusConfig = useMemo(
    () =>
      getStatusConfig(status),
    [status]
  );

  const StatusIcon =
    statusConfig.icon;

  const currentSnapshot =
    snapshot ??
    challenge?.snapshot ??
    {};

  const currentAmount =
    toNumber(
      currentSnapshot?.currentAmount ??
        currentSnapshot?.savedAmount ??
        challenge?.currentAmount ??
        challenge?.progress
          ?.currentAmount,
      0
    );

  const targetAmount =
    toNumber(
      currentSnapshot?.targetAmount ??
        challenge?.targetAmount ??
        challenge?.goalAmount,
      0
    );

  const calculatedProgress =
    useMemo(() => {
      if (targetAmount <= 0) {
        return 0;
      }

      return clamp(
        (currentAmount /
          targetAmount) *
          100
      );
    }, [
      currentAmount,
      targetAmount,
    ]);

  const progressPercentage =
    clamp(
      currentSnapshot?.progressPercentage ??
        currentSnapshot?.percentage ??
        challenge?.progress
          ?.percentage ??
        calculatedProgress
    );

  const remainingAmount =
    Math.max(
      targetAmount -
        currentAmount,
      0
    );

  const startDate =
    challenge?.startDate ??
    challenge?.startsAt ??
    null;

  const endDate =
    challenge?.endDate ??
    challenge?.endsAt ??
    null;

  /* =======================================================
     LIFECYCLE PERMISSIONS
  ======================================================= */

  const draftStatus =
    CHALLENGE_STATUS?.DRAFT ??
    "draft";

  const activeStatus =
    CHALLENGE_STATUS?.ACTIVE ??
    "active";

  const pausedStatus =
    CHALLENGE_STATUS?.PAUSED ??
    "paused";

  const canActivate =
    status === draftStatus ||
    status === pausedStatus;

  const canPause =
    status === activeStatus;

  const canResume =
    status === pausedStatus;

  const canComplete =
    status === activeStatus;

  const canCancel =
    [
      draftStatus,
      activeStatus,
      pausedStatus,
    ].includes(status);

  /* =======================================================
     ACTION MAP
  ======================================================= */

  const actionHandlers = useMemo(
    () => ({
      [ACTIONS.ACTIVATE]:
        activateChallenge,

      [ACTIONS.PAUSE]:
        pauseChallenge,

      [ACTIONS.RESUME]:
        resumeChallenge,

      [ACTIONS.COMPLETE]:
        completeChallenge,

      [ACTIONS.CANCEL]:
        cancelChallenge,
    }),
    [
      activateChallenge,
      pauseChallenge,
      resumeChallenge,
      completeChallenge,
      cancelChallenge,
    ]
  );

  /* =======================================================
     EXECUTE ACTION
  ======================================================= */

  const executeAction =
    useCallback(
      async (actionName) => {
        if (
          !challengeId ||
          isSubmitting
        ) {
          return;
        }

        const handler =
          actionHandlers[
            actionName
          ];

        if (
          typeof handler !==
          "function"
        ) {
          setActionError(
            `The ${actionName} challenge action is unavailable.`
          );

          return;
        }

        setIsSubmitting(true);
        setActionError(null);

        try {
          /*
           * The hook's executeMutation()
           * handles the appropriate SmartSave
           * refresh operations.
           */
          await handler(
            challengeId
          );

          /*
           * The lifecycle mutation refreshes
           * the hook's snapshot when configured
           * to do so.
           *
           * Notify the parent so it can refresh
           * its collection if necessary.
           */
          if (
            typeof onUpdated ===
            "function"
          ) {
            await onUpdated();
          }

          setSelectedAction(null);
        } catch (requestError) {
          setActionError(
            getErrorMessage(
              requestError,
              `Unable to ${actionName} this challenge.`
            )
          );
        } finally {
          setIsSubmitting(false);
        }
      },
      [
        challengeId,
        isSubmitting,
        actionHandlers,
        onUpdated,
      ]
    );

  /* =======================================================
     BACKDROP
  ======================================================= */

  const handleBackdropMouseDown =
    useCallback(
      (event) => {
        if (
          isSubmitting ||
          event.target !==
            event.currentTarget
        ) {
          return;
        }

        onClose?.();
      },
      [
        isSubmitting,
        onClose,
      ]
    );

  /* =======================================================
     EARLY RETURN
  ======================================================= */

  if (
    !isOpen ||
    !challenge
  ) {
    return null;
  }

  /* =======================================================
     ERROR MESSAGE
  ======================================================= */

  const visibleError =
    actionError ||
    mutationError;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        z-50 fixed inset-0 flex justify-center items-end sm:items-center
        p-0 sm:p-4
        bg-slate-950/50
        backdrop-blur-sm
      "
      role="presentation"
      onMouseDown={
        handleBackdropMouseDown
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-details-title"
        aria-describedby={
          challenge?.description
            ? "challenge-details-description"
            : undefined
        }
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

                {getStatusLabel(
                  status
                )}
              </span>
            </div>

            <h2
              id="challenge-details-title"
              className="
                font-bold text-slate-900 text-lg sm:text-xl tracking-tight
              "
            >
              {challenge?.name ??
                challenge?.title ??
                "Savings Challenge"}
            </h2>

            {challenge?.description && (
              <p
                id="challenge-details-description"
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

          {visibleError && (
            <div
              role="alert"
              className="
                mb-5 px-4 py-3
                text-red-700 text-sm
                bg-red-50
                border border-red-200 rounded-2xl
              "
            >
              {getErrorMessage(
                visibleError,
                "Unable to load challenge information."
              )}
            </div>
          )}

          {/* =================================================
              PROGRESS
          ================================================= */}

          <section
            aria-label="Challenge progress"
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
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  Math.round(
                    progressPercentage
                  )
                }
                aria-label="Savings challenge progress"
              >
                <div
                  className="
                    h-full
                    bg-slate-900
                    rounded-full
                    transition-all duration-500
                  "
                  style={{
                    width: `${progressPercentage}%`,
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
                    progressPercentage
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
          </section>

          {/* =================================================
              METRICS
          ================================================= */}

          <section
            aria-label="Challenge metrics"
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
                challenge
                  ?.successfulPeriods ??
                0
              }
            />
          </section>

          {/* =================================================
              DATES
          ================================================= */}

          {(startDate ||
            endDate) && (
            <section
              aria-label="Challenge dates"
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
            </section>
          )}

          {/* =================================================
              SNAPSHOT LOADING
          ================================================= */}

          {loadingSnapshot && (
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
            FOOTER
        ================================================= */}

        {showLifecycleActions && (
          <footer
            className="
              px-5 sm:px-6 py-4
              bg-white
              border-slate-100 border-t
            "
          >
            {selectedAction ? (
              <ActionConfirmation
                action={
                  selectedAction
                }
                actionLabel={
                  ACTION_LABELS[
                    selectedAction
                  ]
                }
                isSubmitting={
                  isSubmitting
                }
                onCancel={() =>
                  setSelectedAction(
                    null
                  )
                }
                onConfirm={() =>
                  executeAction(
                    selectedAction
                  )
                }
              />
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
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      setSelectedAction(
                        ACTIONS.ACTIVATE
                      )
                    }
                  />
                )}

                {canPause && (
                  <ActionButton
                    label="Pause"
                    icon={Pause}
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      setSelectedAction(
                        ACTIONS.PAUSE
                      )
                    }
                  />
                )}

                {canResume && (
                  <ActionButton
                    label="Resume"
                    icon={Play}
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      setSelectedAction(
                        ACTIONS.RESUME
                      )
                    }
                  />
                )}

                {canComplete && (
                  <ActionButton
                    label="Complete"
                    icon={
                      CheckCircle2
                    }
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      setSelectedAction(
                        ACTIONS.COMPLETE
                      )
                    }
                  />
                )}

                {canCancel && (
                  <ActionButton
                    label="Cancel"
                    icon={XCircle}
                    danger
                    disabled={
                      isSubmitting
                    }
                    onClick={() =>
                      setSelectedAction(
                        ACTIONS.CANCEL
                      )
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
   ACTION CONFIRMATION
========================================================= */

const ActionConfirmation =
  memo(
    ({
      action,
      actionLabel,
      isSubmitting,
      onCancel,
      onConfirm,
    }) => {
      return (
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
              onClick={onCancel}
              disabled={isSubmitting}
              className="
                px-4 py-2.5
                font-semibold text-slate-700 text-sm
                bg-white hover:bg-slate-100
                border border-slate-200 rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-400
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Go back
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="
                px-4 py-2.5
                font-semibold text-white text-sm
                bg-slate-900 hover:bg-slate-800
                rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {isSubmitting
                ? "Updating…"
                : actionLabel}
            </button>
          </div>
        </div>
      );
    }
  );

/* =========================================================
   METRIC
========================================================= */

const Metric = memo(
  ({
    icon: Icon,
    label,
    value,
  }) => {
    return (
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
    );
  }
);

/* =========================================================
   INFO ROW
========================================================= */

const InfoRow = memo(
  ({
    icon: Icon,
    label,
    value,
  }) => {
    return (
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
    );
  }
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
    disabled = false,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
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
          disabled:cursor-not-allowed
          disabled:opacity-50

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
    );
  }
);

/* =========================================================
   EXPORT
========================================================= */

export default memo(
  ChallengeDetailsModal
);