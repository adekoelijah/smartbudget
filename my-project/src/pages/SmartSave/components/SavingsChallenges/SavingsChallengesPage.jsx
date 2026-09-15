import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  RefreshCw,
  Target,
  Trophy,
  Sparkles,
  TrendingUp,
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

/* ==========================================================================
   CONSTANTS
============================================================================ */

const DEFAULT_TITLE = "Savings Challenges";

const DEFAULT_DESCRIPTION =
  "Build consistent saving habits by completing structured challenges.";

const DEFAULT_ERROR =
  "We couldn't load your savings challenges.";

const DEFAULT_LIMIT = 20;
const MAX_SAFE_LIMIT = 100;

const STATUS = Object.freeze({
  ACTIVE: String(CHALLENGE_STATUS?.ACTIVE ?? "active")
    .trim()
    .toLowerCase(),

  PAUSED: String(CHALLENGE_STATUS?.PAUSED ?? "paused")
    .trim()
    .toLowerCase(),

  COMPLETED: String(CHALLENGE_STATUS?.COMPLETED ?? "completed")
    .trim()
    .toLowerCase(),

  CANCELLED: String(CHALLENGE_STATUS?.CANCELLED ?? "cancelled")
    .trim()
    .toLowerCase(),

  DRAFT: String(CHALLENGE_STATUS?.DRAFT ?? "draft")
    .trim()
    .toLowerCase(),
});

/* ==========================================================================
   HELPERS
============================================================================ */

const getEntityId = (entity) => {
  if (entity == null) {
    return null;
  }

  if (
    typeof entity === "string" ||
    typeof entity === "number"
  ) {
    const value = String(entity).trim();
    return value || null;
  }

  const value =
    entity?._id ??
    entity?.id ??
    entity?.challengeId ??
    null;

  if (value == null || value === "") {
    return null;
  }

  return String(value);
};

const getErrorMessage = (error) => {
  if (!error) {
    return DEFAULT_ERROR;
  }

  if (typeof error === "string") {
    return error.trim() || DEFAULT_ERROR;
  }

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error?.message ??
    error?.response?.data?.error ??
    error?.data?.message ??
    error?.data?.error?.message ??
    error?.data?.error ??
    error?.message ??
    error?.error;

  if (
    typeof message === "string" &&
    message.trim()
  ) {
    return message.trim();
  }

  return DEFAULT_ERROR;
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

const getChallengeKey = (challenge, index) => {
  const id = getEntityId(challenge);

  return id
    ? `challenge-${id}`
    : `challenge-${index}`;
};

const sanitizeLimit = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return DEFAULT_LIMIT;
  }

  const numeric = Number(value);

  if (
    !Number.isFinite(numeric) ||
    numeric <= 0
  ) {
    return DEFAULT_LIMIT;
  }

  return Math.min(
    Math.floor(numeric),
    MAX_SAFE_LIMIT
  );
};

/* ==========================================================================
   PAGE HEADER
============================================================================ */

const PageHeader = memo(
  ({
    title,
    description,
    count,
    onCreate,
    onRefresh,
    showCreate,
    showRefresh,
    refreshing,
    disabled,
  }) => {
    return (
      <header
        className="
          relative overflow-hidden
          bg-white
          border border-slate-200 rounded-[28px]
          shadow-[0_12px_40px_rgba(15,23,42,0.06)]
        "
        aria-labelledby="savings-challenges-title"
      >
        <div
          className="
            absolute
            w-64 h-64
            bg-blue-100/60
            rounded-full
            blur-3xl
            pointer-events-none
            -top-24 -right-24
          "
          aria-hidden="true"
        /
        >

        <div
          className="
            absolute
            w-52 h-52
            bg-indigo-50
            rounded-full
            blur-3xl
            pointer-events-none
            -bottom-28 -left-20
          "
          aria-hidden="true"
        /
        >

        <div
          className="
            relative flex flex-col lg:flex-row lg:justify-between
            lg:items-center
            p-5 sm:p-7 lg:p-8
            gap-7
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
                gap-4
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-12 h-12
                  text-white
                  bg-gradient-to-br from-blue-600 to-indigo-600
                  rounded-2xl ring-4 ring-blue-50
                  shadow-blue-600/20 shadow-lg
                  shrink-0
                "
                aria-hidden="true"
              >
                <Target
                  size={22}
                  strokeWidth={2}
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
                    gap-2.5
                  "
                >
                  <h1
                    id="savings-challenges-title"
                    className="
                      font-bold text-slate-950 text-2xl sm:text-3xl
                      tracking-tight
                    "
                  >
                    {title}
                  </h1>

                  <span
                    className="
                      inline-flex items-center
                      min-h-6
                      px-2.5
                      font-bold text-blue-700 text-xs
                      bg-blue-50
                      border border-blue-100 rounded-full
                    "
                  >
                    {count}
                  </span>
                </div>

                {description ? (
                  <p
                    className="
                      max-w-2xl
                      mt-2
                      text-slate-500 text-sm leading-6
                    "
                  >
                    {description}
                  </p>
                ) : null}

                <div
                  className="
                    flex flex-wrap items-center
                    mt-4
                    gap-2
                  "
                >
                  <span
                    className="
                      inline-flex items-center
                      px-2.5 py-1
                      font-semibold text-[11px] text-emerald-700
                      bg-emerald-50
                      rounded-full
                      gap-1.5
                    "
                  >
                    <span
                      className="
                        w-1.5 h-1.5
                        bg-emerald-500
                        rounded-full
                      "
                      aria-hidden="true"
                    /
                    >
                    Build saving consistency
                  </span>

                  <span
                    className="
                      inline-flex items-center
                      px-2.5 py-1
                      font-semibold text-[11px] text-slate-500
                      bg-slate-50
                      rounded-full
                      gap-1.5
                    "
                  >
                    Structured savings goals
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="
              flex flex-col sm:flex-row
              w-full lg:w-auto
              gap-2
            "
          >
            {showRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing || disabled}
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-4
                  font-semibold text-slate-700 text-sm
                  bg-white hover:bg-slate-50
                  border border-slate-200 hover:border-slate-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  disabled:opacity-60 shadow-sm transition
                  disabled:cursor-not-allowed
                  gap-2
                "
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : undefined
                  }
                  aria-hidden="true"
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            ) : null}

            {showCreate ? (
              <button
                type="button"
                onClick={onCreate}
                disabled={disabled}
                className="
                  inline-flex justify-center items-center
                  min-h-11
                  px-5
                  font-semibold text-white text-sm
                  bg-slate-950 hover:bg-slate-800
                  rounded-xl focus:outline-none
                  focus:ring-2 focus:ring-slate-950/20 focus:ring-offset-2
                  disabled:opacity-60 shadow-lg shadow-slate-950/15 transition
                  disabled:cursor-not-allowed
                  group gap-2
                "
              >
                <Plus
                  size={17}
                  aria-hidden="true"
                />

                New challenge
              </button>
            ) : null}
          </div>
        </div>
      </header>
    );
  }
);

PageHeader.displayName =
  "SavingsChallengesPageHeader";

/* ==========================================================================
   SUMMARY METRIC
============================================================================ */

const SUMMARY_STYLES = Object.freeze({
  blue: {
    icon: "bg-blue-50 text-blue-600",
    ring: "ring-blue-100",
  },

  green: {
    icon: "bg-emerald-50 text-emerald-600",
    ring: "ring-emerald-100",
  },

  amber: {
    icon: "bg-amber-50 text-amber-600",
    ring: "ring-amber-100",
  },

  violet: {
    icon: "bg-violet-50 text-violet-600",
    ring: "ring-violet-100",
  },

  slate: {
    icon: "bg-slate-100 text-slate-700",
    ring: "ring-slate-200",
  },
});

const SummaryMetric = memo(
  ({
    icon: Icon,
    label,
    value,
    description,
    accent = "slate",
  }) => {
    const styles =
      SUMMARY_STYLES[accent] ??
      SUMMARY_STYLES.slate;

    return (
      <article
        className="
          p-4 sm:p-5
          bg-white
          border border-slate-200 rounded-2xl
          shadow-sm hover:shadow-md transition
          group hover:-translate-y-0.5
        "
      >
        <div
          className="
            flex justify-between items-start
            gap-3
          "
        >
          <div
            className={`
              flex h-10 w-10
              shrink-0
              items-center justify-center
              rounded-xl
              ring-1
              ${styles.icon}
              ${styles.ring}
            `}
            aria-hidden="true"
          >
            <Icon
              size={18}
              strokeWidth={2}
            />
          </div>

          <span
            className="
              font-bold text-[10px] text-slate-400 uppercase tracking-wider
            "
          >
            SmartSave
          </span>
        </div>

        <div
          className="
            mt-5
          "
        >
          <p
            className="
              font-semibold text-slate-500 text-xs
            "
          >
            {label}
          </p>

          <p
            className="
              mt-1
              font-bold text-slate-950 text-2xl tracking-tight
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              text-[11px] text-slate-400 leading-5
            "
          >
            {description}
          </p>
        </div>
      </article>
    );
  }
);

SummaryMetric.displayName =
  "SavingsChallengeSummaryMetric";

/* ==========================================================================
   REFRESH WARNING
============================================================================ */

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
          w-9 h-9
          text-amber-700
          bg-amber-100
          rounded-xl
          shrink-0
        "
        aria-hidden="true"
      >
        <AlertCircle size={17} />
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
            mt-1
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

/* ==========================================================================
   PAGE
============================================================================ */

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
  /* ------------------------------------------------------------------------
     QUERY
  ------------------------------------------------------------------------ */

  const safeInitialLimit = useMemo(
    () => sanitizeLimit(limit),
    [limit]
  );

  const initialQuery = useMemo(
    () => ({
      page: 1,
      limit: safeInitialLimit,
      ...(status
        ? {
            status,
          }
        : {}),
    }),
    [safeInitialLimit, status]
  );

  /* ------------------------------------------------------------------------
     DATA
  ------------------------------------------------------------------------ */

  const {
    items = [],
    loading = false,
    error = null,
    mutating = false,
    mutationError = null,
    refresh,
    fetchChallenges,
    createChallenge,
    activateChallenge,
    pauseChallenge,
    resumeChallenge,
    completeChallenge,
    cancelChallenge,
    query,
  } = useSavingsChallenges({
    autoFetch: true,
    initialQuery,
  });

  /* ------------------------------------------------------------------------
     UI STATE
  ------------------------------------------------------------------------ */

  const [
    selectedChallenge,
    setSelectedChallenge,
  ] = useState(null);

  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  const mutationLockRef = useRef(false);

  /* ------------------------------------------------------------------------
     NORMALIZATION
  ------------------------------------------------------------------------ */

  const challenges = useMemo(() => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.reduce(
      (result, challenge) => {
        try {
          const normalized =
            normalizeSavingsChallenge(
              challenge
            );

          if (normalized) {
            result.push(normalized);
          }
        } catch (normalizationError) {
          console.warn(
            "[SavingsChallengesPage] Failed to normalize challenge:",
            normalizationError
          );
        }

        return result;
      },
      []
    );
  }, [items]);

  /* ------------------------------------------------------------------------
     FILTER
  ------------------------------------------------------------------------ */

  const normalizedStatus = useMemo(
    () =>
      status
        ? normalizeStatus(status)
        : null,
    [status]
  );

  const filteredChallenges = useMemo(() => {
    if (!normalizedStatus) {
      return challenges;
    }

    return challenges.filter(
      (challenge) =>
        getChallengeStatus(challenge) ===
        normalizedStatus
    );
  }, [
    challenges,
    normalizedStatus,
  ]);

  const visibleChallenges = useMemo(
    () =>
      filteredChallenges.slice(
        0,
        safeInitialLimit
      ),
    [
      filteredChallenges,
      safeInitialLimit,
    ]
  );

  /* ------------------------------------------------------------------------
     SUMMARY
  ------------------------------------------------------------------------ */

  const summary = useMemo(() => {
    let active = 0;
    let paused = 0;
    let completed = 0;

    for (const challenge of filteredChallenges) {
      const challengeStatus =
        getChallengeStatus(challenge);

      switch (challengeStatus) {
        case STATUS.ACTIVE:
          active += 1;
          break;

        case STATUS.PAUSED:
          paused += 1;
          break;

        case STATUS.COMPLETED:
          completed += 1;
          break;

        default:
          break;
      }
    }

    return {
      total: filteredChallenges.length,
      active,
      paused,
      completed,
    };
  }, [filteredChallenges]);

  /* ------------------------------------------------------------------------
     CAPABILITIES
  ------------------------------------------------------------------------ */

  const canRefresh =
    typeof refresh === "function" ||
    typeof fetchChallenges === "function";

  const canCreate =
    typeof createChallenge === "function";

  const canActivate =
    typeof activateChallenge === "function";

  const canPause =
    typeof pauseChallenge === "function";

  const canResume =
    typeof resumeChallenge === "function";

  const canComplete =
    typeof completeChallenge === "function";

  const canCancel =
    typeof cancelChallenge === "function";

  /* ------------------------------------------------------------------------
     VIEW STATE
  ------------------------------------------------------------------------ */

  const initialLoading =
    loading && challenges.length === 0;

  const refreshing =
    loading && challenges.length > 0;

  const errorMessage = useMemo(
    () =>
      error
        ? getErrorMessage(error)
        : null,
    [error]
  );

  const showInitialError =
    Boolean(error) &&
    !initialLoading &&
    challenges.length === 0;

  const hasChallenges =
    visibleChallenges.length > 0;

  const showEmpty =
    !initialLoading &&
    !showInitialError &&
    !hasChallenges;


  /* ------------------------------------------------------------------------
     REFRESH
  ------------------------------------------------------------------------ */

  const handleRefresh = useCallback(
    async () => {
      if (
        mutationLockRef.current ||
        loading
      ) {
        return;
      }

      try {
        if (typeof refresh === "function") {
          await refresh();
          return;
        }

        if (
          typeof fetchChallenges ===
          "function"
        ) {
          await fetchChallenges(query);
        }
      } catch (refreshError) {
        console.error(
          "[SavingsChallengesPage] Refresh failed:",
          refreshError
        );
      }
    },
    [
      refresh,
      fetchChallenges,
      query,
      loading,
    ]
  );

  /* ------------------------------------------------------------------------
     CREATE
  ------------------------------------------------------------------------ */

  const handleOpenCreate = useCallback(() => {
    if (mutationLockRef.current) {
      return;
    }

    if (typeof onCreate === "function") {
      onCreate();
      return;
    }

    setCreateModalOpen(true);
  }, [onCreate]);

  const handleCloseCreate = useCallback(() => {
    if (mutationLockRef.current) {
      return;
    }

    setCreateModalOpen(false);
  }, []);

  const handleCreateChallenge =
    useCallback(
      async (payload) => {
        if (mutationLockRef.current) {
          return;
        }

        if (
          typeof createChallenge !==
          "function"
        ) {
          console.error(
            "[SavingsChallengesPage] createChallenge() is unavailable."
          );

          return;
        }

        mutationLockRef.current = true;

        try {
          await createChallenge(payload);

          setCreateModalOpen(false);
        } catch (createError) {
          console.error(
            "[SavingsChallengesPage] Failed to create challenge:",
            createError
          );

          throw createError;
        } finally {
          mutationLockRef.current = false;
        }
      },
      [createChallenge]
    );

  /* ------------------------------------------------------------------------
     DETAILS
  ------------------------------------------------------------------------ */

  const handleChallengeClick =
    useCallback(
      (challenge) => {
        if (
          typeof onChallengeClick ===
          "function"
        ) {
          onChallengeClick(challenge);
          return;
        }

        setSelectedChallenge(challenge);
      },
      [onChallengeClick]
    );

  const handleCloseDetails =
    useCallback(() => {
      if (mutationLockRef.current) {
        return;
      }

      setSelectedChallenge(null);
    }, []);

  /* ------------------------------------------------------------------------
     MUTATIONS
  ------------------------------------------------------------------------ */

  const executeMutation = useCallback(
    async (
      mutation,
      challenge,
      closeDetails = false
    ) => {
      const challengeId =
        getEntityId(challenge);

      if (
        !challengeId ||
        typeof mutation !== "function" ||
        mutationLockRef.current
      ) {
        return;
      }

      mutationLockRef.current = true;

      try {
        const result =
          await mutation(challengeId);

        if (closeDetails) {
          setSelectedChallenge(null);
        }

        return result;
      } catch (mutationError) {
        console.error(
          "[SavingsChallengesPage] Challenge mutation failed:",
          mutationError
        );

        throw mutationError;
      } finally {
        mutationLockRef.current = false;
      }
    },
    []
  );

  const handleActivate = useCallback(
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

  const handlePause = useCallback(
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

  const handleResume = useCallback(
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

  const handleComplete = useCallback(
    (challenge) =>
      executeMutation(
        completeChallenge,
        challenge,
        true
      ),
    [
      executeMutation,
      completeChallenge,
    ]
  );

  const handleCancel = useCallback(
    (challenge) =>
      executeMutation(
        cancelChallenge,
        challenge,
        true
      ),
    [
      executeMutation,
      cancelChallenge,
    ]
  );

  /* ------------------------------------------------------------------------
     SHARED COMPONENTS
  ------------------------------------------------------------------------ */

  const header = showHeader ? (
    <PageHeader
      title={title}
      description={description}
      count={summary.total}
      onCreate={handleOpenCreate}
      onRefresh={handleRefresh}
      showCreate={
        showCreateButton &&
        (canCreate ||
          typeof onCreate === "function")
      }
      showRefresh={
        showRefreshButton &&
        canRefresh
      }
      refreshing={refreshing}
      disabled={mutating}
    />
  ) : null;

  const createModal = (
    <CreateChallengeModal
      open={createModalOpen}
      onClose={handleCloseCreate}
      onSubmit={handleCreateChallenge}
      creating={mutating}
      error={mutationError}
    />
  );

  /* ------------------------------------------------------------------------
     INITIAL LOADING
  ------------------------------------------------------------------------ */

  if (initialLoading) {
    return (
      <>
        <section
          className={`
            w-full
            space-y-5
            ${className}
          `}
          aria-labelledby="savings-challenges-title"
          aria-busy="true">
          {header}

          <div
            className="
              grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
              gap-4
            "
          >
            <SavingsSkeleton
              count={compact ? 2 : 3}
            />
          </div>
        </section>

        {createModal}
      </>
    );
  }

  /* ------------------------------------------------------------------------
     INITIAL ERROR
  ------------------------------------------------------------------------ */

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
            retrying={refreshing}
          />
        </section>

        {createModal}
      </>
    );
  }

  /* ------------------------------------------------------------------------
     EMPTY
  ------------------------------------------------------------------------ */

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
              (canCreate ||
                typeof onCreate === "function")
                ? handleOpenCreate
                : undefined
            }
          />
        </section>

        {createModal}
      </>
    );
  }

  /* ------------------------------------------------------------------------
     MAIN PAGE
  ------------------------------------------------------------------------ */

  return (
    <>
      <section
        className={`
          w-full
          space-y-6
          ${className}
        `}
        aria-labelledby="savings-challenges-title"
        aria-busy={refreshing}
      >
        {header}

        {/* ================================================================
            SUMMARY
        ================================================================= */}

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
            value={summary.total}
            description="Available challenges"
            accent="blue"
          />

          <SummaryMetric
            icon={CheckCircle2}
            label="Active"
            value={summary.active}
            description="Currently running"
            accent="green"
          />

          <SummaryMetric
            icon={Clock3}
            label="Paused"
            value={summary.paused}
            description="Temporarily paused"
            accent="amber"
          />

          <SummaryMetric
            icon={Trophy}
            label="Completed"
            value={summary.completed}
            description="Successfully finished"
            accent="violet"
          />
        </section>

        {/* ================================================================
            BACKGROUND ERROR
        ================================================================= */}

        {errorMessage ? (
          <RefreshWarning
            message={errorMessage}
            refreshing={refreshing}
            onRetry={handleRefresh}
            canRetry={canRefresh}
          />
        ) : null}

        {/* ================================================================
            LIST HEADER
        ================================================================= */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-end
            gap-3
          "
        >
          <div>
            <div
              className="
                flex items-center
                gap-2
              "
            >
              <div
                className="
                  flex justify-center items-center
                  w-8 h-8
                  text-blue-600
                  bg-blue-50
                  rounded-lg
                "
                aria-hidden="true"
              >
                <Sparkles size={16} />
              </div>

              <h2
                className="
                  font-bold text-slate-950 text-lg
                "
              >
                Your challenges
              </h2>
            </div>

            <p
              className="
                mt-1
                text-slate-500 text-sm
              "
            >
              Stay consistent and make measurable
              progress toward your savings goals.
            </p>
          </div>

          <div
            className="
              inline-flex items-center
              w-fit
              px-3 py-1.5
              font-semibold text-slate-600 text-xs
              bg-white
              border border-slate-200 rounded-full
              shadow-sm
              gap-2
            "
          >
            <TrendingUp
              size={13}
              className="
                text-emerald-600
              "
              aria-hidden="true"
            /
            >

            <span>
              {visibleChallenges.length}
            </span>

            <span
              className="
                text-slate-400
              "
            >
              {visibleChallenges.length === 1
                ? "challenge"
                : "challenges"}
            </span>

            {filteredChallenges.length >
            safeInitialLimit ? (
              <>
                <ChevronRight
                  size={12}
                  className="
                    text-slate-300
                  "
                  aria-hidden="true"
                /
                >

                <span
                  className="
                    text-slate-400
                  "
                >
                  showing {safeInitialLimit}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* ================================================================
            CHALLENGE GRID
        ================================================================= */}

        <div
          className="
            grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
            gap-4
          "
        >
          {visibleChallenges.map(
            (challenge, index) => (
              <div
                key={getChallengeKey(
                  challenge,
                  index
                )}
                className="
                  min-w-0
                "
              >
                <SavingsChallengeCard
                  challenge={challenge}
                  compact={compact}
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
              </div>
            )
          )}
        </div>

        {/* ================================================================
            BACKGROUND REFRESH
        ================================================================= */}

        {refreshing ? (
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

        {/* ================================================================
            MUTATION ACCESSIBILITY STATUS
        ================================================================= */}

        {mutating ? (
          <span
            className="
              sr-only
            "
            role="status"
            aria-live="polite"
          >
            Updating savings challenge...
          </span>
        ) : null}
      </section>

      {/* ====================================================================
          CREATE MODAL
      ================================================================= */}

      {createModal}

      {/* ====================================================================
          DETAILS MODAL
      ================================================================= */}

      <ChallengeDetailsModal
        open={Boolean(selectedChallenge)}
        challenge={selectedChallenge}
        onClose={handleCloseDetails}
        onActivate={
          selectedChallenge && canActivate
            ? handleActivate
            : undefined
        }
        onPause={
          selectedChallenge && canPause
            ? handlePause
            : undefined
        }
        onResume={
          selectedChallenge && canResume
            ? handleResume
            : undefined
        }
        onComplete={
          selectedChallenge && canComplete
            ? handleComplete
            : undefined
        }
        onCancel={
          selectedChallenge && canCancel
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