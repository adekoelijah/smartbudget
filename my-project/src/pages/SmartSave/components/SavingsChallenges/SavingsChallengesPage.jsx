// pages/.../SavingsChallengesPage.jsx

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  RefreshCw,
  Target,
  Trophy,
  X,
} from "lucide-react";

import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import SavingsChallengeCard from "./SavingsChallengeCard";
import ChallengeEmptyState from "./ChallengeEmptyState";
import ChallengeDetailsModal from "./ChallengeDetailsModal";
import CreateChallengeModal from "./CreateChallengeModal";

import SavingsSkeleton from "../shared/SavingsSkeleton";
import SavingsErrorState from "../shared/SavingsErrorState";

import useSavingsChallenges from "../../../../hooks/useSavingsChallenges";

import {
  CHALLENGE_STATUS,
} from "../../../../constants/smartSaveConstants";

import {
  normalizeSavingsChallenge,
} from "../../../../utils/smartSave/savingsNormalizers";

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_TITLE = "Savings Challenges";

const DEFAULT_DESCRIPTION =
  "Build consistent saving habits by completing structured challenges.";

const DEFAULT_ERROR =
  "We couldn't load your savings challenges.";

const DEFAULT_SKELETON_COUNT = 3;

const COMPACT_SKELETON_COUNT = 2;

const MAX_SAFE_LIMIT = 100;

const STATUS = {
  ACTIVE: String(
    CHALLENGE_STATUS?.ACTIVE ?? "active"
  ).toLowerCase(),

  PAUSED: String(
    CHALLENGE_STATUS?.PAUSED ?? "paused"
  ).toLowerCase(),

  COMPLETED: String(
    CHALLENGE_STATUS?.COMPLETED ?? "completed"
  ).toLowerCase(),

  CANCELLED: String(
    CHALLENGE_STATUS?.CANCELLED ?? "cancelled"
  ).toLowerCase(),

  DRAFT: String(
    CHALLENGE_STATUS?.DRAFT ?? "draft"
  ).toLowerCase(),
};

/* =========================================================
   SAFE HELPERS
========================================================= */

const getEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  if (
    typeof entity === "string" ||
    typeof entity === "number"
  ) {
    return String(entity);
  }

  const id =
    entity?._id ??
    entity?.id ??
    entity?.challengeId ??
    null;

  return id !== null &&
    id !== undefined &&
    id !== ""
    ? String(id)
    : null;
};

const resolveCollection = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.data?.challenges)) {
    return value.data.challenges;
  }

  if (Array.isArray(value?.challenges)) {
    return value.challenges;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    return (
      error.trim() ||
      DEFAULT_ERROR
    );
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.data?.error ??
    error?.message ??
    error?.error;

  return typeof message === "string" &&
    message.trim()
    ? message.trim()
    : DEFAULT_ERROR;
};

const normalizeStatus = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getChallengeStatus = (challenge) =>
  normalizeStatus(
    challenge?.status ??
      challenge?.state ??
      STATUS.DRAFT
  );

const isActive = (challenge) =>
  getChallengeStatus(challenge) ===
  STATUS.ACTIVE;

const isPaused = (challenge) =>
  getChallengeStatus(challenge) ===
  STATUS.PAUSED;

const isCompleted = (challenge) =>
  getChallengeStatus(challenge) ===
  STATUS.COMPLETED;

const getChallengeKey = (
  challenge,
  index
) => {
  const id = getEntityId(challenge);

  if (id) {
    return `challenge-${id}`;
  }

  return `challenge-${index}`;
};

const sanitizeLimit = (value) => {
  const numeric = Number(value);

  if (
    !Number.isFinite(numeric) ||
    numeric <= 0
  ) {
    return null;
  }

  return Math.min(
    Math.floor(numeric),
    MAX_SAFE_LIMIT
  );
};

/* =========================================================
   PAGE HEADER
========================================================= */

const SectionHeader = memo(
  ({
    title,
    description,
    count,
    onCreate,
    onRefresh,
    canCreate,
    canRefresh,
    refreshing,
  }) => {
    return (
      <header
        className="
          flex flex-col lg:flex-row lg:justify-between lg:items-start
          gap-5
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex items-start
              gap-3
            "
          >
            <div
              className="
                flex justify-center items-center
                w-11 h-11
                text-blue-700
                bg-blue-50
                border border-blue-100 rounded-2xl
                shrink-0
              "
              aria-hidden="true"
            >
              <Target
                size={20}
                strokeWidth={1.8}
              />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <div
                className="
                  flex flex-wrap items-center
                  gap-2
                "
              >
                <h1
                  id="savings-challenges-title"
                  className="
                    font-bold text-slate-950 text-2xl sm:text-3xl tracking-tight
                  "
                >
                  {title}
                </h1>

                <span
                  className="
                    inline-flex justify-center items-center
                    min-h-6
                    px-2.5
                    font-semibold text-slate-600 text-xs
                    bg-slate-100
                    border border-slate-200 rounded-full
                  "
                >
                  {count}
                </span>
              </div>

              {description ? (
                <p
                  className="
                    max-w-2xl
                    mt-1.5
                    text-slate-500 text-sm leading-6
                  "
                >
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="
            flex items-center
            w-full lg:w-auto
            gap-2
          "
        >
          {canRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="
                inline-flex justify-center items-center
                min-h-11
                px-4
                font-medium text-slate-700 text-sm
                bg-white hover:bg-slate-50 disabled:bg-slate-50
                border border-slate-200 hover:border-slate-300 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-slate-400/30
                disabled:opacity-60 shadow-sm transition
                disabled:cursor-not-allowed
                gap-2
              "
              aria-label={
                refreshing
                  ? "Refreshing challenges"
                  : "Refresh challenges"
              }
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : undefined
                }
              />

              <span
                className="
                  hidden sm:inline
                "
              >
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>
          ) : null}

          {canCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="
                inline-flex flex-1 lg:flex-none justify-center items-center
                min-h-11
                px-4
                font-semibold text-white text-sm
                bg-slate-950 hover:bg-slate-800
                rounded-xl focus:outline-none
                focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                shadow-sm transition
                gap-2
              "
            >
              <Plus size={17} />

              New challenge
            </button>
          ) : null}
        </div>
      </header>
    );
  }
);

SectionHeader.displayName =
  "SavingsChallengesSectionHeader";

/* =========================================================
   SUMMARY METRIC
========================================================= */

const SummaryMetric = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
  }) => (
    <div
      className="
        p-4 sm:p-5
        bg-white
        border border-slate-200 rounded-2xl
        shadow-sm
      "
    >
      <div
        className="
          flex items-start
          gap-3
        "
      >
        <div
          className="
            flex justify-center items-center
            w-9 h-9
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
        >
          <Icon size={17} />
        </div>

        <div
          className="
            min-w-0
          "
        >
          <p
            className="
              font-medium text-slate-500 text-xs
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-950 text-xl tracking-tight
            "
          >
            {value}
          </p>

          <p
            className="
              mt-0.5
              text-[11px] text-slate-400
            "
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
);

SummaryMetric.displayName =
  "SavingsChallengeSummaryMetric";

/* =========================================================
   NON-BLOCKING ERROR
========================================================= */

const RefreshWarning = memo(
  ({
    message,
    refreshing,
    onRetry,
    canRetry,
  }) => (
    <div
      className="
        flex items-start
        p-4
        bg-amber-50
        border border-amber-200 rounded-2xl
        gap-3
      "
      role="status"
      aria-live="polite"
    >
      <div
        className="
          flex justify-center items-center
          w-8 h-8
          text-amber-700
          bg-amber-100
          rounded-xl
          shrink-0
        "
      >
        <AlertCircle size={16} />
      </div>

      <div
        className="
          flex-1
          min-w-0
        "
      >
        <p
          className="
            font-semibold text-amber-900 text-sm
          "
        >
          Your challenge data may be outdated.
        </p>

        <p
          className="
            mt-0.5
            text-amber-700 text-xs leading-5
          "
        >
          {message}
        </p>
      </div>

      {canRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={refreshing}
          className="
            font-semibold text-amber-800 text-xs underline underline-offset-2
            disabled:opacity-50
            disabled:cursor-not-allowed
            shrink-0
          "
        >
          {refreshing
            ? "Retrying..."
            : "Retry"}
        </button>
      ) : null}
    </div>
  )
);

RefreshWarning.displayName =
  "SavingsChallengesRefreshWarning";

/* =========================================================
   PAGE
========================================================= */

const SavingsChallengesPage = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,

  limit,
  status,

  showHeader = true,
  showCreateButton = true,
  showRefreshButton = true,

  compact = false,

  onCreate,
  onChallengeClick,

  className = "",
}) => {
  /* =======================================================
     SERVER STATE
  ======================================================= */

  const challengeState =
    useSavingsChallenges() ?? {};

  const {
    challenges: hookChallenges,
    data,

    loading = false,
    isLoading = false,

    refreshing = false,
    isRefreshing = false,

    error = null,

    fetchChallenges,
    refetch,

    createChallenge,

    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,
  } = challengeState;

  /* =======================================================
     MUTATION LOCK
  ======================================================= */

  /*
   * Prevents double-clicks and duplicate mutation requests.
   *
   * A ref is deliberately used instead of state so clicking
   * an action twice in the same event loop cannot dispatch
   * two requests before React re-renders.
   */
  const mutationLockRef =
    useRef(false);

  /* =======================================================
     NORMALIZATION
  ======================================================= */

  const challenges = useMemo(() => {
    const source =
      hookChallenges ??
      data ??
      [];

    return resolveCollection(source)
      .map((challenge) => {
        try {
          return normalizeSavingsChallenge(
            challenge
          );
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }, [
    hookChallenges,
    data,
  ]);

  /* =======================================================
     REQUEST STATE
  ======================================================= */

  const initialLoading =
    Boolean(
      loading ||
        isLoading
    ) &&
    challenges.length === 0;

  const Refreshing =
    Boolean(
      refreshing ||
        isRefreshing
    );

  /* =======================================================
     ERROR
  ======================================================= */

  const errorMessage = useMemo(
    () =>
      error
        ? getErrorMessage(error)
        : null,
    [error]
  );

  /* =======================================================
     FILTER
  ======================================================= */

  const normalizedStatus =
    status
      ? normalizeStatus(status)
      : null;

  const filteredChallenges =
    useMemo(() => {
      if (!normalizedStatus) {
        return challenges;
      }

      return challenges.filter(
        (challenge) =>
          getChallengeStatus(
            challenge
          ) === normalizedStatus
      );
    }, [
      challenges,
      normalizedStatus,
    ]);

  const safeLimit = useMemo(
    () => sanitizeLimit(limit),
    [limit]
  );

  const visibleChallenges =
    useMemo(() => {
      if (!safeLimit) {
        return filteredChallenges;
      }

      return filteredChallenges.slice(
        0,
        safeLimit
      );
    }, [
      filteredChallenges,
      safeLimit,
    ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const total =
      filteredChallenges.length;

    const active =
      filteredChallenges.filter(
        isActive
      ).length;

    const paused =
      filteredChallenges.filter(
        isPaused
      ).length;

    const completed =
      filteredChallenges.filter(
        isCompleted
      ).length;

    return {
      total,
      active,
      paused,
      completed,
    };
  }, [
    filteredChallenges,
  ]);

  /* =======================================================
     MODAL STATE
  ======================================================= */

  const [
    selectedChallenge,
    setSelectedChallenge,
  ] = useState(null);

  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  /* =======================================================
     CAPABILITIES
  ======================================================= */

  const canRefresh =
    typeof refetch === "function" ||
    typeof fetchChallenges ===
      "function";

  const canCreate =
    typeof createChallenge ===
    "function";

  const canActivate =
    typeof activateChallenge ===
    "function";

  const canPause =
    typeof pauseChallenge ===
    "function";

  const canResume =
    typeof resumeChallenge ===
    "function";

  const canComplete =
    typeof completeChallenge ===
    "function";

  const canCancel =
    typeof cancelChallenge ===
    "function";

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    useCallback(async () => {
      if (
        mutationLockRef.current ||
        isRefreshing
      ) {
        return undefined;
      }

      if (
        typeof refetch === "function"
      ) {
        return refetch();
      }

      if (
        typeof fetchChallenges ===
        "function"
      ) {
        return fetchChallenges();
      }

      return undefined;
    }, [
      refetch,
      fetchChallenges,
      isRefreshing,
    ]);

  /* =======================================================
     CREATE MODAL
  ======================================================= */

  const handleOpenCreate =
    useCallback(() => {
      if (
        typeof onCreate ===
        "function"
      ) {
        onCreate();
        return;
      }

      if (canCreate) {
        setCreateModalOpen(true);
      }
    }, [
      onCreate,
      canCreate,
    ]);

  const handleCloseCreate =
    useCallback(() => {
      if (
        mutationLockRef.current
      ) {
        return;
      }

      setCreateModalOpen(false);
    }, []);

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreateChallenge =
    useCallback(
      async (payload) => {
        if (
          !canCreate ||
          mutationLockRef.current
        ) {
          return undefined;
        }

        mutationLockRef.current = true;

        try {
          const result =
            await createChallenge(
              payload
            );

          /*
           * The hook should update its cache/state.
           * We additionally reconcile from the server when
           * a refetch function exists.
           */
          if (
            typeof refetch ===
            "function"
          ) {
            await refetch();
          }

          setCreateModalOpen(false);

          return result;
        } finally {
          mutationLockRef.current =
            false;
        }
      },
      [
        canCreate,
        createChallenge,
        refetch,
      ]
    );

  /* =======================================================
     DETAILS
  ======================================================= */

  const handleChallengeClick =
    useCallback(
      (challenge) => {
        if (
          typeof onChallengeClick ===
          "function"
        ) {
          onChallengeClick(
            challenge
          );
          return;
        }

        setSelectedChallenge(
          challenge
        );
      },
      [
        onChallengeClick,
      ]
    );

  const handleCloseDetails =
    useCallback(() => {
      if (
        mutationLockRef.current
      ) {
        return;
      }

      setSelectedChallenge(null);
    }, []);

  /* =======================================================
     GENERIC MUTATION EXECUTOR
  ======================================================= */

  const executeMutation =
    useCallback(
      async (
        mutation,
        challenge,
        options = {}
      ) => {
        const id =
          getEntityId(
            challenge
          );

        if (
          !id ||
          typeof mutation !==
            "function" ||
          mutationLockRef.current
        ) {
          return undefined;
        }

        mutationLockRef.current =
          true;

        try {
          const result =
            await mutation(id);

          /*
           * Server remains authoritative.
           * Re-fetch after every successful
           * challenge state transition.
           */
          if (
            typeof refetch ===
            "function"
          ) {
            await refetch();
          }

          /*
           * If the currently selected challenge was
           * mutated, close the details modal so we do
           * not keep presenting stale state.
           */
          if (
            options.closeDetails
          ) {
            setSelectedChallenge(
              null
            );
          }

          return result;
        } finally {
          mutationLockRef.current =
            false;
        }
      },
      [refetch]
    );

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const handleActivate =
    useCallback(
      (challenge) =>
        executeMutation(
          activateChallenge,
          challenge
        ),
      [
        executeMutation,
        activateChallenge,
      ]
    );

  const handlePause =
    useCallback(
      (challenge) =>
        executeMutation(
          pauseChallenge,
          challenge
        ),
      [
        executeMutation,
        pauseChallenge,
      ]
    );

  const handleResume =
    useCallback(
      (challenge) =>
        executeMutation(
          resumeChallenge,
          challenge
        ),
      [
        executeMutation,
        resumeChallenge,
      ]
    );

  const handleComplete =
    useCallback(
      (challenge) =>
        executeMutation(
          completeChallenge,
          challenge,
          {
            closeDetails: true,
          }
        ),
      [
        executeMutation,
        completeChallenge,
      ]
    );

  const handleCancel =
    useCallback(
      (challenge) =>
        executeMutation(
          cancelChallenge,
          challenge,
          {
            closeDetails: true,
          }
        ),
      [
        executeMutation,
        cancelChallenge,
      ]
    );

  /* =======================================================
     INITIAL STATES
  ======================================================= */

  const hasChallenges =
    visibleChallenges.length > 0;

  const showInitialError =
    Boolean(error) &&
    !initialLoading &&
    challenges.length === 0;

  const showEmpty =
    !initialLoading &&
    !showInitialError &&
    !hasChallenges;

  /* =======================================================
     HEADER
  ======================================================= */

  const header = showHeader ? (
    <SectionHeader
      title={title}
      description={description}
      count={summary.total}
      onCreate={
        handleOpenCreate
      }
      onRefresh={
        handleRefresh
      }
      canCreate={
        showCreateButton &&
        (
          canCreate ||
          typeof onCreate ===
            "function"
        )
      }
      canRefresh={
        showRefreshButton &&
        canRefresh
      }
      refreshing={
        isRefreshing
      }
    />
  ) : null;

  /* =======================================================
     LOADING
  ======================================================= */

  if (initialLoading) {
    return (
      <section
        className={`
          w-full
          space-y-5
          ${className}
        `}
        aria-labelledby="savings-challenges-title"
        aria-busy="true"
      >
        {header}

        <div
          className="
            grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
            gap-4
          "
        >
          <SavingsSkeleton
            count={
              compact
                ? COMPACT_SKELETON_COUNT
                : DEFAULT_SKELETON_COUNT
            }
          />
        </div>

        <CreateChallengeModal
          open={createModalOpen}
          onClose={
            handleCloseCreate
          }
          onSubmit={
            handleCreateChallenge
          }
        />
      </section>
    );
  }

  /* =======================================================
     INITIAL ERROR
  ======================================================= */

  if (showInitialError) {
    return (
      <>
        <section
          className={`
            w-full
            space-y-5
            ${className}
          `}
          aria-labelledby="savings-challenges-title"
        >
          {header}

          <SavingsErrorState
            error={errorMessage}
            onRetry={
              canRefresh
                ? handleRefresh
                : undefined
            }
            retrying={
              isRefreshing
            }
          />
        </section>

        <CreateChallengeModal
          open={createModalOpen}
          onClose={
            handleCloseCreate
          }
          onSubmit={
            handleCreateChallenge
          }
        />
      </>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (showEmpty) {
    return (
      <>
        <section
          className={`
            w-full
            space-y-5
            ${className}
          `}
          aria-labelledby="savings-challenges-title"
        >
          {header}

          <ChallengeEmptyState
            onCreate={
              showCreateButton &&
              (
                canCreate ||
                typeof onCreate ===
                  "function"
              )
                ? handleOpenCreate
                : undefined
            }
          />
        </section>

        <CreateChallengeModal
          open={createModalOpen}
          onClose={
            handleCloseCreate
          }
          onSubmit={
            handleCreateChallenge
          }
        />
      </>
    );
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <>
      <section
        className={`
          w-full
          space-y-6
          ${className}
        `}
        aria-labelledby="savings-challenges-title"
        aria-busy={
          isRefreshing
        }
      >
        {header}

        {/* ===============================================
            SUMMARY
        =============================================== */}

        <section
          className="
            grid grid-cols-2 lg:grid-cols-4
            gap-3 sm:gap-4
          "
          aria-label="Savings challenge summary"
        >
          <SummaryMetric
            icon={Target}
            label="Total"
            value={
              summary.total
            }
            description="Available challenges"
          />

          <SummaryMetric
            icon={CheckCircle2}
            label="Active"
            value={
              summary.active
            }
            description="Currently running"
          />

          <SummaryMetric
            icon={Clock3}
            label="Paused"
            value={
              summary.paused
            }
            description="Temporarily paused"
          />

          <SummaryMetric
            icon={Trophy}
            label="Completed"
            value={
              summary.completed
            }
            description="Successfully finished"
          />
        </section>

        {/* ===============================================
            NON-BLOCKING ERROR
        =============================================== */}

        {errorMessage ? (
          <RefreshWarning
            message={
              errorMessage
            }
            refreshing={
              isRefreshing
            }
            onRetry={
              handleRefresh
            }
            canRetry={
              canRefresh
            }
          />
        ) : null}

        {/* ===============================================
            LIST HEADER
        =============================================== */}

        <div
          className="
            flex justify-between items-end
            gap-4
          "
        >
          <div>
            <h2
              className="
                font-bold text-slate-950 text-lg
              "
            >
              Your challenges
            </h2>

            <p
              className="
                mt-1
                text-slate-500 text-sm
              "
            >
              Stay consistent and make progress
              toward your savings goals.
            </p>
          </div>

          <span
            className="
              hidden sm:inline-flex items-center
              min-h-7
              px-3
              font-semibold text-slate-600 text-xs
              bg-white
              border border-slate-200 rounded-full
              gap-1 shrink-0
            "
          >
            {visibleChallenges.length}

            <span
              className="
                text-slate-400
              "
            >
              {visibleChallenges.length ===
              1
                ? "challenge"
                : "challenges"}
            </span>

            {safeLimit &&
            filteredChallenges.length >
              safeLimit ? (
              <>
                <ChevronRight
                  size={12}
                />

                <span>
                  showing {safeLimit}
                </span>
              </>
            ) : null}
          </span>
        </div>

        {/* ===============================================
            CHALLENGE GRID
        =============================================== */}

        <div
          className="
            grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
            gap-4
          "
        >
          {visibleChallenges.map(
            (
              challenge,
              index
            ) => (
              <article
                key={getChallengeKey(
                  challenge,
                  index
                )}
                className="
                  min-w-0
                "
              >
                <SavingsChallengeCard
                  challenge={
                    challenge
                  }
                  compact={
                    compact
                  }
                  onView={
                    handleChallengeClick
                  }
                  onActivate={
                    canActivate
                      ? handleActivate
                      : undefined
                  }
                  onPause={
                    canPause
                      ? handlePause
                      : undefined
                  }
                  onResume={
                    canResume
                      ? handleResume
                      : undefined
                  }
                  onComplete={
                    canComplete
                      ? handleComplete
                      : undefined
                  }
                  onCancel={
                    canCancel
                      ? handleCancel
                      : undefined
                  }
                />
              </article>
            )
          )}
        </div>

        {/* ===============================================
            BACKGROUND REFRESH
        =============================================== */}

        {isRefreshing ? (
          <div
            className="
              flex justify-center items-center
              pt-1
              text-slate-400 text-xs
              gap-2
            "
            role="status"
            aria-live="polite"
          >
            <RefreshCw
              size={13}
              className="
                animate-spin
              "
              aria-hidden="true"
            /
            >

            Updating your savings challenges...
          </div>
        ) : null}
      </section>

      {/* =================================================
          CREATE MODAL
      ================================================= */}

      <CreateChallengeModal
        open={createModalOpen}
        onClose={
          handleCloseCreate
        }
        onSubmit={
          handleCreateChallenge
        }
      />

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      <ChallengeDetailsModal
        open={
          Boolean(
            selectedChallenge
          )
        }
        challenge={
          selectedChallenge
        }
        onClose={
          handleCloseDetails
        }
        onActivate={
          selectedChallenge &&
          canActivate
            ? handleActivate
            : undefined
        }
        onPause={
          selectedChallenge &&
          canPause
            ? handlePause
            : undefined
        }
        onResume={
          selectedChallenge &&
          canResume
            ? handleResume
            : undefined
        }
        onComplete={
          selectedChallenge &&
          canComplete
            ? handleComplete
            : undefined
        }
        onCancel={
          selectedChallenge &&
          canCancel
            ? handleCancel
            : undefined
        }
      />
    </>
  );
};

SavingsChallengesPage.displayName =
  "SavingsChallengesPage";

export default memo(
  SavingsChallengesPage
);